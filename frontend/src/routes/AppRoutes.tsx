import { Route, Routes } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import CustomerList from '../pages/customers/CustomerList';
import CustomerForm from '../pages/customers/CustomerForm';
import ProductList from '../pages/products/ProductList';
import ProductForm from '../pages/products/ProductForm';
import SubProductList from '../pages/subproducts/SubProductList';
import SubProductForm from '../pages/subproducts/SubProductForm';
import AccountList from '../pages/accounts/AccountList';
import AccountForm from '../pages/accounts/AccountForm';
import AccountDetails from '../pages/accounts/AccountDetails';
import TransactionList from '../pages/transactions/TransactionList';
import TransactionForm from '../pages/transactions/TransactionForm';
import EOD from '../pages/admin/EOD';
import Login from '../pages/auth/Login';
import TestPage from '../pages/TestPage';
import ApiTest from '../pages/ApiTest';
import CorsTest from '../pages/CorsTest';
import ApiDebug from '../pages/ApiDebug';
import ProtectedRoute from '../components/security/ProtectedRoute';
import { Box, Typography, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// 404 Not Found Page
const NotFound = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      p: 3,
    }}
  >
    <ErrorOutlineIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
    <Typography variant="h2" component="h1" gutterBottom>
      404
    </Typography>
    <Typography variant="h5" component="h2" gutterBottom>
      Page Not Found
    </Typography>
    <Typography variant="body1" color="text.secondary" paragraph>
      The page you are looking for does not exist or has been moved.
    </Typography>
    <Button 
      variant="contained" 
      color="primary" 
      onClick={() => window.location.href = '/'}
      sx={{ mt: 2 }}
    >
      Go to Dashboard
    </Button>
  </Box>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/test" element={<TestPage />} />
      <Route path="/api-test" element={<ApiTest />} />
      <Route path="/cors-test" element={<CorsTest />} />
      <Route path="/api-debug" element={<ApiDebug />} />
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        {/* Dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* Customer Management */}
        <Route path="/customers" element={<CustomerList />} />
        <Route path="/customers/new" element={<CustomerForm />} />
        <Route path="/customers/:id" element={<CustomerForm />} />

        {/* Product Management */}
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/new" element={<ProductForm />} />
        <Route path="/products/:id" element={<ProductForm />} />

        {/* SubProduct Management */}
        <Route path="/subproducts" element={<SubProductList />} />
        <Route path="/subproducts/new" element={<SubProductForm />} />
        <Route path="/subproducts/:id" element={<SubProductForm />} />

        {/* Account Management */}
        <Route path="/accounts" element={<AccountList />} />
        <Route path="/accounts/new" element={<AccountForm />} />
        <Route path="/accounts/:accountNo" element={<AccountDetails />} />

        {/* Transaction Management */}
        <Route path="/transactions" element={<TransactionList />} />
        <Route path="/transactions/new" element={<TransactionForm />} />
        <Route path="/transactions/:tranId" element={<TransactionList />} />

        {/* Admin/EOD - Requires admin role */}
        <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
          <Route path="/admin/eod" element={<EOD />} />
        </Route>
      </Route>

      {/* 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
