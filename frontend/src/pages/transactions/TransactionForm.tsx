import { Add as AddIcon, ArrowBack as ArrowBackIcon, Delete as DeleteIcon, Save as SaveIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAllCustomerAccounts } from '../../api/customerAccountService';
import { createTransaction } from '../../api/transactionService';
import { FormSection, PageHeader } from '../../components/common';
import type { CustomerAccountResponseDTO, TransactionRequestDTO } from '../../types';
import { DrCrFlag } from '../../types';

// Available currencies
const CURRENCIES = ['BDT', 'USD', 'EUR', 'GBP', 'JPY'];

const TransactionForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState<string>('');
  const [totalDebit, setTotalDebit] = useState<number>(0);
  const [totalCredit, setTotalCredit] = useState<number>(0);
  const [isBalanced, setIsBalanced] = useState<boolean>(false);

  // Fetch customer accounts for dropdown
  const { data: accountsData, isLoading: isLoadingAccounts } = useQuery({
    queryKey: ['accounts', { page: 0, size: 100 }], // Get all accounts for dropdown
    queryFn: () => getAllCustomerAccounts(0, 100),
  });

  // Set current date on component mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setCurrentDate(today);
  }, []);

  // Form setup with react-hook-form
  const { 
    control, 
    handleSubmit, 
    setValue,
    watch,
    formState: { errors }
  } = useForm<TransactionRequestDTO>({
    defaultValues: {
      valueDate: currentDate || new Date().toISOString().split('T')[0],
      narration: '',
      lines: [
        { accountNo: '', drCrFlag: DrCrFlag.D, tranCcy: 'BDT', fcyAmt: 0, exchangeRate: 1, lcyAmt: 0, udf1: '' },
        { accountNo: '', drCrFlag: DrCrFlag.C, tranCcy: 'BDT', fcyAmt: 0, exchangeRate: 1, lcyAmt: 0, udf1: '' }
      ]
    }
  });

  // Field array for transaction lines
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lines'
  });

  // Watch all lines to calculate totals
  const lines = watch('lines');

  // Calculate totals whenever lines change
  useEffect(() => {
    let debitTotal = 0;
    let creditTotal = 0;

    lines.forEach(line => {
      if (line.drCrFlag === DrCrFlag.D && !isNaN(line.lcyAmt)) {
        debitTotal += Number(line.lcyAmt);
      } else if (line.drCrFlag === DrCrFlag.C && !isNaN(line.lcyAmt)) {
        creditTotal += Number(line.lcyAmt);
      }
    });

    setTotalDebit(debitTotal);
    setTotalCredit(creditTotal);
    setIsBalanced(Math.abs(debitTotal - creditTotal) < 0.01); // Allow for very small rounding differences
  }, [lines]);

  // Set current date when available
  useEffect(() => {
    if (currentDate) {
      setValue('valueDate', currentDate);
    }
  }, [currentDate, setValue]);

  // Create transaction mutation
  const createTransactionMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction created successfully');
      navigate(`/transactions/${data.tranId}`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create transaction: ${error.message}`);
    }
  });

  const isLoading = createTransactionMutation.isPending || isLoadingAccounts;

  // Add a new transaction line
  const addLine = () => {
    append({ 
      accountNo: '', 
      drCrFlag: DrCrFlag.C, 
      tranCcy: 'BDT', 
      fcyAmt: 0, 
      exchangeRate: 1, 
      lcyAmt: 0, 
      udf1: '' 
    });
  };

  // Submit handler
  const onSubmit = (data: TransactionRequestDTO) => {
    // Validate all amounts are greater than 0
    const invalidLines = data.lines.filter(line => !line.lcyAmt || line.lcyAmt <= 0);
    if (invalidLines.length > 0) {
      toast.error('All lines must have an amount greater than zero');
      return;
    }

    // Calculate totals manually to ensure precision
    let debitTotal = 0;
    let creditTotal = 0;
    
    data.lines.forEach(line => {
      const amount = parseFloat(String(line.lcyAmt));
      if (line.drCrFlag === DrCrFlag.D) {
        debitTotal += amount;
      } else if (line.drCrFlag === DrCrFlag.C) {
        creditTotal += amount;
      }
    });

    // Round to 2 decimal places to avoid floating point precision issues
    debitTotal = Math.round(debitTotal * 100) / 100;
    creditTotal = Math.round(creditTotal * 100) / 100;

    console.log('Transaction validation:', {
      debitTotal,
      creditTotal,
      difference: Math.abs(debitTotal - creditTotal),
      isBalanced: debitTotal === creditTotal
    });

    // Ensure debit equals credit before submitting
    if (debitTotal !== creditTotal) {
      toast.error(`Transaction is not balanced. Debit: ${debitTotal} BDT, Credit: ${creditTotal} BDT`);
      return;
    }

    // Ensure all numeric fields are properly formatted and rounded to 2 decimals
    const formattedData = {
      ...data,
      lines: data.lines.map(line => ({
        ...line,
        fcyAmt: Math.round((Number(line.fcyAmt) || 0) * 100) / 100,
        exchangeRate: Number(line.exchangeRate) || 1,
        lcyAmt: Math.round((Number(line.lcyAmt) || 0) * 100) / 100
      }))
    };

    // Log the data being sent for debugging
    console.log('Submitting transaction data:', JSON.stringify(formattedData, null, 2));

    createTransactionMutation.mutate(formattedData);
  };

  return (
    <Box>
      <PageHeader
        title="Create Transaction"
        buttonText="Back to Transactions"
        buttonLink="/transactions"
        startIcon={<ArrowBackIcon />}
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormSection title="Transaction Information">
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="valueDate"
                control={control}
                rules={{ required: 'Value Date is mandatory' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Value Date"
                    type="date"
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.valueDate}
                    helperText={errors.valueDate?.message}
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="narration"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Narration"
                    fullWidth
                    multiline
                    rows={1}
                    error={!!errors.narration}
                    helperText={errors.narration?.message}
                    disabled={true}
                  />
                )}
              />
            </Grid>
          </Grid>
        </FormSection>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Transaction Lines</Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addLine}
              disabled={isLoading}
            >
              Add Line
            </Button>
          </Box>

          {fields.map((field, index) => (
            <Box key={field.id} mb={3} p={2} border="1px solid #e0e0e0" borderRadius={1}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="subtitle1">Line {index + 1}</Typography>
                    {fields.length > 2 && (
                      <IconButton 
                        color="error" 
                        onClick={() => remove(index)}
                        disabled={isLoading}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name={`lines.${index}.accountNo`}
                    control={control}
                    rules={{ required: 'Account Number is required' }}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.lines?.[index]?.accountNo} disabled={isLoading}>
                        <InputLabel id={`account-label-${index}`}>Account</InputLabel>
                        <Select
                          {...field}
                          labelId={`account-label-${index}`}
                          label="Account"
                        >
                          {accountsData?.content.map((account: CustomerAccountResponseDTO) => (
                            <MenuItem key={account.accountNo} value={account.accountNo}>
                              {account.accountNo} - {account.acctName}
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText>{errors.lines?.[index]?.accountNo?.message}</FormHelperText>
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name={`lines.${index}.drCrFlag`}
                    control={control}
                    rules={{ required: 'Debit/Credit Flag is required' }}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.lines?.[index]?.drCrFlag} disabled={isLoading}>
                        <InputLabel id={`drcr-label-${index}`}>Dr/Cr</InputLabel>
                        <Select
                          {...field}
                          labelId={`drcr-label-${index}`}
                          label="Dr/Cr"
                        >
                          <MenuItem value={DrCrFlag.D}>Debit</MenuItem>
                          <MenuItem value={DrCrFlag.C}>Credit</MenuItem>
                        </Select>
                        <FormHelperText>{errors.lines?.[index]?.drCrFlag?.message}</FormHelperText>
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Controller
                    name={`lines.${index}.tranCcy`}
                    control={control}
                    rules={{ required: 'Currency is required' }}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.lines?.[index]?.tranCcy} disabled={isLoading}>
                        <InputLabel id={`currency-label-${index}`}>Currency</InputLabel>
                        <Select
                          {...field}
                          labelId={`currency-label-${index}`}
                          label="Currency"
                        >
                          {CURRENCIES.map(currency => (
                            <MenuItem key={currency} value={currency}>{currency}</MenuItem>
                          ))}
                        </Select>
                        <FormHelperText>{errors.lines?.[index]?.tranCcy?.message}</FormHelperText>
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Controller
                    name={`lines.${index}.fcyAmt`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Amount FCY"
                        type="number"
                        fullWidth
                        InputProps={{
                          readOnly: true,
                          startAdornment: (
                            <InputAdornment position="start">
                              {watch(`lines.${index}.tranCcy`)}
                            </InputAdornment>
                          ),
                        }}
                        error={!!errors.lines?.[index]?.fcyAmt}
                        helperText={errors.lines?.[index]?.fcyAmt?.message}
                        disabled={true}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Controller
                    name={`lines.${index}.exchangeRate`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Exchange Rate"
                        type="number"
                        fullWidth
                        InputProps={{
                          readOnly: true,
                        }}
                        error={!!errors.lines?.[index]?.exchangeRate}
                        helperText={errors.lines?.[index]?.exchangeRate?.message}
                        disabled={true}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name={`lines.${index}.lcyAmt`}
                    control={control}
                    rules={{ 
                      required: 'LCY Amount is required',
                      min: { value: 0.01, message: 'Amount must be greater than zero' }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Amount LCY"
                        type="number"
                        fullWidth
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              BDT
                            </InputAdornment>
                          ),
                        }}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          // Allow empty string for clearing the field
                          if (inputValue === '') {
                            field.onChange(0);
                            setValue(`lines.${index}.fcyAmt`, 0);
                            return;
                          }
                          const value = parseFloat(inputValue);
                          if (!isNaN(value)) {
                            field.onChange(value);
                            // For now, since exchange rate is 1 and currency is BDT, FCY equals LCY
                            setValue(`lines.${index}.fcyAmt`, value);
                          }
                        }}
                        error={!!errors.lines?.[index]?.lcyAmt}
                        helperText={errors.lines?.[index]?.lcyAmt?.message}
                        disabled={isLoading}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name={`lines.${index}.udf1`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Narration"
                        fullWidth
                        error={!!errors.lines?.[index]?.udf1}
                        helperText={errors.lines?.[index]?.udf1?.message}
                        disabled={isLoading}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>
          ))}

          {/* Transaction Totals */}
          <Paper variant="outlined" sx={{ p: 2, mt: 2, backgroundColor: '#f9f9f9' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1">Total Debit:</Typography>
                <Typography variant="h6">{totalDebit.toLocaleString()} BDT</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1">Total Credit:</Typography>
                <Typography variant="h6">{totalCredit.toLocaleString()} BDT</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1">Difference:</Typography>
                <Typography 
                  variant="h6" 
                  color={isBalanced ? 'success.main' : 'error.main'}
                >
                  {Math.abs(totalDebit - totalCredit).toLocaleString()} BDT
                  {isBalanced && ' (Balanced)'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {!isBalanced && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Transaction is not balanced. Total debit must equal total credit.
            </Alert>
          )}
        </Paper>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            component={RouterLink}
            to="/transactions"
            variant="outlined"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || !isBalanced || fields.length < 2}
            startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            Create Transaction
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default TransactionForm;
