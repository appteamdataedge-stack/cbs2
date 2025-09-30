import { Add as AddIcon, Visibility as ViewIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTransactionById } from '../../api/transactionService';
import { DataTable, PageHeader } from '../../components/common';
import type { Column } from '../../components/common';
import type { TransactionLineResponseDTO, TransactionResponseDTO } from '../../types';
import { DrCrFlag } from '../../types';

const TransactionList = () => {
  const { tranId } = useParams<{ tranId: string }>();
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionResponseDTO | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch transaction by ID if provided in route params
  const { data: transactionData } = useQuery({
    queryKey: ['transaction', tranId],
    queryFn: () => getTransactionById(tranId || ''),
    enabled: !!tranId
  });

  // Handle transaction data when it's loaded
  if (transactionData && !selectedTransaction) {
    setSelectedTransaction(transactionData);
    setDialogOpen(true);
  }

  // Open transaction details dialog
  const handleOpenDialog = (transaction: TransactionResponseDTO) => {
    setSelectedTransaction(transaction);
    setDialogOpen(true);
  };

  // Close transaction details dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  // Mocked transaction data (would normally be fetched from API)
  // In a real implementation, you would fetch from backend with pagination
  const mockedTransactions: TransactionResponseDTO[] = [
    {
      tranId: 'TRX123456',
      valueDate: '2025-09-15',
      entryDate: '2025-09-15',
      entryTime: '14:30:00',
      narration: 'Fund transfer between accounts',
      totalAmount: 5000.00,
      userId: 'USER001',
      lines: [
        {
          lineId: 1,
          accountNo: 'ACC10001',
          accountName: 'John Doe Savings',
          drCrFlag: DrCrFlag.DEBIT,
          tranCcy: 'USD',
          fcyAmt: 5000.00,
          exchangeRate: 1.0,
          lcyAmt: 5000.00,
          udf1: 'Transfer to investment'
        },
        {
          lineId: 2,
          accountNo: 'ACC10002',
          accountName: 'John Doe Investment',
          drCrFlag: DrCrFlag.CREDIT,
          tranCcy: 'USD',
          fcyAmt: 5000.00,
          exchangeRate: 1.0,
          lcyAmt: 5000.00,
          udf1: 'Transfer from savings'
        }
      ]
    },
    {
      tranId: 'TRX123457',
      valueDate: '2025-09-14',
      entryDate: '2025-09-14',
      entryTime: '10:15:00',
      narration: 'Deposit to account',
      totalAmount: 1000.00,
      userId: 'USER002',
      lines: [
        {
          lineId: 1,
          accountNo: 'ACC10003',
          accountName: 'Sarah Smith Savings',
          drCrFlag: DrCrFlag.CREDIT,
          tranCcy: 'USD',
          fcyAmt: 1000.00,
          exchangeRate: 1.0,
          lcyAmt: 1000.00,
          udf1: 'Cash deposit'
        },
        {
          lineId: 2,
          accountNo: 'CASH001',
          accountName: 'Cash Account',
          drCrFlag: DrCrFlag.DEBIT,
          tranCcy: 'USD',
          fcyAmt: 1000.00,
          exchangeRate: 1.0,
          lcyAmt: 1000.00,
          udf1: 'Cash deposit'
        }
      ]
    }
  ];

  // Table columns
  const columns: Column<TransactionResponseDTO>[] = [
    { id: 'tranId', label: 'Transaction ID', minWidth: 150, sortable: true },
    { 
      id: 'valueDate', 
      label: 'Value Date', 
      minWidth: 120,
      format: (value: string) => formatDate(value),
      sortable: true
    },
    { 
      id: 'entryDate', 
      label: 'Entry Date', 
      minWidth: 120,
      format: (value: string) => formatDate(value)
    },
    { id: 'narration', label: 'Description', minWidth: 200 },
    { 
      id: 'totalAmount', 
      label: 'Amount', 
      minWidth: 120,
      align: 'right',
      format: (value: number) => value.toLocaleString()
    },
    { id: 'userId', label: 'Created By', minWidth: 120 },
    { 
      id: 'actions', 
      label: 'Actions', 
      minWidth: 100,
      format: (_: any, row: TransactionResponseDTO) => (
        <Box>
          <Tooltip title="View Details">
            <IconButton 
              color="primary"
              onClick={() => handleOpenDialog(row)}
            >
              <ViewIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Transactions"
        buttonText="New Transaction"
        buttonLink="/transactions/new"
        startIcon={<AddIcon />}
      />

      {/* Transaction History */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          {/* This would be replaced with the real backend data */}
          <DataTable
            columns={columns}
            rows={mockedTransactions}
            totalItems={mockedTransactions.length}
            page={0}
            rowsPerPage={10}
            onPageChange={() => {}}
            onRowsPerPageChange={() => {}}
            idField="tranId"
            emptyContent={
              <TableCell colSpan={7} align="center">
                No transactions found. Create your first transaction.
              </TableCell>
            }
          />
        </CardContent>
      </Card>

      {/* Transaction Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Transaction {selectedTransaction?.tranId}
            </Typography>
            <Button onClick={handleCloseDialog}>Close</Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Transaction ID
                  </Typography>
                  <Typography variant="body1">
                    {selectedTransaction.tranId}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Value Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(selectedTransaction.valueDate)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Entry Date/Time
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(selectedTransaction.entryDate)} {selectedTransaction.entryTime}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Narration
                  </Typography>
                  <Typography variant="body1">
                    {selectedTransaction.narration || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created By
                  </Typography>
                  <Typography variant="body1">
                    {selectedTransaction.userId}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Transaction Lines
              </Typography>

              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Account</TableCell>
                      <TableCell>Dr/Cr</TableCell>
                      <TableCell>Currency</TableCell>
                      <TableCell align="right">FCY Amount</TableCell>
                      <TableCell align="right">Exchange Rate</TableCell>
                      <TableCell align="right">LCY Amount</TableCell>
                      <TableCell>Reference</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedTransaction.lines.map((line: TransactionLineResponseDTO) => (
                      <TableRow key={line.lineId}>
                        <TableCell>{line.accountNo} {line.accountName && `(${line.accountName})`}</TableCell>
                        <TableCell>
                          <Chip 
                            label={line.drCrFlag} 
                            color={line.drCrFlag === DrCrFlag.DEBIT ? 'primary' : 'secondary'} 
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{line.tranCcy}</TableCell>
                        <TableCell align="right">{line.fcyAmt.toLocaleString()}</TableCell>
                        <TableCell align="right">{line.exchangeRate}</TableCell>
                        <TableCell align="right">{line.lcyAmt.toLocaleString()}</TableCell>
                        <TableCell>{line.udf1 || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Totals */}
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Typography variant="subtitle1">
                  Total Amount: {selectedTransaction.totalAmount.toLocaleString()} USD
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TransactionList;
