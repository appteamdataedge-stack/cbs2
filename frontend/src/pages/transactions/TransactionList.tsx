import { Add as AddIcon, Visibility as ViewIcon, Search as SearchIcon } from '@mui/icons-material';
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
  Typography,
  TextField,
  InputAdornment
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getTransactionById, getAllTransactions } from '../../api/transactionService';
import { DataTable, PageHeader } from '../../components/common';
import type { Column } from '../../components/common';
import type { TransactionLineResponseDTO, TransactionResponseDTO } from '../../types';
import { DrCrFlag } from '../../types';

const TransactionList = () => {
  const { tranId } = useParams<{ tranId: string }>();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionResponseDTO | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch transaction by ID if provided in route params
  const { data: transactionData } = useQuery({
    queryKey: ['transaction', tranId],
    queryFn: () => getTransactionById(tranId || ''),
    enabled: !!tranId
  });

  // Mocked transaction data with BDT currency
  const mockedTransactions: TransactionResponseDTO[] = [
    {
      tranId: 'TRX123456',
      valueDate: '2025-01-15',
      entryDate: '2025-01-15',
      entryTime: '14:30:00',
      narration: 'Fund transfer between accounts',
      totalAmount: 50000.00,
      userId: 'USER001',
      lines: [
        {
          lineId: 1,
          accountNo: 'ACC10001',
          accountName: 'John Doe Savings',
          drCrFlag: DrCrFlag.DEBIT,
          tranCcy: 'BDT',
          fcyAmt: 50000.00,
          exchangeRate: 1.0,
          lcyAmt: 50000.00,
          udf1: 'Transfer to investment'
        },
        {
          lineId: 2,
          accountNo: 'ACC10002',
          accountName: 'John Doe Investment',
          drCrFlag: DrCrFlag.CREDIT,
          tranCcy: 'BDT',
          fcyAmt: 50000.00,
          exchangeRate: 1.0,
          lcyAmt: 50000.00,
          udf1: 'Transfer from savings'
        }
      ]
    },
    {
      tranId: 'TRX123457',
      valueDate: '2025-01-14',
      entryDate: '2025-01-14',
      entryTime: '10:15:00',
      narration: 'Deposit to account',
      totalAmount: 25000.00,
      userId: 'USER002',
      lines: [
        {
          lineId: 1,
          accountNo: 'ACC10003',
          accountName: 'Sarah Smith Savings',
          drCrFlag: DrCrFlag.CREDIT,
          tranCcy: 'BDT',
          fcyAmt: 25000.00,
          exchangeRate: 1.0,
          lcyAmt: 25000.00,
          udf1: 'Cash deposit'
        },
        {
          lineId: 2,
          accountNo: 'CASH001',
          accountName: 'Cash Account',
          drCrFlag: DrCrFlag.DEBIT,
          tranCcy: 'BDT',
          fcyAmt: 25000.00,
          exchangeRate: 1.0,
          lcyAmt: 25000.00,
          udf1: 'Cash deposit'
        }
      ]
    },
    {
      tranId: 'TRX123458',
      valueDate: '2025-01-13',
      entryDate: '2025-01-13',
      entryTime: '16:45:00',
      narration: 'Loan disbursement',
      totalAmount: 100000.00,
      userId: 'USER003',
      lines: [
        {
          lineId: 1,
          accountNo: 'ACC10004',
          accountName: 'Ahmed Hassan Current',
          drCrFlag: DrCrFlag.CREDIT,
          tranCcy: 'BDT',
          fcyAmt: 100000.00,
          exchangeRate: 1.0,
          lcyAmt: 100000.00,
          udf1: 'Personal loan disbursement'
        },
        {
          lineId: 2,
          accountNo: 'LOAN001',
          accountName: 'Personal Loan Portfolio',
          drCrFlag: DrCrFlag.DEBIT,
          tranCcy: 'BDT',
          fcyAmt: 100000.00,
          exchangeRate: 1.0,
          lcyAmt: 100000.00,
          udf1: 'Loan disbursement'
        }
      ]
    },
    {
      tranId: 'TRX123459',
      valueDate: '2025-01-12',
      entryDate: '2025-01-12',
      entryTime: '11:20:00',
      narration: 'Salary payment',
      totalAmount: 75000.00,
      userId: 'USER004',
      lines: [
        {
          lineId: 1,
          accountNo: 'ACC10005',
          accountName: 'Fatima Khatun Salary',
          drCrFlag: DrCrFlag.CREDIT,
          tranCcy: 'BDT',
          fcyAmt: 75000.00,
          exchangeRate: 1.0,
          lcyAmt: 75000.00,
          udf1: 'Monthly salary payment'
        },
        {
          lineId: 2,
          accountNo: 'PAY001',
          accountName: 'Payroll Account',
          drCrFlag: DrCrFlag.DEBIT,
          tranCcy: 'BDT',
          fcyAmt: 75000.00,
          exchangeRate: 1.0,
          lcyAmt: 75000.00,
          udf1: 'Salary payment'
        }
      ]
    },
    {
      tranId: 'TRX123460',
      valueDate: '2025-01-11',
      entryDate: '2025-01-11',
      entryTime: '09:30:00',
      narration: 'Utility bill payment',
      totalAmount: 15000.00,
      userId: 'USER005',
      lines: [
        {
          lineId: 1,
          accountNo: 'ACC10006',
          accountName: 'Rahman Electric Bill',
          drCrFlag: DrCrFlag.DEBIT,
          tranCcy: 'BDT',
          fcyAmt: 15000.00,
          exchangeRate: 1.0,
          lcyAmt: 15000.00,
          udf1: 'Electricity bill payment'
        },
        {
          lineId: 2,
          accountNo: 'UTIL001',
          accountName: 'Utility Collection Account',
          drCrFlag: DrCrFlag.CREDIT,
          tranCcy: 'BDT',
          fcyAmt: 15000.00,
          exchangeRate: 1.0,
          lcyAmt: 15000.00,
          udf1: 'Electricity bill collection'
        }
      ]
    }
  ];
  
  // Filter transactions based on search term using mocked data
  const filteredTransactions = useMemo(() => {
    if (!mockedTransactions || searchTerm.trim() === '') {
      return mockedTransactions || [];
    }
    
    const lowerCaseSearch = searchTerm.toLowerCase();
    
    return mockedTransactions.filter((transaction) => {
      // Search in various fields
      return (
        transaction.tranId.toLowerCase().includes(lowerCaseSearch) || 
        transaction.narration.toLowerCase().includes(lowerCaseSearch) ||
        transaction.userId.toLowerCase().includes(lowerCaseSearch) ||
        String(transaction.totalAmount).includes(lowerCaseSearch) ||
        transaction.valueDate.includes(lowerCaseSearch) ||
        transaction.entryDate.includes(lowerCaseSearch) ||
        transaction.entryTime.includes(lowerCaseSearch)
      );
    });
  }, [searchTerm]);
  
  // Paginated data for the table
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredTransactions.slice(startIndex, endIndex);
  }, [filteredTransactions, page, rowsPerPage]);
  
  // Reset to first page when search changes
  useEffect(() => {
    setPage(0);
  }, [searchTerm]);

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

  // Handle search input change - dynamic search as user types
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

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

      {/* Search Panel - Right aligned */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <TextField
          value={searchTerm}
          onChange={handleSearchInputChange}
          placeholder="Search transactions..."
          variant="outlined"
          size="small"
          sx={{ width: '300px' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton 
                  aria-label="clear search"
                  onClick={() => setSearchTerm('')}
                  edge="end"
                  size="small"
                >
                  <Tooltip title="Clear search">
                    <Box component="span" sx={{ display: 'flex' }}>×</Box>
                  </Tooltip>
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Box>

      {/* Transaction History */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <DataTable
            columns={columns}
            rows={paginatedData}
            totalItems={filteredTransactions.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={setRowsPerPage}
            loading={false}
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
                  Total Amount: {selectedTransaction.totalAmount.toLocaleString()} BDT
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
