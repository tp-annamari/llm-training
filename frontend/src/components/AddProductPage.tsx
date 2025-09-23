import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
} from '@mui/material'
import { styled } from '@mui/system'
import { useState } from 'react'
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material'
import { ProductCreate } from '../types/product'
import { createProduct } from '../services/api'

const PageContainer = styled(Container)`
  margin-top: 3rem;
  margin-bottom: 3rem;
`

const FormCard = styled(Paper)`
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);
`

const Header = styled(Box)`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
`

const HeaderTitle = styled(Typography)`
  color: #1976d2;
  margin-left: 1rem;
  font-weight: 600;
`

const FormContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

const ButtonContainer = styled(Box)`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`

const SaveButton = styled(Button)`
  background: linear-gradient(45deg, #1976d2, #2196f3);
  text-transform: none;
  padding: 0.5rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.2);
  
  &:hover {
    background: linear-gradient(45deg, #1565c0, #1976d2);
    box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
  }
`

const CancelButton = styled(Button)`
  text-transform: none;
  padding: 0.5rem 2rem;
  border-radius: 8px;
  font-weight: 600;
`

interface AddProductPageProps {
  onClose: () => void
  onProductAdded: () => void
}

const AddProductPage = ({ onClose, onProductAdded }: AddProductPageProps) => {
  const [formData, setFormData] = useState<ProductCreate>({
    name: '',
    price: 0,
    description: '',
    stock: 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createProduct(formData)
      onProductAdded()
      onClose()
    } catch (error) {
      console.error('Error creating product:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? Number(value) : value,
    }))
  }

  return (
    <PageContainer maxWidth="md">
      <FormCard>
        <Header>
          <IconButton 
            onClick={onClose}
            sx={{ 
              '&:hover': { 
                backgroundColor: 'rgba(25, 118, 210, 0.08)' 
              } 
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <HeaderTitle variant="h5">Add New Product</HeaderTitle>
        </Header>
        
        <form onSubmit={handleSubmit}>
          <FormContainer>
            <StyledTextField
              fullWidth
              label="Product Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter product name"
            />
            
            <StyledTextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
              placeholder="Enter product description"
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <StyledTextField
                fullWidth
                label="Price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                }}
                placeholder="0.00"
              />
              
              <StyledTextField
                fullWidth
                label="Stock"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                required
                placeholder="0"
              />
            </Box>
            
            <ButtonContainer>
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
                Save Product
              </SaveButton>
            </ButtonContainer>
          </FormContainer>
        </form>
      </FormCard>
    </PageContainer>
  )
}

export default AddProductPage
