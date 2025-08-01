import { createTheme, responsiveFontSizes } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    contrast: {
      main: '#121212',
      text: '#fff',
    },
    primary: {
      main: '#F9943B', // orange - your brand color
      light: '#FBA96B',
      dark: '#E8822B',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0C5595', // blue - your brand color
      light: '#3572B5',
      dark: '#162944', // dark blue
      contrastText: '#ffffff',
    },
    neutral: {
      main: '#DCDCE0',
      text: '#000',
    },
    // Modern color additions
    background: {
      default: '#FAFBFC', // Softer, more modern background
      paper: '#FFFFFF',
      surface: '#F8F9FA', // For cards and surfaces
    },
    text: {
      primary: '#1A1A1A', // Softer black for better readability
      secondary: '#6B7280', // Modern gray for secondary text
      disabled: '#9CA3AF',
    },
    divider: '#E5E7EB',
    // Status colors (modern design systems)
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#047857',
    },
    warning: {
      main: '#F59E0B',
      light: '#FCD34D',
      dark: '#D97706',
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
    },
    info: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#1D4ED8',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif', // Modern font stack
    button: {
      textTransform: 'none',
      fontWeight: 500,
      fontSize: '0.875rem',
      letterSpacing: '0.02em',
    },
    h1: {
      color: '#162944',
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      color: '#162944',
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      color: '#162944',
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h4: {
      color: '#162944',
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h5: {
      color: '#162944',
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.5,
    },
    h6: {
      color: '#162944',
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#1A1A1A',
    },
    body2: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
      color: '#6B7280',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
      color: '#9CA3AF',
    },
  },
  spacing: 8, // Modern 8px spacing system
  shape: {
    borderRadius: 12, // More modern rounded corners
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(0, 0, 0, 0.05)', // Subtle shadow
    '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)', // Card shadow
    '0px 4px 6px rgba(0, 0, 0, 0.07), 0px 2px 4px rgba(0, 0, 0, 0.06)', // Elevated shadow
    '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05)', // Higher elevation
    '0px 20px 25px rgba(0, 0, 0, 0.1), 0px 8px 10px rgba(0, 0, 0, 0.04)', // Modal shadow
    '0px 25px 50px rgba(0, 0, 0, 0.15)', // Maximum elevation
    ...Array(17).fill('none'), // Fill remaining shadow levels
  ],
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          padding: 0,
          backgroundColor: '#FAFBFC',
          color: '#1A1A1A',
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          '&#fc_frame, #fc_frame.fc-widget-normal': {
            bottom: '100px !important',
          },
        },
        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor: '#CBD5E0 #F7FAFC',
        },
        '*::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '*::-webkit-scrollbar-track': {
          background: '#F7FAFC',
        },
        '*::-webkit-scrollbar-thumb': {
          background: '#CBD5E0',
          borderRadius: '4px',
        },
        '*::-webkit-scrollbar-thumb:hover': {
          background: '#A0AEC0',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          transition: 'box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.07), 0px 2px 4px rgba(0, 0, 0, 0.06)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
        },
        elevation1: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
        },
        elevation2: {
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.07), 0px 2px 4px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
          padding: '10px 20px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
          '&:hover': {
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.07), 0px 2px 4px rgba(0, 0, 0, 0.06)',
          },
        },
        containedPrimary: {
          backgroundColor: '#F9943B',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#E8822B',
          },
          '&:disabled': {
            backgroundColor: '#E5E7EB',
            color: '#9CA3AF',
          },
        },
        containedSecondary: {
          backgroundColor: '#0C5595',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#162944',
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            transition: 'all 0.2s ease-in-out',
            '& fieldset': {
              borderColor: '#E5E7EB',
            },
            '&:hover fieldset': {
              borderColor: '#CBD5E0',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#F9943B',
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          fontWeight: 500,
          fontSize: '0.75rem',
        },
        filled: {
          backgroundColor: '#F3F4F6',
          color: '#374151',
          '&:hover': {
            backgroundColor: '#E5E7EB',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          height: '6px',
          backgroundColor: '#E5E7EB',
        },
        bar: {
          borderRadius: '4px',
        },
      },
    },
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          color: '#000',
          backgroundColor: 'transparent',
          borderRadius: '8px',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: '8px',
          boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #E5E7EB',
        },
        list: {
          paddingTop: 4,
          paddingBottom: 4,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          margin: '2px 8px',
          padding: '8px 12px',
          transition: 'all 0.15s ease-in-out',
          '&:hover': {
            backgroundColor: '#F3F4F6',
          },
          '&.Mui-selected': {
            backgroundColor: '#FEF3E2',
            color: '#F9943B',
            '&:hover': {
              backgroundColor: '#FED7AA',
            },
          },
          '+.MuiDivider-root': {
            marginTop: 0,
            marginBottom: 0,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#E3F2FD !important', // Light blue with !important
          fontWeight: '600 !important',
          fontSize: '0.75rem !important',
          color: '#0C5595 !important', // Brand blue text with !important
          textTransform: 'uppercase !important',
          letterSpacing: '0.05em !important',
        },
        root: {
          borderBottom: '1px solid #E5E7EB',
        },
      },
    },
    // Additional specific targeting for MUI DataTable
    MUIDataTable: {
      styleOverrides: {
        paper: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MUIDataTableHeadCell: {
      styleOverrides: {
        root: {
          backgroundColor: '#E3F2FD !important',
          color: '#0C5595 !important',
          fontWeight: '600 !important',
          fontSize: '0.75rem !important',
          textTransform: 'uppercase !important',
          letterSpacing: '0.05em !important',
        },
        sortAction: {
          color: '#0C5595 !important',
        },
        data: {
          color: '#0C5595 !important',
          fontWeight: '600 !important',
        },
      },
    },
    MUIDataTableToolbar: {
      styleOverrides: {
        root: {
          backgroundColor: '#F8F9FA',
          borderBottom: '1px solid #E5E7EB',
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          '& .MuiTableRow-root:hover': {
            backgroundColor: '#F9FAFB',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
          borderBottom: '1px solid #E5E7EB',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid #E5E7EB',
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.07), 0px 2px 4px rgba(0, 0, 0, 0.06)',
        },
      },
    },
  },
});

export default responsiveFontSizes(theme);
