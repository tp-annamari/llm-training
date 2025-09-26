import { useState, useEffect } from 'react'
import { Container, Typography, Paper, Box } from '@mui/material'
import { styled } from '@mui/system'
import ProductList from './components/ProductList'
import ProductToolbar from './components/ProductToolbar'
import AddProductPage from './components/AddProductPage'
import CartList from './components/CartList'
import { getProducts, getCartItems } from './services/api'
import { Product } from './types/product'
import { CartItem } from './types/cart'

const StyledContainer = styled(Container)`
  margin-top: 3rem;
  margin-bottom: 3rem;
`

const Header = styled(Paper)`
  padding: 2.5rem;
  margin-bottom: 3rem;
  background: linear-gradient(45deg, #1976d2, #2196f3);
  text-align: center;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(25, 118, 210, 0.2);
`

const HeaderText = styled(Typography)({
  color: 'white',
  fontWeight: 600,
  letterSpacing: '0.5px'
})

function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isAddPageVisible, setIsAddPageVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [cartUpdateTrigger, setCartUpdateTrigger] = useState(0)
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  const loadProducts = async () => {
    try {
      const data = await getProducts()
      setProducts(data)
      setFilteredProducts(data)
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }

  const loadCartItems = async () => {
    try {
      const data = await getCartItems()
      setCartItems(data)
    } catch (error) {
      console.error('Error loading cart items:', error)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    const lowercaseQuery = query.toLowerCase()
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery)
    )
    setFilteredProducts(filtered)
  }

  useEffect(() => {
    loadProducts()
    loadCartItems()
  }, [])

  if (isAddPageVisible) {
    return (
      <AddProductPage
        onClose={() => setIsAddPageVisible(false)}
        onProductAdded={loadProducts}
      />
    )
  }

  return (
    <StyledContainer>
      <Header>
        <HeaderText variant="h3">
          Product Management System
        </HeaderText>
      </Header>
      <ProductToolbar 
        onSearch={handleSearch}
        onAddClick={() => setIsAddPageVisible(true)}
        cartItemCount={cartItems.length}
      />
      <ProductList 
        products={filteredProducts} 
        onProductDeleted={loadProducts} 
        onCartUpdated={() => {
          setCartUpdateTrigger(prev => prev + 1)
          loadProducts() // Reload products to show updated stock
          loadCartItems() // Reload cart items
        }}
      />
      <CartList 
        key={cartUpdateTrigger} 
        onCartUpdated={() => {
          loadProducts()
          loadCartItems()
        }}
      />
    </StyledContainer>
  )
}

export default App
