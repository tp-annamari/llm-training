from contextlib import asynccontextmanager
from typing import List
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
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

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8011",
    "http://127.0.0.1:8011"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600
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
    # Check if product exists and has enough stock
    result = await db.execute(
        select(Product).filter(Product.id == cart_item.product_id)
    )
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product.stock < cart_item.quantity:
        raise HTTPException(status_code=400, detail="Not enough stock available")
    
    # Create cart item
    db_cart_item = CartItem(
        product_id=cart_item.product_id,
        quantity=cart_item.quantity
    )
    
    # Update product stock
    product.stock -= cart_item.quantity
    
    db.add(db_cart_item)
    await db.commit()
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
    
    # Restore product stock
    product_result = await db.execute(select(Product).filter(Product.id == cart_item.product_id))
    product = product_result.scalar_one_or_none()
    if product:
        product.stock += cart_item.quantity
    
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
