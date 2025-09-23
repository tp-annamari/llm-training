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

export default function CartList() {
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

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 20,
        left: 20,
        width: 300,
        maxHeight: '40vh',
        overflow: 'auto',
        zIndex: 1000,
        p: 2,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Shopping Cart
      </Typography>
      <List>
        {cartItems.map((item) => (
          <ListItem
            key={item.id}
            secondaryAction={
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleRemoveFromCart(item.id)}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={item.product.name}
              secondary={`${item.quantity} x $${item.product.price}`}
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