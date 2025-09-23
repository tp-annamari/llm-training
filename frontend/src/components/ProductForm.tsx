import { useState } from 'react'
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
} from '@mui/material'
import { styled } from '@mui/system'
import { createProduct } from '../services/api'
import { ProductCreate } from '../types/product'

const StyledCard = styled(Card)`
  margin-bottom: 2rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);
`

const FormContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const SubmitButton = styled(Button)`
  background: linear-gradient(45deg, #1976d2, #2196f3);
  text-transform: none;
  font-weight: 600;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.2);
  &:hover {
    background: linear-gradient(45deg, #1565c0, #1976d2);
    box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
  }
`

interface ProductFormProps {
  onProductAdded: () => void
}

function ProductForm({ onProductAdded }: ProductFormProps) {
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
      setFormData({
        name: '',
        price: 0,
        description: '',
        stock: 0,
      })
      onProductAdded()
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
    <StyledCard>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Add New Product
        </Typography>
        <form onSubmit={handleSubmit}>
          <FormContainer>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Stock"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={4}
                />
              </Grid>
              <Grid item xs={12}>
                <SubmitButton
                  type="submit"
                  variant="contained"
                  fullWidth
                >
                  Add Product
                </SubmitButton>
              </Grid>
            </Grid>
          </FormContainer>
        </form>
      </CardContent>
    </StyledCard>
  )
}

export default ProductForm
