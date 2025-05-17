import { createTheme } from '@mui/material/styles';
import { alpha } from '@mui/material';

const gradients = {
    primary: 'linear-gradient(90deg, #4A90E2 0%, #50C9CE 100%)',
    secondary: 'linear-gradient(90deg, #FF7E5F 0%, #FEB47B 100%)',
    header: 'linear-gradient(90deg, #4A90E2 0%, #6AACE8 50%, #50C9CE 100%)',
    tableHeader: 'linear-gradient(90deg, #50C9CE 0%, #4A90E2 100%)',
    accordionCollapsed: 'linear-gradient(90deg, #6AACE8 0%, #4A90E2 100%)',
    accordionExpanded: 'linear-gradient(90deg, #FF7E5F 0%, #FEB47B 100%)',
    background: 'linear-gradient(180deg, #F5F7FA 0%, #FFFFFF 100%)',
    dialogHeader: 'linear-gradient(90deg, #50C9CE 0%, #4A90E2 100%)',
};

const theme = createTheme({
    palette: {
        mode: 'light',
        background: { default: '#F5F7FA', paper: '#FFFFFF' },
        primary: { main: '#4A90E2', contrastText: '#FFFFFF' },
        secondary: { main: '#FF7E5F', contrastText: '#FFFFFF' },
        text: { primary: '#2E3A59', secondary: alpha('#2E3A59', 0.7) },
    },
    shape: { borderRadius: 6 },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                'html, body': { background: gradients.background, minHeight: '100vh' },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: { backgroundImage: gradients.header, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 20,
                    textTransform: 'none',
                    padding: '8px 20px',
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                },
                containedPrimary: {
                    backgroundImage: gradients.primary,
                    '&:hover': {
                        backgroundPosition: 'right center',
                        boxShadow: '0 4px 16px rgba(74,144,226,0.3)',
                    },
                },
                containedSecondary: {
                    backgroundImage: gradients.secondary,
                    '&:hover': {
                        backgroundPosition: 'right center',
                        boxShadow: '0 4px 16px rgba(255,126,95,0.3)',
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 16,
                        '& fieldset': { borderColor: alpha('#2E3A59', 0.3) },
                        '&:hover fieldset': { borderColor: '#4A90E2' },
                        '&.Mui-focused fieldset': { borderColor: '#4A90E2' },
                    },
                },
            },
        },
        MuiSelect: {
            styleOverrides: {
                select: { borderRadius: 16 },
                icon: { color: '#4A90E2' },
            },
        },
        MuiTableContainer: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    backgroundImage: gradients.tableHeader,
                    color: '#FFF',
                    fontWeight: 700,
                    padding: '0.3em 0.5em',
                },
                body: {
                    padding: '0.3em 0.5em',
                    color: '#2E3A59',
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&:nth-of-type(odd)': { backgroundColor: alpha('#4A90E2', 0.04) },
                    '&:hover': { backgroundColor: alpha('#4A90E2', 0.08) },
                },
            },
        },
        MuiAccordion: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    '&:before': { display: 'none' },
                    margin: '0.4em',
                },
            },
        },
        MuiAccordionSummary: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    padding: '0 16px',
                    transition: 'background 0.3s ease',
                    backgroundImage: gradients.accordionCollapsed,
                    '&:hover': { backgroundColor: alpha('#4A90E2', 0.1) },
                    '&.Mui-expanded': { backgroundImage: gradients.accordionExpanded },
                },
                expandIconWrapper: {
                    color: '#FFFFFF',
                    transition: 'transform 0.3s ease, color 0.3s ease',
                    '&.Mui-expanded': {
                        transform: 'rotate(180deg)',
                        color: '#2E3A59',
                    },
                },
                content: {
                    '&.Mui-expanded': { margin: '12px 0' },
                },
            },
        },
        MuiAccordionDetails: {
            styleOverrides: {
                root: { padding: '16px', backgroundColor: '#F9FAFB' },
            },
        },
        MuiDialog: {
            styleOverrides: {
                root: {},
                paper: {
                    borderRadius: 12,
                    margin: '16px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease, opacity 0.3s ease',
                },
            },
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    backgroundImage: gradients.dialogHeader,
                    color: '#FFFFFF',
                    padding: '16px 24px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                },
            },
        },
        MuiDialogContent: {
            styleOverrides: {
                root: {
                    padding: '24px',
                    color: '#2E3A59',
                    '&:first-of-type': { paddingTop: '20px' },
                },
            },
        },
        MuiDialogActions: {
            styleOverrides: {
                root: {
                    padding: '16px 24px',
                    gap: '12px',
                    backgroundColor: alpha('#F5F7FA', 0.8),
                },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    color: '#FFFFFF',
                    '&.dialogClose': {
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        backgroundColor: alpha('#2E3A59', 0.2),
                        '&:hover': { backgroundColor: alpha('#2E3A59', 0.3) },
                    },
                },
            },
        },

        MuiTablePagination: {
            styleOverrides: {
                // this is the slot wrapping the next & previous buttons
                // style the container around the arrows
                actions: {
                    '& .MuiIconButton-root': {
                        color: '#4A90E2',
                        transition: 'color 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease',
                        '&:hover': {
                            color: '#50C9CE',
                            backgroundColor: alpha('#4A90E2', 0.15),    // light blue fill
                            boxShadow: '0 2px 6px rgba(0,0,0,0.12)',  // subtle lift
                        },
                        '&.Mui-disabled': {
                            color: alpha('#2E3A59', 0.3),               // toned‑down when disabled
                        },
                    },
                },
            },
        },
    },
});

export default theme;