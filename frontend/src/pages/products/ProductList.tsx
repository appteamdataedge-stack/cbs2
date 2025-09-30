import { Add as AddIcon, Edit as EditIcon, Verified as VerifiedIcon } from '@mui/icons-material';
import { Box, IconButton, Tooltip } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAllProducts, verifyProduct } from '../../api/productService';
import { DataTable, PageHeader, StatusBadge, VerificationModal, ErrorDisplay } from '../../components/common';
import type { Column } from '../../components/common';
import type { CustomerVerificationDTO, ProductResponseDTO } from '../../types';

const ProductList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sort, setSort] = useState<string | undefined>(undefined);
  const [verificationModal, setVerificationModal] = useState<{
    open: boolean;
    productId: number | null;
  }>({
    open: false,
    productId: null,
  });

  // Fetch products
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['products', { page, size: rowsPerPage, sort }],
    queryFn: () => getAllProducts(page, rowsPerPage, sort),
  });

  // Handle sort
  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSort(`${field},${direction}`);
  };

  // Handle verify
  const handleOpenVerifyModal = (productId: number) => {
    setVerificationModal({
      open: true,
      productId,
    });
  };

  const handleCloseVerifyModal = () => {
    setVerificationModal({
      open: false,
      productId: null,
    });
  };

  const handleVerify = async (verifierId: string) => {
    if (!verificationModal.productId) return;

    try {
      const verificationData: CustomerVerificationDTO = { verifierId };
      await verifyProduct(verificationModal.productId, verificationData);
      toast.success('Product verified successfully');
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to verify product');
      throw err; // Re-throw to let the modal component handle the error
    }
  };

  // Table columns
  const columns: Column<ProductResponseDTO>[] = [
    { id: 'productId', label: 'ID', minWidth: 50, sortable: true },
    { id: 'productCode', label: 'Product Code', minWidth: 120, sortable: true },
    { id: 'productName', label: 'Product Name', minWidth: 200, sortable: true },
    { id: 'productType', label: 'Product Type', minWidth: 150 },
    { id: 'makerId', label: 'Created By', minWidth: 120 },
    { 
      id: 'entryDate', 
      label: 'Created Date', 
      minWidth: 120,
      format: (value: string) => new Date(value).toLocaleDateString()
    },
    { 
      id: 'verified', 
      label: 'Status', 
      minWidth: 100,
      format: (value: boolean) => (
        <StatusBadge status={value ? 'VERIFIED' : 'PENDING'} />
      )
    },
    { 
      id: 'actions', 
      label: 'Actions', 
      minWidth: 100,
      format: (_: any, row: ProductResponseDTO) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton 
              component={RouterLink} 
              to={`/products/${row.productId}`} 
              color="primary"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          {!row.verified && (
            <Tooltip title="Verify">
              <IconButton 
                color="success" 
                onClick={() => handleOpenVerifyModal(row.productId)}
              >
                <VerifiedIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Product Management"
        buttonText="Add Product"
        buttonLink="/products/new"
        startIcon={<AddIcon />}
      />

      {error ? (
        <ErrorDisplay 
          error={error} 
          title="Error Loading Products" 
          onRetry={refetch}
        />
      ) : (
        <DataTable
          columns={columns}
          rows={data?.content || []}
          totalItems={data?.totalElements || 0}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          onSort={handleSort}
          loading={isLoading}
          idField="productId"
        />
      )}

      <VerificationModal
        open={verificationModal.open}
        onClose={handleCloseVerifyModal}
        onVerify={handleVerify}
        title="Verify Product"
        description="Please enter your user ID to verify this product."
      />
    </Box>
  );
};

export default ProductList;
