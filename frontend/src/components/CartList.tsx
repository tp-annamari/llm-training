import { useEffect, useState } from 'react'
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  Typography,
  Box,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { CartItem } from '../types/cart'
import { getCartItems, removeFromCart } from '../services/api'

interface CartListProps {
  onCartUpdated?: () => void
}

export default function CartList({ onCartUpdated }: CartListProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  const fetchCartItems = async () => {
    try {
      const items = await getCartItems()
      setCartItems(items)
    } catch (error) {
      console.error('Error fetching cart items:', error)
    }
  }

  const handleRemoveFromCart = async (id: number) => {
    try {
      await removeFromCart(id)
      await fetchCartItems()
      onCartUpdated?.() // Notify parent that cart was updated
    } catch (error) {
      console.error('Error removing item from cart:', error)
    }
  }

  useEffect(() => {
    fetchCartItems()
  }, [])

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  // Don't render if cart is empty
  if (cartItems.length === 0) {
    return null
  }

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: 320,
        maxHeight: '50vh',
        overflow: 'auto',
        zIndex: 1000,
        p: 2,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        borderRadius: '12px',
      }}
    >
      <Typography variant="h6" gutterBottom>
        Shopping Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
      </Typography>
      <List dense>
        {cartItems.map((item) => (
          <ListItem
            key={item.id}
            secondaryAction={
              <IconButton
                edge="end"
                aria-label="delete"
                size="small"
                onClick={() => handleRemoveFromCart(item.id)}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={item.product.name}
              secondary={`${item.quantity} × $${item.product.price.toFixed(2)}`}
            />
          </ListItem>
        ))}
      </List>
      <Box sx={{ mt: 2, borderTop: 1, pt: 1, borderColor: 'divider' }}>
        <Typography variant="h6">
          Total: ${totalPrice.toFixed(2)}
        </Typography>
      </Box>
    </Paper>
  )
}