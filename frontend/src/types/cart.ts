import { Product } from './product'

export interface CartItem {
  id: number
  product_id: number
  quantity: number
  product: Product
}

export interface CartItemCreate {
  product_id: number
  quantity: number
}