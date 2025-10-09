import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createProduct, getProductById, updateProduct, getProductGLOptions } from '../../api/productService';
import { FormSection, PageHeader } from '../../components/common';
import type { ProductRequestDTO } from '../../types';

const ProductForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form setup with react-hook-form
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<ProductRequestDTO>({
    defaultValues: {
      productCode: '',
      productName: '',
      cumGLNum: '', // GL Number field
      customerProduct: false,
      interestBearing: false,
      makerId: 'FRONTEND_USER', // Default maker ID
    }
  });

  // Watch customerProduct to conditionally show interestBearing
  const isCustomerProduct = watch('customerProduct');

  // Get product data if editing
  const { data: productData, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(Number(id)),
    enabled: isEdit,
  });

  // Get GL setups for layer 3
  const { data: glSetups, isLoading: isLoadingGLSetups } = useQuery({
    queryKey: ['product-gl-options'],
    queryFn: () => getProductGLOptions(),
  });

  // Set form values when product data is loaded
  useEffect(() => {
    if (productData && isEdit) {
      // Set form values from loaded product data
      setValue('productCode', productData.productCode);
      setValue('productName', productData.productName);
      setValue('cumGLNum', productData.cumGLNum);
      setValue('customerProduct', productData.customerProduct || false);
      setValue('interestBearing', productData.interestBearing || false);
      setValue('makerId', 'FRONTEND_USER'); // Use default for edits too
    }
  }, [productData, isEdit, setValue]);

  // Reset interestBearing when customerProduct is turned off
  useEffect(() => {
    if (!isCustomerProduct) {
      setValue('interestBearing', false);
    }
  }, [isCustomerProduct, setValue]);

  // Mutations for create and update
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(`Product created successfully! Product ID: ${data.productId}`);
      // Reset form to allow creating another product
      reset();
      // Stay on the same page - don't navigate away
    },
    onError: (error: Error) => {
      toast.error(`Failed to create product: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProductRequestDTO) => updateProduct(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      toast.success('Product updated successfully');
      navigate('/products');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update product: ${error.message}`);
    }
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Submit handler
  const onSubmit = (data: ProductRequestDTO) => {
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Box>
      <PageHeader
        title={isEdit ? 'Edit Product' : 'Add Product'}
        buttonText="Back to List"
        buttonLink="/products"
        startIcon={<ArrowBackIcon />}
      />

      {isEdit && isLoadingProduct ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormSection title="Product Information">
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="productCode"
                  control={control}
                  rules={{ 
                    required: 'Product Code is mandatory'
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Product Code"
                      fullWidth
                      required
                      error={!!errors.productCode}
                      helperText={errors.productCode?.message}
                      disabled={isLoading || (isEdit && productData?.verified)}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Controller
                    name="customerProduct"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            {...field}
                            checked={field.value || false}
                            disabled={isLoading || (isEdit && productData?.verified)}
                          />
                        }
                        label="Customer Product"
                      />
                    )}
                  />
                  
                  {isCustomerProduct && (
                    <Controller
                      name="interestBearing"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Switch
                              {...field}
                              checked={field.value || false}
                              disabled={isLoading || (isEdit && productData?.verified)}
                            />
                          }
                          label="Interest Bearing"
                        />
                      )}
                    />
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="cumGLNum"
                  control={control}
                  rules={{ required: 'GL Number is mandatory' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.cumGLNum}>
                      <InputLabel id="gl-number-label">GL Number</InputLabel>
                      <Select
                        {...field}
                        labelId="gl-number-label"
                        label="GL Number"
                        disabled={isLoading || isLoadingGLSetups || (isEdit && productData?.verified)}
                      >
                        {glSetups?.map((glSetup) => (
                          <MenuItem key={glSetup.glNum} value={glSetup.glNum}>
                            {glSetup.glName} - {glSetup.glNum}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>{errors.cumGLNum?.message}</FormHelperText>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="productName"
                  control={control}
                  rules={{ required: 'Product Name is mandatory' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Product Name"
                      fullWidth
                      required
                      error={!!errors.productName}
                      helperText={errors.productName?.message}
                      disabled={isLoading || (isEdit && productData?.verified)}
                    />
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
            </Grid>
          </FormSection>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              component={RouterLink}
              to="/products"
              variant="outlined"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading || (isEdit && productData?.verified)}
              startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {isEdit ? 'Update' : 'Create'} Product
            </Button>
          </Box>
        </form>
      )}
    </Box>
  );
};

export default ProductForm;
