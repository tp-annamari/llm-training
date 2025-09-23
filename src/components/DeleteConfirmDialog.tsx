import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  Button,
} from '@mui/material'
import { styled } from '@mui/system'
import { Product } from '../types/product'

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '400px',
    width: '100%'
  }
}))

const ActionButton = styled(Button)`
  text-transform: none;
  font-weight: 600;
  padding: 8px 24px;
  border-radius: 8px;
`

interface DeleteConfirmDialogProps {
  open: boolean
  onClose: () => void
  product: Product | null
  onConfirm: () => void
}

const DeleteConfirmDialog = ({
  open,
  onClose,
  product,
  onConfirm
}: DeleteConfirmDialogProps) => {
  if (!product) return null

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="sm">
      <DialogContent sx={{ p: 0 }}>
        <Typography variant="h5" sx={{ 
          fontWeight: 600, 
          color: '#d32f2f',
          mb: 2 
        }}>
          Delete Product
        </Typography>

        <Typography variant="body1" sx={{ mb: 3, color: '#1F1F1F' }}>
          Are you sure you want to delete "{product.name}"? This action cannot be undone.
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <ActionButton
            variant="outlined"
            onClick={onClose}
          >
            Cancel
          </ActionButton>
          <ActionButton
            variant="contained"
            color="error"
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            Delete
          </ActionButton>
        </Box>
      </DialogContent>
    </StyledDialog>
  )
}

export default DeleteConfirmDialog
