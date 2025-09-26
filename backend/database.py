from sqlalchemy import Column, Float, Integer, String, ForeignKey
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

from config import settings

engine = create_async_engine(settings.database_url, echo=settings.debug)
AsyncSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine, class_=AsyncSession
)

Base = declarative_base()


class Product(Base):
    __tablename__ = "products"

    id: int = Column(Integer, primary_key=True, index=True)
    name: str = Column(String, unique=True, index=True)
    price: float = Column(Float, index=True)
    description: str | None = Column(String, index=True, nullable=True)
    stock: int = Column(Integer, index=True)
    cart_items = relationship("CartItem", back_populates="product", lazy="noload")


class CartItem(Base):
    __tablename__ = "cart_items"

    id: int = Column(Integer, primary_key=True, index=True)
    product_id: int = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"))
    quantity: int = Column(Integer, default=1)
    product = relationship("Product", back_populates="cart_items", lazy="joined")


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
