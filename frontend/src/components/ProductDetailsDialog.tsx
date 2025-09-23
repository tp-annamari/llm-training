import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  IconButton,
  Button,
} from '@mui/material'
import { styled } from '@mui/system'
import { Close as CloseIcon } from '@mui/icons-material'
import { Product } from '../types/product'

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '600px',
    width: '100%'
  }
}))

const HeaderContainer = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
`

const CloseButton = styled(IconButton)`
  padding: 8px;
  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
`

const Label = styled(Typography)`
  color: #666;
  margin-bottom: 4px;
`

const Value = styled(Typography)`
  color: #1F1F1F;
  margin-bottom: 20px;
`

const ActionButton = styled(Button)`
  text-transform: none;
  font-weight: 600;
  padding: 8px 24px;
  border-radius: 8px;
`

interface ProductDetailsDialogProps {
  open: boolean
  onClose: () => void
  product: Product | null
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

const ProductDetailsDialog = ({
  open,
  onClose,
  product,
  onEdit,
  onDelete
}: ProductDetailsDialogProps) => {
  if (!product) return null

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent sx={{ p: 0 }}>
        <HeaderContainer>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
            Product Details
          </Typography>
          <CloseButton onClick={onClose}>
            <CloseIcon />
          </CloseButton>
        </HeaderContainer>

        <Box sx={{ mb: 3 }}>
          <Label variant="subtitle2">Product Name</Label>
          <Value variant="h6">{product.name}</Value>

          <Label variant="subtitle2">Description</Label>
          <Value variant="body1">{product.description || 'No description available'}</Value>

          <Box sx={{ display: 'flex', gap: 4 }}>
            <Box>
              <Label variant="subtitle2">Price</Label>
              <Value variant="h6">${product.price.toFixed(2)}</Value>
            </Box>
            <Box>
              <Label variant="subtitle2">Stock</Label>
              <Value variant="h6">{product.stock}</Value>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <ActionButton
            variant="contained"
            color="error"
            onClick={() => onDelete(product)}
          >
            Delete
          </ActionButton>
          <ActionButton
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #1976d2, #2196f3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1565c0, #1976d2)',
              }
            }}
            onClick={() => onEdit(product)}
          >
            Edit Product
          </ActionButton>
        </Box>
      </DialogContent>
    </StyledDialog>
  )
}

export default ProductDetailsDialog
