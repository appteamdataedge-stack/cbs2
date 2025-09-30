import { Box, CssBaseline, ThemeProvider, Typography, createTheme, responsiveFontSizes } from '@mui/material';
import type { ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './Navbar';

// Create a theme instance
let theme = createTheme({
  palette: {
    primary: {
      light: '#4dabf5',
      main: '#1976d2',
      dark: '#1565c0',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ff4081',
      main: '#f50057',
      dark: '#c51162',
      contrastText: '#fff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
    success: {
      main: '#4caf50',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#2196f3',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
        contained: {
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
        },
        elevation1: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          overflow: 'hidden',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '16px',
        },
        head: {
          fontWeight: 600,
          backgroundColor: 'rgba(25, 118, 210, 0.04)',
        },
      },
    },
  },
});

// Make fonts responsive
theme = responsiveFontSizes(theme);

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
        <Navbar />
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            width: '100%',
            py: { xs: 2, sm: 3, md: 4 },
            px: { xs: 1, sm: 2, md: 3 }
          }}
        >
          <Box
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              bgcolor: 'background.paper',
              p: { xs: 2, sm: 3 },
              width: '100%',
              maxWidth: '100%',
            }}
          >
            {children}
          </Box>
        </Box>
        <Box 
          component="footer" 
          sx={{ 
            py: 3, 
            textAlign: 'center', 
            mt: 'auto',
            width: '100%',
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}
        >
          <Box sx={{ 
            width: '100%',
            px: { xs: 2, sm: 3, md: 4 }
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' } }}>
              <Typography variant="body2" color="text.secondary">
                Money Market System &copy; {new Date().getFullYear()}
              </Typography>
              <Box sx={{ mt: { xs: 1, sm: 0 } }}>
                <Typography variant="body2" color="text.secondary" component="span" sx={{ mx: 1 }}>
                  Privacy Policy
                </Typography>
                <Typography variant="body2" color="text.secondary" component="span" sx={{ mx: 1 }}>
                  Terms of Service
                </Typography>
                <Typography variant="body2" color="text.secondary" component="span" sx={{ mx: 1 }}>
                  Contact
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </ThemeProvider>
  );
};

export default Layout;
