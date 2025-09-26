import axios from 'axios'
import type { Product, ProductCreate, ProductUpdate } from '../types/product'
import type { CartItem, CartItemCreate } from '../types/cart'

const API_URL = 'http://localhost:8011'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
})

export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get('/products/')
  return response.data
}

export const getProduct = async (id: number): Promise<Product> => {
  const response = await api.get(`/products/${id}`)
  return response.data
}

export const createProduct = async (product: ProductCreate): Promise<Product> => {
  const response = await api.post('/products/', product)
  return response.data
}

export const updateProduct = async (
  id: number,
  product: ProductUpdate
): Promise<Product> => {
  const response = await api.put(`/products/${id}`, product)
  return response.data
}

export const deleteProduct = async (id: number): Promise<void> => {
  await api.delete(`/products/${id}`)
}

export const getCartItems = async (): Promise<CartItem[]> => {
  const response = await api.get('/cart/')
  return response.data
}

export const addToCart = async (item: CartItemCreate): Promise<CartItem> => {
  const response = await api.post('/cart/', item)
  return response.data
}

export const removeFromCart = async (id: number): Promise<void> => {
  await api.delete(`/cart/${id}`)
}
