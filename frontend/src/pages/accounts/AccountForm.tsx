import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import {
  Autocomplete,
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
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createCustomerAccount } from '../../api/customerAccountService';
import { getAllCustomers } from '../../api/customerService';
import { getAllSubProducts } from '../../api/subProductService';
import { FormSection, PageHeader } from '../../components/common';
import type { CustomerAccountRequestDTO, CustomerResponseDTO, SubProductResponseDTO } from '../../types';
import { CustomerType, SubProductStatus, AccountStatus } from '../../types';

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
      subProductId: 0,
      custName: '',
      acctName: '',
      dateOpening: new Date().toISOString().split('T')[0], // Today's date
      tenor: undefined,
      dateMaturity: undefined,
      dateClosure: undefined,
      branchCode: '001', // Default branch code
      accountStatus: AccountStatus.ACTIVE,
    }
  });

  // Get customers for dropdown
  const { data: customersData, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['customers', { page: 0, size: 100 }], // Get all customers for dropdown
    queryFn: () => getAllCustomers(0, 100),
  });

  // Get subproducts for dropdown
  const { data: subProductsData, isLoading: isLoadingSubProducts } = useQuery({
    queryKey: ['subproducts', { page: 0, size: 100 }],
    queryFn: () => getAllSubProducts(0, 100),
  });

  // Get selected values
  const selectedCustId = watch('custId');
  const selectedSubProductId = watch('subProductId');

  // Find selected customer and subproduct
  const selectedCustomer = customersData?.content.find(c => c.custId === selectedCustId);
  const selectedSubProduct = subProductsData?.content.find(s => s.subProductId === selectedSubProductId);

  // Create account mutation
  const createAccountMutation = useMutation({
    mutationFn: createCustomerAccount,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      
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

  const isLoading = createAccountMutation.isPending || isLoadingCustomers || isLoadingSubProducts;

  // Submit handler
  const onSubmit = (data: CustomerAccountRequestDTO) => {
    createAccountMutation.mutate(data);
  };

  // Generate account name and customer name based on customer and subproduct
  const generateAccountName = () => {
    if (selectedCustomer && selectedSubProduct) {
      let customerName = '';
      
      if (selectedCustomer.custType === CustomerType.INDIVIDUAL) {
        customerName = `${selectedCustomer.firstName || ''} ${selectedCustomer.lastName || ''}`.trim();
      } else {
        customerName = selectedCustomer.tradeName || '';
      }
      
      const accountName = `${customerName} - ${selectedSubProduct.subProductName}`;
      setValue('custName', customerName);
      setValue('acctName', accountName);
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
                  <Autocomplete
                    options={customersData?.content || []}
                    getOptionLabel={(option: CustomerResponseDTO) => {
                      let displayName = '';
                      if (option.custType === CustomerType.INDIVIDUAL) {
                        displayName = `${option.firstName || ''} ${option.lastName || ''}`.trim();
                      } else {
                        displayName = option.tradeName || '';
                      }
                      return `${displayName} (${option.extCustId})`;
                    }}
                    value={customersData?.content.find((customer: CustomerResponseDTO) => customer.custId === field.value) || null}
                    onChange={(_, newValue: CustomerResponseDTO | null) => {
                      const customerId = newValue?.custId || 0;
                      field.onChange(customerId);
                      generateAccountName();
                    }}
                    disabled={isLoading}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Customer *"
                        error={!!errors.custId}
                        helperText={errors.custId?.message}
                        placeholder="Search and select customer..."
                      />
                    )}
                    renderOption={(props, option: CustomerResponseDTO) => {
                      let displayName = '';
                      if (option.custType === CustomerType.INDIVIDUAL) {
                        displayName = `${option.firstName || ''} ${option.lastName || ''}`.trim();
                      } else {
                        displayName = option.tradeName || '';
                      }
                      return (
                        <Box component="li" {...props} key={option.custId}>
                          <Box>
                            <Box sx={{ fontWeight: 'medium' }}>
                              {displayName}
                            </Box>
                            <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                              {option.extCustId} • {option.custType}
                            </Box>
                          </Box>
                        </Box>
                      );
                    }}
                    isOptionEqualToValue={(option: CustomerResponseDTO, value: CustomerResponseDTO) => 
                      option.custId === value.custId
                    }
                    noOptionsText="No customers found"
                    loading={isLoadingCustomers}
                  />
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
                render={({ field }) => {
                  const activeSubProducts = subProductsData?.content.filter((sp: SubProductResponseDTO) => 
                    sp.subProductStatus === SubProductStatus.ACTIVE && sp.verified
                  ) || [];
                  
                  return (
                    <Autocomplete
                      options={activeSubProducts}
                      getOptionLabel={(option: SubProductResponseDTO) => 
                        `${option.subProductName} (${option.subProductCode})`
                      }
                      value={activeSubProducts.find((subproduct: SubProductResponseDTO) => subproduct.subProductId === field.value) || null}
                      onChange={(_, newValue: SubProductResponseDTO | null) => {
                        const subProductId = newValue?.subProductId || 0;
                        field.onChange(subProductId);
                        generateAccountName();
                      }}
                      disabled={isLoading}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="SubProduct *"
                          error={!!errors.subProductId}
                          helperText={errors.subProductId?.message}
                          placeholder="Search and select subproduct..."
                        />
                      )}
                      renderOption={(props, option: SubProductResponseDTO) => (
                        <Box component="li" {...props} key={option.subProductId}>
                          <Box>
                            <Box sx={{ fontWeight: 'medium' }}>
                              {option.subProductName}
                            </Box>
                            <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                              {option.subProductCode} • {option.productName}
                            </Box>
                          </Box>
                        </Box>
                      )}
                      isOptionEqualToValue={(option: SubProductResponseDTO, value: SubProductResponseDTO) => 
                        option.subProductId === value.subProductId
                      }
                      noOptionsText="No subproducts found"
                      loading={isLoadingSubProducts}
                    />
                  );
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="acctName"
                control={control}
                rules={{ required: 'Account Name is mandatory' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Account Name"
                    fullWidth
                    required
                    error={!!errors.acctName}
                    helperText={errors.acctName?.message}
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="dateOpening"
                control={control}
                rules={{ required: 'Date of Opening is mandatory' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Date of Opening"
                    type="date"
                    fullWidth
                    required
                    error={!!errors.dateOpening}
                    helperText={errors.dateOpening?.message}
                    disabled={isLoading}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="tenor"
                control={control}
                rules={{ 
                  min: { value: 1, message: 'Tenor must be at least 1 day' },
                  max: { value: 999, message: 'Tenor cannot exceed 999 days' }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Tenor (Days)"
                    type="number"
                    fullWidth
                    error={!!errors.tenor}
                    helperText={errors.tenor?.message || 'Optional: Number of days for term deposits'}
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="dateMaturity"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Date of Maturity"
                    type="date"
                    fullWidth
                    error={!!errors.dateMaturity}
                    helperText={errors.dateMaturity?.message || 'Optional: For term deposits'}
                    disabled={isLoading}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="dateClosure"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Date of Closure"
                    type="date"
                    fullWidth
                    error={!!errors.dateClosure}
                    helperText={errors.dateClosure?.message || 'Optional: When account was closed'}
                    disabled={isLoading}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="branchCode"
                control={control}
                rules={{ required: 'Branch Code is mandatory' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Branch Code"
                    fullWidth
                    required
                    error={!!errors.branchCode}
                    helperText={errors.branchCode?.message}
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="accountStatus"
                control={control}
                rules={{ required: 'Account Status is mandatory' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.accountStatus} disabled={isLoading}>
                    <InputLabel id="status-label">Account Status</InputLabel>
                    <Select
                      {...field}
                      labelId="status-label"
                      label="Account Status"
                    >
                      <MenuItem value={AccountStatus.ACTIVE}>Active</MenuItem>
                      <MenuItem value={AccountStatus.INACTIVE}>Inactive</MenuItem>
                      <MenuItem value={AccountStatus.CLOSED}>Closed</MenuItem>
                      <MenuItem value={AccountStatus.DORMANT}>Dormant</MenuItem>
                    </Select>
                    <FormHelperText>{errors.accountStatus?.message}</FormHelperText>
                  </FormControl>
                )}
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
