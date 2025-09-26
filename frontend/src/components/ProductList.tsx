import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
} from '@mui/material'
import { 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  Visibility as ViewIcon,
  EditNote as EditNoteIcon,
  AddShoppingCart as AddShoppingCartIcon
} from '@mui/icons-material'
import { Product } from '../types/product'
import { deleteProduct, addToCart } from '../services/api'
import { styled } from '@mui/system'
import { useState } from 'react'
import EditProductDialog from './EditProductDialog'
import ProductDetailsDialog from './ProductDetailsDialog'
import DeleteConfirmDialog from './DeleteConfirmDialog'

const ProductCard = styled(Card)`
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
`

const ProductContent = styled(CardContent)`
  flex-grow: 1;
`

const PriceTypography = styled(Typography)`
  color: #1976d2;
  font-weight: 600;
  margin-top: 8px;
`



interface ProductListProps {
  products: Product[]
  onProductDeleted: () => void
  onCartUpdated?: () => void
}

function ProductList({ products, onProductDeleted, onCartUpdated }: ProductListProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart({ product_id: product.id, quantity: 1 })
      onCartUpdated?.()
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }
  
  const handleDelete = async (product: Product) => {
    try {
      await deleteProduct(product.id)
      onProductDeleted()
    } catch (error) {
      console.error('Error deleting product:', error)
      // Re-throw the error so the calling code can handle it
      throw error
    }
  }

  if (products.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography variant="h6" color="text.secondary">
          No products available
        </Typography>
      </Box>
    )
  }

  return (
    <>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {products.map(product => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <ProductCard>
            <ProductContent 
              sx={{ cursor: 'pointer' }}
              onClick={() => setSelectedProduct(product)}
            >
              <Typography variant="h6" component="h2" gutterBottom>
                {product.name}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  height: '3em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {product.description}
              </Typography>
              <PriceTypography variant="h6">
                ${product.price.toFixed(2)}
              </PriceTypography>
              <Typography
                variant="body2"
                sx={{
                  color: product.stock > 0 ? 'success.main' : 'error.main',
                  mt: 1
                }}
              >
                {product.stock > 0 ? `In Stock: ${product.stock}` : 'Out of Stock'}
              </Typography>
            </ProductContent>
            <CardActions sx={{ 
              justifyContent: 'flex-end', 
              padding: 2,
              gap: 1 
            }}>
              <Button
                size="small"
                startIcon={<AddShoppingCartIcon />}
                variant="contained"
                color="primary"
                disabled={product.stock <= 0}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(product);
                }}
              >
                Add to Cart
              </Button>
              <Button
                size="small"
                startIcon={<ViewIcon />}
                variant="outlined"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedProduct(product);
                }}
              >
                View
              </Button>
              <Button
                size="small"
                startIcon={<EditNoteIcon />}
                variant="outlined"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingProduct(product);
                }}
              >
                Edit
              </Button>
              <Button
                size="small"
                startIcon={<DeleteIcon />}
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeletingProduct(product);
                }}
                variant="outlined"
              >
                Delete
              </Button>
            </CardActions>
          </ProductCard>
        </Grid>
      ))}
    </Grid>
    <EditProductDialog
      open={Boolean(editingProduct)}
      onClose={() => setEditingProduct(null)}
      product={editingProduct}
      onProductUpdated={onProductDeleted}
    />
    <ProductDetailsDialog
      open={Boolean(selectedProduct)}
      onClose={() => setSelectedProduct(null)}
      product={selectedProduct}
      onEdit={() => {
        setEditingProduct(selectedProduct);
        setSelectedProduct(null);
      }}
      onDelete={() => {
        setDeletingProduct(selectedProduct);
        setSelectedProduct(null);
      }}
    />
    <DeleteConfirmDialog
      open={Boolean(deletingProduct)}
      onClose={() => setDeletingProduct(null)}
      product={deletingProduct}
      onConfirm={async () => {
        if (deletingProduct) {
          try {
            await handleDelete(deletingProduct);
            setDeletingProduct(null);
          } catch (error) {
            console.error('Failed to delete product:', error);
            // Keep the dialog open if there's an error
          }
        }
      }}
    />
    </>
  )
}

export default ProductList
