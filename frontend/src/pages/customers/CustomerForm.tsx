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
  TextField,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createCustomer, getCustomerById, updateCustomer } from '../../api/customerService';
import { FormSection, PageHeader } from '../../components/common';
import type { CustomerRequestDTO, CustomerResponseDTO } from '../../types';
import { CustomerType } from '../../types';

const CustomerForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State for success dialog
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [createdCustomerId, setCreatedCustomerId] = useState<string | null>(null);

  // Form setup with react-hook-form
  const { 
    control, 
    handleSubmit, 
    setValue,
    formState: { errors },
    watch
  } = useForm<CustomerRequestDTO>({
    defaultValues: {
      extCustId: '',
      custType: CustomerType.INDIVIDUAL,
      firstName: '',
      lastName: '',
      tradeName: '',
      address1: '',
      mobile: '',
      makerId: 'FRONTEND_USER', // Default maker ID
    }
  });

  // Get customer data if editing
  const { data: customerData, isLoading: isLoadingCustomer } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => getCustomerById(Number(id)),
    enabled: isEdit,
  });

  // Set form values when customer data is loaded
  useEffect(() => {
    if (customerData && isEdit) {
      // Set form values from loaded customer data
      setValue('extCustId', customerData.extCustId);
      setValue('custType', customerData.custType);
      setValue('firstName', customerData.firstName || '');
      setValue('lastName', customerData.lastName || '');
      setValue('tradeName', customerData.tradeName || '');
      setValue('address1', customerData.address1 || '');
      setValue('mobile', customerData.mobile || '');
      setValue('makerId', 'FRONTEND_USER'); // Use default for edits too
    }
  }, [customerData, isEdit, setValue]);

  // Watch custType to conditionally render fields
  const custType = watch('custType');

  // Mutations for create and update
  const createMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: (data: CustomerResponseDTO) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      // Show dialog with customer ID instead of toast
      if (data.message) {
        setCreatedCustomerId(data.message);
        setSuccessDialogOpen(true);
      } else {
        toast.success('Customer created successfully');
        navigate(`/customers/${data.custId}`);
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to create customer: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: CustomerRequestDTO) => updateCustomer(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      toast.success('Customer updated successfully');
      navigate('/customers');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update customer: ${error.message}`);
    }
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Submit handler
  const onSubmit = (data: CustomerRequestDTO) => {
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  // Handle dialog close
  const handleCloseSuccessDialog = () => {
    setSuccessDialogOpen(false);
    navigate(`/customers`);
  };
  
  return (
    <Box>
      <PageHeader
        title={isEdit ? 'Edit Customer' : 'Add Customer'}
        buttonText="Back to List"
        buttonLink="/customers"
        startIcon={<ArrowBackIcon />}
      />

      {/* Success Dialog */}
      <Dialog
        open={successDialogOpen}
        onClose={handleCloseSuccessDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Customer Created</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {createdCustomerId}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuccessDialog} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {isEdit && isLoadingCustomer ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormSection title="Customer Information">
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                {/* Customer ID field - disabled in create mode, visible in edit mode */}
                {isEdit && (
                  <TextField
                    label="Primary Cust Id"
                    value={customerData?.custId || ''}
                    fullWidth
                    disabled={true}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                )}
                {!isEdit && (
                  <TextField
                    label="Primary Cust Id"
                    value="Will be generated"
                    fullWidth
                    disabled={true}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                )}
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="extCustId"
                  control={control}
                  rules={{ 
                    required: 'External Customer ID is mandatory',
                    maxLength: {
                      value: 20,
                      message: 'External Customer ID cannot exceed 20 characters'
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="External Customer ID"
                      fullWidth
                      required
                      error={!!errors.extCustId}
                      helperText={errors.extCustId?.message}
                      disabled={isLoading}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="custType"
                  control={control}
                  rules={{ required: 'Customer Type is mandatory' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.custType}>
                      <InputLabel id="customer-type-label">Customer Type</InputLabel>
                      <Select
                        {...field}
                        labelId="customer-type-label"
                        label="Customer Type"
                        disabled={isLoading}
                      >
                        <MenuItem value={CustomerType.INDIVIDUAL}>Individual</MenuItem>
                        <MenuItem value={CustomerType.CORPORATE}>Corporate</MenuItem>
                        <MenuItem value={CustomerType.BANK}>Bank</MenuItem>
                        
                      </Select>
                      <FormHelperText>{errors.custType?.message}</FormHelperText>
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Conditional fields based on customer type */}
              {custType === CustomerType.INDIVIDUAL ? (
                <>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="firstName"
                      control={control}
                      rules={{
                        maxLength: {
                          value: 50,
                          message: 'First Name cannot exceed 50 characters'
                        }
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="First Name"
                          fullWidth
                          error={!!errors.firstName}
                          helperText={errors.firstName?.message}
                          disabled={isLoading}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="lastName"
                      control={control}
                      rules={{
                        maxLength: {
                          value: 50,
                          message: 'Last Name cannot exceed 50 characters'
                        }
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Last Name"
                          fullWidth
                          error={!!errors.lastName}
                          helperText={errors.lastName?.message}
                          disabled={isLoading}
                        />
                      )}
                    />
                  </Grid>
                </>
              ) : (
                <Grid item xs={12} md={12}>
                  <Controller
                    name="tradeName"
                    control={control}
                    rules={{
                      maxLength: {
                        value: 100,
                        message: 'Trade Name cannot exceed 100 characters'
                      }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Trade Name"
                        fullWidth
                        error={!!errors.tradeName}
                        helperText={errors.tradeName?.message}
                        disabled={isLoading}
                      />
                    )}
                  />
                </Grid>
              )}

              <Grid item xs={12} md={6}>
                <Controller
                  name="address1"
                  control={control}
                  rules={{
                    maxLength: {
                      value: 200,
                      message: 'Address cannot exceed 200 characters'
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Address"
                      fullWidth
                      error={!!errors.address1}
                      helperText={errors.address1?.message}
                      disabled={isLoading}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="mobile"
                  control={control}
                  rules={{
                    pattern: {
                      value: /^[0-9]{1,15}$/,
                      message: 'Mobile number must contain only digits and cannot exceed 15 digits'
                    },
                    maxLength: {
                      value: 15,
                      message: 'Mobile number cannot exceed 15 digits'
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Mobile"
                      fullWidth
                      error={!!errors.mobile}
                      helperText={errors.mobile?.message}
                      disabled={isLoading}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="makerId"
                  control={control}
                  rules={{
                    required: 'Maker ID is mandatory',
                    maxLength: {
                      value: 20,
                      message: 'Maker ID cannot exceed 20 characters'
                    }
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

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              component={RouterLink}
              to="/customers"
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
              {isEdit ? 'Update' : 'Create'} Customer
            </Button>
          </Box>
        </form>
      )}
    </Box>
  );
};

export default CustomerForm;
