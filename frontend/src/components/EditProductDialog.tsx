import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  Typography,
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { styled } from '@mui/system'
import { useState, useEffect } from 'react'
import { Product, ProductUpdate } from '../types/product'
import { updateProduct } from '../services/api'

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '12px',
    padding: '16px'
  }
}))

const DialogHeader = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`

const StyledDialogTitle = styled(DialogTitle)`
  padding: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1976d2;
`

const CloseButton = styled(IconButton)`
  color: #666;
  &:hover {
    color: #1976d2;
  }
`

const StyledTextField = styled(TextField)`
  & .MuiOutlinedInput-root {
    border-radius: 8px;
    background-color: white;
    
    &:hover {
      background-color: #f8f9fa;
    }
    
    &.Mui-focused {
      background-color: white;
      box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
    }
  }
`

const StyledDialogActions = styled(DialogActions)`
  padding: 16px 0 0;
  justify-content: flex-end;
  gap: 12px;
`

const SaveButton = styled(Button)`
  text-transform: none;
  padding: 8px 24px;
  border-radius: 8px;
  font-weight: 600;
  background: linear-gradient(45deg, #1976d2, #2196f3);
  &:hover {
    background: linear-gradient(45deg, #1565c0, #1976d2);
    box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
  }
`

const CancelButton = styled(Button)`
  text-transform: none;
  padding: 8px 24px;
  border-radius: 8px;
  font-weight: 600;
`

interface EditProductDialogProps {
  open: boolean
  onClose: () => void
  product: Product | null
  onProductUpdated: () => void
}

const EditProductDialog = ({
  open,
  onClose,
  product,
  onProductUpdated,
}: EditProductDialogProps) => {
  const [formData, setFormData] = useState<ProductUpdate>({
    name: '',
    price: 0,
    description: '',
    stock: 0,
  })

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price,
        description: product.description || '',
        stock: product.stock,
      })
    }
  }, [product])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return

    try {
      await updateProduct(product.id, formData)
      onProductUpdated()
      onClose()
    } catch (error) {
      console.error('Error updating product:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? Number(value) : value,
    }))
  }

  if (!product) return null

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="md">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <StyledDialogTitle>Edit Product</StyledDialogTitle>
          <CloseButton onClick={onClose} aria-label="close">
            <CloseIcon />
          </CloseButton>
        </DialogHeader>
        
        <DialogContent sx={{ px: 0 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ color: '#666', mb: 0.5 }}>
              Product Name
            </Typography>
            <StyledTextField
              fullWidth
              name="name"
              value={formData.name}
              onChange={handleChange}
              sx={{ mt: 1 }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ color: '#666', mb: 0.5 }}>
              Description
            </Typography>
            <StyledTextField
              fullWidth
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
              sx={{ mt: 1 }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
            <StyledTextField
              fullWidth
              label="Price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
              inputProps={{ min: 0, step: 0.01 }}
            />

            <StyledTextField
              fullWidth
              label="Stock"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
              inputProps={{ min: 0, step: 1 }}
            />
          </Box>
        </DialogContent>

        <StyledDialogActions>
          <CancelButton
            variant="outlined"
            onClick={onClose}
          >
            Cancel
          </CancelButton>
          <SaveButton
            type="submit"
            variant="contained"
          >
            Save Changes
          </SaveButton>
        </StyledDialogActions>
      </form>
    </StyledDialog>
  )
}

export default EditProductDialog
