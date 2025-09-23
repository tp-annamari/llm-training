export interface Product {
  id: number
  name: string
  price: number
  description: string
  stock: number
}

export interface ProductCreate {
  name: string
  price: number
  description: string
  stock: number
}

export interface ProductUpdate {
  price: number
  stock: number
}
