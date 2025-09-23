from contextlib import asynccontextmanager
from typing import List

from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from database import Product, create_tables, get_db

from fastapi.middleware.cors import CORSMiddleware


class ProductDTO(BaseModel):
    name: str
    price: float
    description: str | None = None
    stock: int


class ProductUpdateDTO(BaseModel):
    name: str
    price: float
    description: str | None = None
    stock: int


class ProductResponse(BaseModel):
    id: int
    name: str
    price: float
    description: str | None = None
    stock: int

    class Config:
        from_attributes = True


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:8011", "http://127.0.0.1:8011"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
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

    # Check if the new name conflicts with another product
    if product.name != productUpdateDTO.name:
        name_check = await db.execute(select(Product).filter(Product.name == productUpdateDTO.name))
        existing_product = name_check.first()
        if existing_product and existing_product[0].id != id:
            raise HTTPException(status_code=400, detail="Product with this name already exists")

    product.name = productUpdateDTO.name
    product.price = productUpdateDTO.price
    product.description = productUpdateDTO.description
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


if __name__ == "__main__":
    import uvicorn
    import os
    # Clear the app.db for testing
    db_path = os.path.join(os.path.dirname(__file__), "app.db")
    if os.path.exists(db_path):
        os.remove(db_path)
    uvicorn.run(app, host="0.0.0.0", port=8011)
