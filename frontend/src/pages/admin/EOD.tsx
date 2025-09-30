import { PlayArrow as RunIcon } from '@mui/icons-material';
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
  TextField,
  Typography
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { runEOD } from '../../api/adminService';
import { PageHeader } from '../../components/common';
import type { EODResponse } from '../../types';

const EOD = () => {
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [eodDate, setEodDate] = useState<string>('');
  const [eodResult, setEodResult] = useState<EODResponse | null>(null);

  // Current date for default
  const today = new Date().toISOString().split('T')[0];

  // Run EOD mutation
  const runEODMutation = useMutation({
    mutationFn: (date?: string) => runEOD(date),
    onSuccess: (data) => {
      setEodResult(data);
      toast.success('End of Day process completed successfully');
      setConfirmDialog(false);
    },
    onError: (error: Error) => {
      toast.error(`Failed to run End of Day process: ${error.message}`);
      setConfirmDialog(false);
    }
  });

  // Handle date change
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEodDate(event.target.value);
  };

  // Open confirm dialog
  const handleOpenConfirmDialog = () => {
    setConfirmDialog(true);
  };

  // Close confirm dialog
  const handleCloseConfirmDialog = () => {
    setConfirmDialog(false);
  };

  // Run EOD process
  const handleRunEOD = () => {
    runEODMutation.mutate(eodDate || undefined);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <Box>
      <PageHeader title="End of Day Process" />

      <Grid container spacing={3}>
        {/* EOD Controls */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Run EOD Process
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Running the End of Day process will calculate interest accruals for all open customer accounts.
                This process should be run once per day, typically after business hours.
              </Typography>
              
              <TextField
                label="EOD Date"
                type="date"
                value={eodDate}
                onChange={handleDateChange}
                fullWidth
                margin="normal"
                helperText="Leave empty to use current date"
                InputLabelProps={{ shrink: true }}
              />

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={runEODMutation.isPending ? <CircularProgress size={20} /> : <RunIcon />}
                  onClick={handleOpenConfirmDialog}
                  disabled={runEODMutation.isPending}
                >
                  {runEODMutation.isPending ? 'Processing...' : 'Run EOD Process'}
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Information Card */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                About End of Day Processing
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary" paragraph>
                The EOD process performs the following operations:
              </Typography>
              <Box component="ul">
                <Typography component="li" variant="body2">
                  Calculates daily interest accruals based on account balances
                </Typography>
                <Typography component="li" variant="body2">
                  Updates the interest accrued field for all accounts
                </Typography>
                <Typography component="li" variant="body2">
                  Logs all interest calculations
                </Typography>
              </Box>
              <Alert severity="info" sx={{ mt: 2 }}>
                This process can take several minutes depending on the number of accounts.
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Results */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                EOD Process Results
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {eodResult ? (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Date
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(eodResult.date)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Status
                      </Typography>
                      <Typography variant="body1" color="success.main">
                        {eodResult.status}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Accounts Processed
                      </Typography>
                      <Typography variant="h5">
                        {eodResult.processedCount}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Alert severity="success">
                        EOD process completed successfully. Interest has been accrued on {eodResult.processedCount} accounts.
                      </Alert>
                    </Grid>
                  </Grid>
                </Paper>
              ) : (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    No EOD process has been run yet. Results will appear here after running the process.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Process History (mock data) */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent EOD History
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                <Box component="thead">
                  <Box component="tr" sx={{ borderBottom: '1px solid #e0e0e0' }}>
                    <Box component="th" sx={{ p: 1, textAlign: 'left' }}>Date</Box>
                    <Box component="th" sx={{ p: 1, textAlign: 'left' }}>User</Box>
                    <Box component="th" sx={{ p: 1, textAlign: 'right' }}>Accounts</Box>
                    <Box component="th" sx={{ p: 1, textAlign: 'left' }}>Status</Box>
                  </Box>
                </Box>
                <Box component="tbody">
                  <Box component="tr" sx={{ borderBottom: '1px solid #e0e0e0' }}>
                    <Box component="td" sx={{ p: 1 }}>2025-09-21</Box>
                    <Box component="td" sx={{ p: 1 }}>SYSTEM</Box>
                    <Box component="td" sx={{ p: 1, textAlign: 'right' }}>42</Box>
                    <Box component="td" sx={{ p: 1 }}>Completed</Box>
                  </Box>
                  <Box component="tr" sx={{ borderBottom: '1px solid #e0e0e0' }}>
                    <Box component="td" sx={{ p: 1 }}>2025-09-20</Box>
                    <Box component="td" sx={{ p: 1 }}>ADMIN</Box>
                    <Box component="td" sx={{ p: 1, textAlign: 'right' }}>39</Box>
                    <Box component="td" sx={{ p: 1 }}>Completed</Box>
                  </Box>
                  <Box component="tr" sx={{ borderBottom: '1px solid #e0e0e0' }}>
                    <Box component="td" sx={{ p: 1 }}>2025-09-19</Box>
                    <Box component="td" sx={{ p: 1 }}>ADMIN</Box>
                    <Box component="td" sx={{ p: 1, textAlign: 'right' }}>37</Box>
                    <Box component="td" sx={{ p: 1 }}>Completed</Box>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirm End of Day Process
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to run the End of Day process for {eodDate || today}?
            This will calculate interest accruals for all open accounts.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} disabled={runEODMutation.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleRunEOD} 
            variant="contained"
            color="primary"
            disabled={runEODMutation.isPending}
            autoFocus
          >
            {runEODMutation.isPending ? 'Processing...' : 'Run EOD'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EOD;
