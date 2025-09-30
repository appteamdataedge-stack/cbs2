import { Add as AddIcon, Edit as EditIcon, Verified as VerifiedIcon } from '@mui/icons-material';
import { Box, IconButton, Tooltip } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAllSubProducts, verifySubProduct } from '../../api/subProductService';
import { DataTable, PageHeader, StatusBadge, VerificationModal, ErrorDisplay } from '../../components/common';
import type { Column } from '../../components/common';
import type { CustomerVerificationDTO, SubProductResponseDTO, SubProductStatus } from '../../types';

const SubProductList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sort, setSort] = useState<string | undefined>(undefined);
  const [verificationModal, setVerificationModal] = useState<{
    open: boolean;
    subProductId: number | null;
  }>({
    open: false,
    subProductId: null,
  });

  // Fetch subproducts
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['subProducts', { page, size: rowsPerPage, sort }],
    queryFn: () => getAllSubProducts(page, rowsPerPage, sort),
    retry: 3,
    retryDelay: 1000
  });

  // Handle error if needed
  if (error) {
    console.error('Error fetching subproducts:', error);
  }

  // Handle sort
  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSort(`${field},${direction}`);
  };

  // Handle verify
  const handleOpenVerifyModal = (subProductId: number) => {
    setVerificationModal({
      open: true,
      subProductId,
    });
  };

  const handleCloseVerifyModal = () => {
    setVerificationModal({
      open: false,
      subProductId: null,
    });
  };

  const handleVerify = async (verifierId: string) => {
    if (!verificationModal.subProductId) return;

    try {
      const verificationData: CustomerVerificationDTO = { verifierId };
      await verifySubProduct(verificationModal.subProductId, verificationData);
      toast.success('SubProduct verified successfully');
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to verify subproduct');
      throw err; // Re-throw to let the modal component handle the error
    }
  };

  // Table columns
  const columns: Column<SubProductResponseDTO>[] = [
    { id: 'subProductId', label: 'ID', minWidth: 50, sortable: true },
    { id: 'subProductCode', label: 'SubProduct Code', minWidth: 120, sortable: true },
    { id: 'subProductName', label: 'SubProduct Name', minWidth: 180, sortable: true },
    { id: 'productName', label: 'Product', minWidth: 150 },
    { 
      id: 'interestRate', 
      label: 'Interest Rate', 
      minWidth: 100,
      format: (value: number | null | undefined) => (value !== null && value !== undefined) ? `${value.toFixed(2)}%` : 'N/A'
    },
    { 
      id: 'status', 
      label: 'Status', 
      minWidth: 100,
      format: (value: SubProductStatus | null | undefined) => (
        <StatusBadge status={value || 'UNKNOWN'} />
      )
    },
    { 
      id: 'verified', 
      label: 'Verification', 
      minWidth: 100,
      format: (value: boolean | null | undefined) => (
        <StatusBadge status={value === true ? 'VERIFIED' : 'PENDING'} />
      )
    },
    { 
      id: 'actions', 
      label: 'Actions', 
      minWidth: 100,
      format: (_: any, row: SubProductResponseDTO) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton 
              component={RouterLink} 
              to={`/subproducts/${row.subProductId}`} 
              color="primary"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          {!row.verified && (
            <Tooltip title="Verify">
              <IconButton 
                color="success" 
                onClick={() => handleOpenVerifyModal(row.subProductId)}
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
        title="SubProduct Management"
        buttonText="Add SubProduct"
        buttonLink="/subproducts/new"
        startIcon={<AddIcon />}
      />

      {error ? (
        <ErrorDisplay 
          error={error} 
          title="Error Loading SubProducts" 
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
          idField="subProductId"
        />
      )}

      <VerificationModal
        open={verificationModal.open}
        onClose={handleCloseVerifyModal}
        onVerify={handleVerify}
        title="Verify SubProduct"
        description="Please enter your user ID to verify this subproduct."
      />
    </Box>
  );
};

export default SubProductList;
