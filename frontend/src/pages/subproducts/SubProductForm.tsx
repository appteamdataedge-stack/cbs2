import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAllProducts } from '../../api/productService';
import { createSubProduct, getSubProductById, updateSubProduct, getSubProductGLOptions, getSubProductGLOptionsByParent } from '../../api/subProductService';
import { FormSection, PageHeader } from '../../components/common';
import type { SubProductRequestDTO } from '../../types';
import { SubProductStatus } from '../../types';

const SubProductForm = () => {
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
    formState: { errors }
  } = useForm<SubProductRequestDTO>({
    defaultValues: {
      subProductCode: '',
      subProductName: '',
      productId: undefined, // Don't set to 0, let it be undefined initially
      inttCode: '',
      cumGLNum: '',
      extGLNum: '',
      subProductStatus: SubProductStatus.ACTIVE,
      makerId: 'FRONTEND_USER', // Default maker ID
    }
  });

  // Watch productId to filter GL options
  const selectedProductId = watch('productId');

  // Get subproduct data if editing
  const { data: subProductData, isLoading: isLoadingSubProduct } = useQuery({
    queryKey: ['subProduct', id],
    queryFn: () => getSubProductById(Number(id)),
    enabled: isEdit,
  });

  // Get products for dropdown
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products', { page: 0, size: 100 }], // Get all products for dropdown
    queryFn: () => getAllProducts(0, 100),
  });

  // Get selected product to find its GL number
  const selectedProduct = productsData?.content?.find(p => p.productId === selectedProductId);

  // Get Layer 4 GL options for sub-product dropdown
  const { isLoading: isLoadingGLSetups } = useQuery({
    queryKey: ['subproduct-gl-options'],
    queryFn: () => getSubProductGLOptions(),
  });

  // Get Layer 4 GL options filtered by parent GL number
  const { data: filteredGLSetups, isLoading: isLoadingFilteredGLSetups } = useQuery({
    queryKey: ['subproduct-gl-options', selectedProduct?.cumGLNum],
    queryFn: () => getSubProductGLOptionsByParent(selectedProduct?.cumGLNum || ''),
    enabled: !!selectedProduct?.cumGLNum,
  });

  // Set form values when subproduct data is loaded
  useEffect(() => {
    if (subProductData && isEdit) {
      // Set form values from loaded subproduct data
      setValue('subProductCode', subProductData.subProductCode);
      setValue('subProductName', subProductData.subProductName);
      setValue('productId', subProductData.productId);
      setValue('cumGLNum', subProductData.cumGLNum);
      setValue('inttCode', subProductData.inttCode);
      setValue('extGLNum', subProductData.extGLNum);
      setValue('subProductStatus', subProductData.subProductStatus);
      setValue('makerId', 'FRONTEND_USER'); // Use default for edits too
    }
  }, [subProductData, isEdit, setValue]);

  // Mutations for create and update
  const createMutation = useMutation({
    mutationFn: createSubProduct,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['subproducts'] });
      toast.success('SubProduct created successfully');
      navigate(`/subproducts/${data.subProductId}`);
    },
    onError: (error: Error) => {
      console.error('Create sub-product error:', error);
      toast.error(`Failed to create subproduct: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: SubProductRequestDTO) => updateSubProduct(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subproducts'] });
      queryClient.invalidateQueries({ queryKey: ['subProduct', id] });
      toast.success('SubProduct updated successfully');
      navigate('/subproducts');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update subproduct: ${error.message}`);
    }
  });

  const isLoading = createMutation.isPending || updateMutation.isPending || isLoadingProducts || isLoadingGLSetups || isLoadingFilteredGLSetups;
  const isDisabled = isLoading;

  // Clear GL fields when product changes
  useEffect(() => {
    if (selectedProductId && !isEdit) {
      setValue('cumGLNum', '');
      setValue('inttCode', '');
      setValue('extGLNum', '');
    }
  }, [selectedProductId, isEdit, setValue]);

  // Submit handler
  const onSubmit = (data: SubProductRequestDTO) => {
    // Validate required fields before submission
    if (!data.productId || data.productId === 0) {
      alert('Please select a product');
      return;
    }
    
    if (!data.cumGLNum || data.cumGLNum.trim() === '') {
      alert('Please select a GL Number');
      return;
    }
    
    if (!data.inttCode || data.inttCode.trim() === '') {
      alert('Please enter an Interest Code');
      return;
    }
    
    if (!data.extGLNum || data.extGLNum.trim() === '') {
      alert('Please enter an External GL Number');
      return;
    }
    
    console.log('Submitting sub-product data:', data);
    
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Box>
      <PageHeader
        title={isEdit ? 'Edit SubProduct' : 'Add SubProduct'}
        buttonText="Back to List"
        buttonLink="/subproducts"
        startIcon={<ArrowBackIcon />}
      />

      {isEdit && isLoadingSubProduct ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormSection title="SubProduct Information">
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="subProductCode"
                  control={control}
                  rules={{ 
                    required: 'SubProduct Code is mandatory'
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="SubProduct Code"
                      fullWidth
                      required
                      error={!!errors.subProductCode}
                      helperText={errors.subProductCode?.message}
                      disabled={isDisabled}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="subProductName"
                  control={control}
                  rules={{ required: 'SubProduct Name is mandatory' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="SubProduct Name"
                      fullWidth
                      required
                      error={!!errors.subProductName}
                      helperText={errors.subProductName?.message}
                      disabled={isDisabled}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="productId"
                  control={control}
                  rules={{ required: 'Product is mandatory' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.productId} disabled={isDisabled}>
                      <InputLabel id="product-label">Product</InputLabel>
                      <Select
                        {...field}
                        labelId="product-label"
                        label="Product"
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
                  name="cumGLNum"
                  control={control}
                  rules={{ required: 'Cumulative GL Number is mandatory' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.cumGLNum}>
                      <InputLabel id="cum-gl-number-label">Cumulative GL Number</InputLabel>
                      <Select
                        {...field}
                        labelId="cum-gl-number-label"
                        label="Cumulative GL Number"
                        disabled={isDisabled || !selectedProduct?.cumGLNum}
                      >
                        {(filteredGLSetups || []).map((glSetup) => (
                          <MenuItem key={glSetup.glNum} value={glSetup.glNum}>
                            {glSetup.glName} - {glSetup.glNum}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>
                        {errors.cumGLNum?.message || 
                         (!selectedProduct?.cumGLNum ? 'Please select a product first' : '')}
                      </FormHelperText>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="inttCode"
                  control={control}
                  rules={{ required: 'Interest Code is mandatory' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Interest Code"
                      required
                      error={!!errors.inttCode}
                      helperText={errors.inttCode?.message || "Interest code for this sub-product"}
                      disabled={isDisabled}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="extGLNum"
                  control={control}
                  rules={{ required: 'External GL Number is mandatory' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="External GL Number"
                      required
                      error={!!errors.extGLNum}
                      helperText={errors.extGLNum?.message || "External GL Number for this sub-product"}
                      disabled={isDisabled}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="subProductStatus"
                  control={control}
                  rules={{ required: 'Status is mandatory' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.subProductStatus}>
                      <InputLabel id="status-label">Status</InputLabel>
                      <Select
                        {...field}
                        labelId="status-label"
                        label="Status"
                        disabled={isDisabled}
                      >
                        <MenuItem value={SubProductStatus.ACTIVE}>Active</MenuItem>
                        <MenuItem value={SubProductStatus.INACTIVE}>Inactive</MenuItem>
                        <MenuItem value={SubProductStatus.DEACTIVE}>Deactive</MenuItem>
                      </Select>
                      <FormHelperText>{errors.subProductStatus?.message}</FormHelperText>
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
            </Grid>
          </FormSection>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              component={RouterLink}
              to="/subproducts"
              variant="outlined"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isDisabled}
              startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {isEdit ? 'Update' : 'Create'} SubProduct
            </Button>
          </Box>
        </form>
      )}
    </Box>
  );
};

export default SubProductForm;
