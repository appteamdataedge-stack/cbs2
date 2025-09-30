import { ArrowBack as ArrowBackIcon, Close as CloseIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Typography
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { closeCustomerAccount, getCustomerAccountByAccountNo } from '../../api/customerAccountService';
import { PageHeader, StatusBadge } from '../../components/common';
import { AccountStatus } from '../../types';

const AccountDetails = () => {
  const { accountNo } = useParams<{ accountNo: string }>();
  const queryClient = useQueryClient();
  const [closeConfirmDialog, setCloseConfirmDialog] = useState(false);

  // Fetch account details
  const { 
    data: account, 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['account', accountNo],
    queryFn: () => getCustomerAccountByAccountNo(accountNo || ''),
    enabled: !!accountNo,
  });

  // Close account mutation
  const closeAccountMutation = useMutation({
    mutationFn: closeCustomerAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account', accountNo] });
      queryClient.invalidateQueries({ queryKey: ['customerAccounts'] });
      toast.success('Account closed successfully');
      setCloseConfirmDialog(false);
      refetch();
    },
    onError: (error: Error) => {
      toast.error(`Failed to close account: ${error.message}`);
      setCloseConfirmDialog(false);
    },
  });

  // Handle close account
  const handleOpenCloseDialog = () => {
    setCloseConfirmDialog(true);
  };

  const handleCloseDialog = () => {
    setCloseConfirmDialog(false);
  };

  const handleCloseAccount = () => {
    if (accountNo) {
      closeAccountMutation.mutate(accountNo);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error || !account) {
    return (
      <Box>
        <PageHeader
          title="Account Details"
          buttonText="Back to Accounts"
          buttonLink="/accounts"
          startIcon={<ArrowBackIcon />}
        />
        <Alert severity="error" sx={{ mt: 2 }}>
          Error loading account details. Please try again.
        </Alert>
      </Box>
    );
  }

  // Format date
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
  };

  // Format amount
  const formatAmount = (amount: number) => {
    return `${amount.toLocaleString()} ${account.currency}`;
  };

  return (
    <Box>
      <PageHeader
        title="Account Details"
        buttonText="Back to Accounts"
        buttonLink="/accounts"
        startIcon={<ArrowBackIcon />}
      />

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5">{account.accountName}</Typography>
            <StatusBadge status={account.status} />
          </Box>
          <Typography variant="subtitle1" gutterBottom>
            Account Number: {account.accountNo}
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Balance
                </Typography>
                <Typography variant="h4">
                  {formatAmount(account.balance)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Interest Accrued
                </Typography>
                <Typography variant="h4">
                  {formatAmount(account.interestAccrued)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Currency
                  </Typography>
                  <Typography variant="body1">{account.currency}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Typography variant="body1">{account.status}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Open Date
                  </Typography>
                  <Typography variant="body1">{formatDate(account.openDate)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Close Date
                  </Typography>
                  <Typography variant="body1">{formatDate(account.closeDate)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Interest Rate
                  </Typography>
                  <Typography variant="body1">
                    {account.interestRate ? `${account.interestRate}%` : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created By
                  </Typography>
                  <Typography variant="body1">{account.makerId}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Customer Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Customer ID
                  </Typography>
                  <Typography variant="body1">
                    {account.custId} {account.extCustId ? `(${account.extCustId})` : ''}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Customer Name
                  </Typography>
                  <Typography variant="body1">{account.customerName || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    SubProduct ID
                  </Typography>
                  <Typography variant="body1">{account.subProductId}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    SubProduct
                  </Typography>
                  <Typography variant="body1">
                    {account.subProductName ? `${account.subProductName} (${account.subProductCode})` : 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {account.status === AccountStatus.OPEN && account.balance === 0 && (
        <Box mt={3} display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            color="error"
            startIcon={<CloseIcon />}
            onClick={handleOpenCloseDialog}
            disabled={closeAccountMutation.isPending}
          >
            Close Account
          </Button>
        </Box>
      )}

      {/* Close Account Confirmation Dialog */}
      <Dialog
        open={closeConfirmDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Close Account Confirmation
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to close account {account.accountNo}?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={closeAccountMutation.isPending}>Cancel</Button>
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

export default AccountDetails;
