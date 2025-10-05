import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createCustomerAccount } from '../../api/customerAccountService';
import { getAllCustomers } from '../../api/customerService';
import { getAllSubProducts } from '../../api/subProductService';
import { getAllProducts } from '../../api/productService';
import { FormSection, PageHeader } from '../../components/common';
import type { CustomerAccountRequestDTO, CustomerResponseDTO, SubProductResponseDTO } from '../../types';
import { CustomerType, SubProductStatus } from '../../types';

const AccountForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State for success dialog
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [createdAccountNo, setCreatedAccountNo] = useState<string | null>(null);

  // Form setup with react-hook-form
  const { 
    control, 
    handleSubmit, 
    setValue,
    watch,
    formState: { errors }
  } = useForm<CustomerAccountRequestDTO>({
    defaultValues: {
      custId: 0,
      productId: 0,
      subProductId: 0,
      accountName: '',
      currency: '',
      makerId: 'FRONTEND_USER', // Default maker ID
    }
  });

  // Get customers for dropdown
  const { data: customersData, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['customers', { page: 0, size: 100 }], // Get all customers for dropdown
    queryFn: () => getAllCustomers(0, 100),
  });

  // Get products for dropdown (customer products only)
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['customer-products', { page: 0, size: 100 }], // Get customer products for dropdown
    queryFn: () => getAllProducts(0, 100), // TODO: Replace with getCustomerProducts when API is ready
  });

  // Get subproducts for dropdown (customer subproducts only)
  const { data: subProductsData, isLoading: isLoadingSubProducts } = useQuery({
    queryKey: ['customer-subproducts', { page: 0, size: 100 }], // Get customer subproducts for dropdown
    queryFn: () => getAllSubProducts(0, 100), // TODO: Replace with getCustomerSubProducts when API is ready
  });

  // Get selected values
  const selectedCustId = watch('custId');
  const selectedProductId = watch('productId');
  const selectedSubProductId = watch('subProductId');

  // Find selected customer and subproduct
  const selectedCustomer = customersData?.content.find(c => c.custId === selectedCustId);
  const selectedSubProduct = subProductsData?.content.find(s => s.subProductId === selectedSubProductId);

  // Create account mutation
  const createAccountMutation = useMutation({
    mutationFn: createCustomerAccount,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customerAccounts'] });
      
      // Show dialog with account number instead of toast
      if (data.message) {
        setCreatedAccountNo(data.message);
        setSuccessDialogOpen(true);
      } else {
        toast.success('Account created successfully');
        navigate(`/accounts/${data.accountNo}`);
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to create account: ${error.message}`);
    }
  });

  const isLoading = createAccountMutation.isPending || isLoadingCustomers || isLoadingProducts || isLoadingSubProducts;

  // Clear sub-product when product changes
  useEffect(() => {
    setValue('subProductId', 0);
  }, [selectedProductId, setValue]);

  // Submit handler
  const onSubmit = (data: CustomerAccountRequestDTO) => {
    createAccountMutation.mutate(data);
  };

  // Generate account name based on customer and subproduct
  const generateAccountName = () => {
    if (selectedCustomer && selectedSubProduct) {
      let customerName = '';
      
      if (selectedCustomer.custType === CustomerType.INDIVIDUAL) {
        customerName = `${selectedCustomer.firstName || ''} ${selectedCustomer.lastName || ''}`.trim();
      } else {
        customerName = selectedCustomer.tradeName || '';
      }
      
      const accountName = `${customerName} - ${selectedSubProduct.subProductName}`;
      setValue('accountName', accountName);
    }
  };

  // Handle dialog close
  const handleCloseSuccessDialog = () => {
    setSuccessDialogOpen(false);
    navigate(`/accounts`);
  };

  return (
    <Box>
      <PageHeader
        title="Create New Account"
        buttonText="Back to Accounts"
        buttonLink="/accounts"
        startIcon={<ArrowBackIcon />}
      />
      
      {/* Success Dialog */}
      <Dialog
        open={successDialogOpen}
        onClose={handleCloseSuccessDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Account Created</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {createdAccountNo}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuccessDialog} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormSection title="Account Information">
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              {/* Account Number field - disabled in create mode */}
              <TextField
                label="Account Number"
                value="Will be generated"
                fullWidth
                disabled={true}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="custId"
                control={control}
                rules={{ 
                  required: 'Customer is mandatory',
                  validate: value => value > 0 || 'Please select a customer'
                }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.custId} disabled={isLoading}>
                    <InputLabel id="customer-label">Primary Cust Id</InputLabel>
                    <Select
                      {...field}
                      labelId="customer-label"
                      label="Primary Cust Id"
                      onChange={(e) => {
                        field.onChange(e);
                        generateAccountName();
                      }}
                    >
                      {customersData?.content.map((customer: CustomerResponseDTO) => {
                        let displayName = '';
                        if (customer.custType === CustomerType.INDIVIDUAL) {
                          displayName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
                        } else {
                          displayName = customer.tradeName || '';
                        }
                        
                        return (
                          <MenuItem key={customer.custId} value={customer.custId}>
                            {displayName} ({customer.extCustId})
                          </MenuItem>
                        );
                      })}
                    </Select>
                    <FormHelperText>{errors.custId?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="productId"
                control={control}
                rules={{ 
                  required: 'Product is mandatory',
                  validate: value => value > 0 || 'Please select a product'
                }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.productId} disabled={isLoading}>
                    <InputLabel id="product-label">Product Code</InputLabel>
                    <Select
                      {...field}
                      labelId="product-label"
                      label="Product Code"
                    >
                      {productsData?.content.map((product) => (
                        <MenuItem key={product.productId} value={product.productId}>
                          {product.productName} ({product.productCode})
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{errors.productId?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="subProductId"
                control={control}
                rules={{ 
                  required: 'SubProduct is mandatory',
                  validate: value => value > 0 || 'Please select a subproduct'
                }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.subProductId} disabled={isLoading}>
                    <InputLabel id="subproduct-label">SubProduct</InputLabel>
                    <Select
                      {...field}
                      labelId="subproduct-label"
                      label="SubProduct"
                      onChange={(e) => {
                        field.onChange(e);
                        const subprod = subProductsData?.content.find(
                          (s: SubProductResponseDTO) => s.subProductId === e.target.value
                        );
                        if (subprod) {
                          // You might need to set currency based on subproduct if applicable
                          generateAccountName();
                        }
                      }}
                    >
                      {subProductsData?.content
                        .filter((sp: SubProductResponseDTO) => 
                          sp.subProductStatus === SubProductStatus.ACTIVE && 
                          sp.verified &&
                          sp.productId === selectedProductId
                        )
                        .map((subproduct: SubProductResponseDTO) => (
                          <MenuItem key={subproduct.subProductId} value={subproduct.subProductId}>
                            {subproduct.subProductName} ({subproduct.subProductCode})
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText>{errors.subProductId?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="accountName"
                control={control}
                rules={{ required: 'Account Name is mandatory' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Account Name"
                    fullWidth
                    required
                    error={!!errors.accountName}
                    helperText={errors.accountName?.message}
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>
              
            <Grid item xs={12} md={6}>
              <Controller
                name="currency"
                control={control}
                rules={{ required: 'Currency is mandatory' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.currency} disabled={isLoading}>
                    <InputLabel id="currency-label">Currency</InputLabel>
                    <Select
                      {...field}
                      labelId="currency-label"
                      label="Currency"
                      onChange={(e) => {
                        field.onChange(e);
                        // setSelectedCurrency(e.target.value as string);
                      }}
                    >
                      <MenuItem value="USD">USD - US Dollar</MenuItem>
                      <MenuItem value="EUR">EUR - Euro</MenuItem>
                      <MenuItem value="GBP">GBP - British Pound</MenuItem>
                      <MenuItem value="JPY">JPY - Japanese Yen</MenuItem>
                    </Select>
                    <FormHelperText>{errors.currency?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>
            
              <Grid item xs={12} md={6}>
                <Controller
                  name="makerId"
                  control={control}
                  rules={{
                    required: 'Maker ID is mandatory'
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Maker ID"
                      fullWidth
                      required
                      error={!!errors.makerId}
                      helperText={errors.makerId?.message}
                      disabled={isLoading}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Branch Code"
                  value="001"
                  fullWidth
                  disabled={true}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
          </Grid>
        </FormSection>

        {selectedSubProduct && (
          <FormSection title="SubProduct Details">
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Interest Rate"
                  value="N/A"
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Term"
                  value="N/A"
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Product Type"
                  value={selectedSubProduct.productName || ''}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            </Grid>
          </FormSection>
        )}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            component={RouterLink}
            to="/accounts"
            variant="outlined"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            Create Account
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default AccountForm;
