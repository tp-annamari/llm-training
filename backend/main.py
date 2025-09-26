from contextlib import asynccontextmanager
from typing import List
import logging
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from config import settings
from database import Product, CartItem, create_tables, get_db


class ProductDTO(BaseModel):
    name: str
    price: float
    description: str | None = None
    stock: int


class ProductUpdateDTO(BaseModel):
    name: str | None = None
    price: float | None = None
    description: str | None = None
    stock: int | None = None


class ProductResponse(BaseModel):
    id: int
    name: str
    price: float
    description: str | None = None
    stock: int

    class Config:
        from_attributes = True


class CartItemDTO(BaseModel):
    product_id: int
    quantity: int


class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: ProductResponse

    class Config:
        from_attributes = True


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Enable GZip compression
app.add_middleware(GZipMiddleware)

# Configure CORS - this must be the first middleware after GZip
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

@app.get("/")
async def root():
    return {"message": "Welcome to FastAPI Template"}


@app.post("/products/", response_model=ProductResponse)
async def create_product(product: ProductDTO, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).filter(Product.name == product.name))
    db_product = result.first()

    if db_product:
        raise HTTPException(status_code=400, detail="Product already exists")

    db_product = Product(
        name=product.name,
        price=product.price,
        description=product.description,
        stock=product.stock,
    )
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    return db_product


@app.get("/products/", response_model=List[ProductResponse])
async def get_products(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product))
    products = result.scalars().all()
    return products


@app.get("/products/{id}", response_model=ProductResponse)
async def get_product_by_id(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).filter(Product.id == id))
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(status_code=404, detail="Product with given id not found")

    return product


@app.put("/products/{id}", response_model=ProductResponse)
async def put_product(
    id: int, productUpdateDTO: ProductUpdateDTO, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Product).filter(Product.id == id))
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(status_code=404, detail="Product with given id not found")

    # Only check name conflict if name is being updated
    if productUpdateDTO.name is not None and product.name != productUpdateDTO.name:
        name_check = await db.execute(select(Product).filter(Product.name == productUpdateDTO.name))
        existing_product = name_check.first()
        if existing_product and existing_product[0].id != id:
            raise HTTPException(status_code=400, detail="Product with this name already exists")
        product.name = productUpdateDTO.name

    if productUpdateDTO.price is not None:
        product.price = productUpdateDTO.price
    if productUpdateDTO.description is not None:
        product.description = productUpdateDTO.description
    if productUpdateDTO.stock is not None:
        product.stock = productUpdateDTO.stock

    await db.commit()
    await db.refresh(product)
    return product

@app.delete("/products/{id}")
async def delete_product(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).filter(Product.id == id))
    db_product = result.scalar_one_or_none()
    
    if not db_product:
        raise HTTPException(status_code=404, detail="Product with given id not found")
    
    await db.delete(db_product)
    await db.commit()
    return {"message": "Product deleted successfully"}


@app.post("/cart/", response_model=CartItemResponse)
async def add_to_cart(cart_item: CartItemDTO, db: AsyncSession = Depends(get_db)):
    # Use explicit transaction with pessimistic locking to prevent race conditions
    async with db.begin():
        try:
            # Build select statement with conditional pessimistic locking based on database dialect
            stmt = select(Product).filter(Product.id == cart_item.product_id)
            
            # Check database dialect and apply FOR UPDATE only if supported
            # SQLite doesn't support row-level locking, but PostgreSQL, MySQL, MariaDB, Oracle do
            # For SQLite, we rely on the transaction isolation to provide some protection
            dialect_name = db.get_bind().dialect.name.lower()
            if dialect_name in ('postgresql', 'mysql', 'mariadb', 'oracle'):
                stmt = stmt.with_for_update()
                logging.debug(f"Using pessimistic locking (FOR UPDATE) with {dialect_name} database")
            else:
                logging.debug(f"Skipping pessimistic locking for {dialect_name} database (not supported)")
            
            # Execute the statement (with or without FOR UPDATE based on dialect)
            result = await db.execute(stmt)
            product = result.scalar_one_or_none()
            
            if not product:
                raise HTTPException(status_code=404, detail="Product not found")
            
            # Validate stock availability within the locked transaction
            # This check must happen while the row is locked to prevent race conditions
            if product.stock < cart_item.quantity:
                raise HTTPException(status_code=400, detail="Not enough stock available")
            
            # Reserve stock by decrementing it within the locked transaction
            product.stock -= cart_item.quantity
            
            # Create and add cart item only after stock is successfully reserved
            db_cart_item = CartItem(
                product_id=cart_item.product_id,
                quantity=cart_item.quantity
            )
            db.add(db_cart_item)
            
            # Transaction will be committed automatically when exiting the context
            # If any exception occurs, transaction will be rolled back automatically
            
        except HTTPException:
            # Re-raise HTTP exceptions (they will trigger rollback)
            raise
        except Exception as e:
            # Log unexpected errors and re-raise as internal server error
            logging.error(f"Unexpected error in add_to_cart: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    # Refresh the cart item to get the latest state after commit
    await db.refresh(db_cart_item)
    
    # Load the product relationship
    await db.refresh(db_cart_item, ['product'])
    return db_cart_item


@app.get("/cart/", response_model=List[CartItemResponse])
async def get_cart_items(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CartItem).options(selectinload(CartItem.product))
    )
    cart_items = result.scalars().unique().all()
    return cart_items


@app.delete("/cart/{id}")
async def remove_from_cart(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CartItem).filter(CartItem.id == id))
    cart_item = result.scalar_one_or_none()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    # Restore product stock - handle edge case where product might have been deleted
    product_result = await db.execute(select(Product).filter(Product.id == cart_item.product_id))
    product = product_result.scalar_one_or_none()
    
    if product:
        # Product exists, restore the stock
        product.stock += cart_item.quantity
    else:
        # Product was deleted after being added to cart - log this edge case for debugging/metrics
        logging.warning(
            f"Cannot restore stock for cart item {id}: "
            f"Product {cart_item.product_id} no longer exists in database. "
            f"Cart item will be removed but {cart_item.quantity} units cannot be restored to stock."
        )
    
    # Always delete the cart item and commit, regardless of product existence
    await db.delete(cart_item)
    await db.commit()
    return {"message": "Item removed from cart"}


if __name__ == "__main__":
    import uvicorn
    import os
    # Clear the app.db for testing
    db_path = os.path.join(os.path.dirname(__file__), "app.db")
    if os.path.exists(db_path):
        os.remove(db_path)
    uvicorn.run(app, host="0.0.0.0", port=8011)
