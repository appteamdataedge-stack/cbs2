import { Add as AddIcon, Visibility as ViewIcon, Close as CloseIcon } from '@mui/icons-material';
import { Box, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import { closeCustomerAccount, getAllCustomerAccounts } from '../../api/customerAccountService';
import { DataTable, PageHeader, StatusBadge, ErrorDisplay } from '../../components/common';
import type { Column } from '../../components/common';
import { AccountStatus } from '../../types';
import type { CustomerAccountResponseDTO } from '../../types';

const AccountList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sort, setSort] = useState<string | undefined>(undefined);
  const [closeConfirmDialog, setCloseConfirmDialog] = useState<{
    open: boolean;
    account: CustomerAccountResponseDTO | null;
  }>({
    open: false,
    account: null,
  });

  const queryClient = useQueryClient();

  // Fetch accounts
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['accounts', { page, size: rowsPerPage, sort }],
    queryFn: () => getAllCustomerAccounts(page, rowsPerPage, sort),
    retry: 3,
    retryDelay: 1000
  });
  
  // Handle error if needed
  if (error) {
    console.error('Error fetching customer accounts:', error);
  }

  // Close account mutation
  const closeAccountMutation = useMutation({
    mutationFn: closeCustomerAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerAccounts'] });
      toast.success('Account closed successfully');
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(`Failed to close account: ${error.message}`);
      handleCloseDialog();
    },
  });

  // Handle sort
  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSort(`${field},${direction}`);
  };

  // Handle close account
  const handleOpenCloseDialog = (account: CustomerAccountResponseDTO) => {
    setCloseConfirmDialog({
      open: true,
      account,
    });
  };

  const handleCloseDialog = () => {
    setCloseConfirmDialog({
      open: false,
      account: null,
    });
  };

  const handleCloseAccount = () => {
    if (!closeConfirmDialog.account) return;
    
    closeAccountMutation.mutate(closeConfirmDialog.account.accountNo);
  };

  // Table columns
  const columns: Column<CustomerAccountResponseDTO>[] = [
    { id: 'accountNo', label: 'Account Number', minWidth: 150, sortable: true },
    { id: 'accountName', label: 'Account Name', minWidth: 180, sortable: true },
    { id: 'customerName', label: 'Customer Name', minWidth: 180 },
    { id: 'subProductName', label: 'Product', minWidth: 150 },
    { id: 'currency', label: 'Currency', minWidth: 80 },
    { 
      id: 'balance', 
      label: 'Balance', 
      minWidth: 120,
      align: 'right',
      format: (value: number | null | undefined) => (value !== null && value !== undefined) ? `${value.toLocaleString()}` : 'N/A'
    },
    { 
      id: 'interestAccrued', 
      label: 'Interest Accrued', 
      minWidth: 120,
      align: 'right',
      format: (value: number | null | undefined) => (value !== null && value !== undefined) ? `${value.toLocaleString()}` : 'N/A'
    },
    { 
      id: 'status', 
      label: 'Status', 
      minWidth: 100,
      format: (value: AccountStatus | null | undefined) => (
        <StatusBadge status={value || 'UNKNOWN'} />
      )
    },
    { 
      id: 'actions', 
      label: 'Actions', 
      minWidth: 100,
      format: (_, row: CustomerAccountResponseDTO) => (
        <Box>
          <Tooltip title="View Details">
            <IconButton 
              component={RouterLink} 
              to={`/accounts/${row.accountNo}`} 
              color="primary"
            >
              <ViewIcon />
            </IconButton>
          </Tooltip>
          {row.accountStatus === AccountStatus.ACTIVE && row.currentBalance === 0 && (
            <Tooltip title="Close Account">
              <IconButton 
                color="error" 
                onClick={() => handleOpenCloseDialog(row)}
              >
                <CloseIcon />
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
        title="Account Management"
        buttonText="Create Account"
        buttonLink="/accounts/new"
        startIcon={<AddIcon />}
      />

      {error ? (
        <ErrorDisplay 
          error={error} 
          title="Error Loading Accounts" 
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
          idField="accountNo"
        />
      )}

      {/* Close Account Confirmation Dialog */}
      <Dialog
        open={closeConfirmDialog.open}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Close Account Confirmation
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to close account {closeConfirmDialog.account?.accountNo}?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleCloseAccount} 
            color="error" 
            autoFocus
            disabled={closeAccountMutation.isPending}
          >
            {closeAccountMutation.isPending ? 'Closing...' : 'Close Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccountList;
