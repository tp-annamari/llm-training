import {
  Box,
  Button,
  TextField,
  InputAdornment,
  styled,
  Badge,
  IconButton,
  Tooltip,
} from '@mui/material'
import { 
  Add as AddIcon, 
  Search as SearchIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material'

const ToolbarContainer = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
`

const SearchField = styled(TextField)`
  flex: 1;
  max-width: 400px;
  & .MuiOutlinedInput-root {
    border-radius: 8px;
    background-color: white;
    transition: all 0.2s;
    
    &:hover {
      background-color: #f8f9fa;
    }
    
    &.Mui-focused {
      background-color: white;
      box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
    }
  }
`

const AddButton = styled(Button)`
  background: linear-gradient(45deg, #1976d2, #2196f3);
  text-transform: none;
  padding: 8px 24px;
  border-radius: 8px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.2);
  
  &:hover {
    background: linear-gradient(45deg, #1565c0, #1976d2);
    box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
  }
`

const CartButton = styled(IconButton)`
  background-color: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 8px;
  
  &:hover {
    background-color: #f5f5f5;
    border-color: #1976d2;
  }
`

interface ProductToolbarProps {
  onSearch: (query: string) => void
  onAddClick: () => void
  cartItemCount?: number
}

const ProductToolbar = ({ onSearch, onAddClick, cartItemCount = 0 }: ProductToolbarProps) => {
  return (
    <ToolbarContainer>
      <SearchField
        placeholder="Search products..."
        variant="outlined"
        size="small"
        onChange={(e) => onSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: '#666' }} />
            </InputAdornment>
          ),
        }}
      />
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        {cartItemCount > 0 && (
          <Tooltip title={`${cartItemCount} item${cartItemCount === 1 ? '' : 's'} in cart`}>
            <Badge badgeContent={cartItemCount} color="primary">
              <CartButton>
                <ShoppingCartIcon />
              </CartButton>
            </Badge>
          </Tooltip>
        )}
        <AddButton
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddClick}
        >
          Add Product
        </AddButton>
      </Box>
    </ToolbarContainer>
  )
}

export default ProductToolbar
