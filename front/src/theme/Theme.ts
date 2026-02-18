import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Theme {
    customGradients: {
      pasta: string;
      headerSoft: string;
    };
    chartColors: {
      ventasLine: string;
      promedioLine: string;
      barVentas: string;
      pagoEfectivo: string;
      pagoTransferencia: string;
      pagoMercadoPago: string;
      pagoFallback: string;
    };
  }
  interface ThemeOptions {
    customGradients?: {
      pasta?: string;
      headerSoft?: string;
    };
    chartColors?: {
      ventasLine?: string;
      promedioLine?: string;
      barVentas?: string;
      pagoEfectivo?: string;
      pagoTransferencia?: string;
      pagoMercadoPago?: string;
      pagoFallback?: string;
    };
  }
  interface Palette {
    accent?: Palette["primary"];
  }
  interface PaletteOptions {
    accent?: PaletteOptions["primary"];
  }
}

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#D4A574", // dorado pasta
      light: "#E8C9A0",
      dark: "#B8905E",
      contrastText: "#2C1810",
    },
    secondary: {
      main: "#E9D7C0",
      dark: "#D6C3AC",
      contrastText: "#2C1810",
    },
    error: {
      main: "#DC2626",
      light: "#EF4444",
    },
    warning: {
      main: "#F59E0B",
    },
    success: {
      main: "#10B981",
    },
    background: {
      default: "#FAF8F5",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1F130D",
      secondary: "#8B7355",
    },
    accent: {
      main: "#EADBC8",
    },
    divider: "#E3D5C3",
    grey: {
      50: "#F9FAFB",
      100: "#F4F4F5",
      200: "#E4E4E7",
      300: "#D4D4D8",
      400: "#A1A1AA",
      500: "#71717A",
      600: "#52525B",
      700: "#3F3F46",
      800: "#27272A",
      900: "#18181B",
    },
  },
  typography: {
    fontFamily:
      '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontSize: "2.25rem",
      fontWeight: 700,
      letterSpacing: -0.4,
    },
    h2: {
      fontSize: "1.9rem",
      fontWeight: 600,
      letterSpacing: -0.3,
    },
    h3: {
      fontSize: "1.6rem",
      fontWeight: 600,
      letterSpacing: -0.2,
    },
    h4: {
      fontSize: "1.35rem",
      fontWeight: 600,
      letterSpacing: -0.1,
    },
    body1: { fontSize: "0.95rem", lineHeight: 1.6 },
    body2: { fontSize: "0.9rem", lineHeight: 1.55 },
    caption: {
      fontSize: "0.75rem",
      letterSpacing: 0.4,
      textTransform: "uppercase",
    },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          borderRadius: 999,
          paddingInline: 16,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: "1px solid #E3D5C3",
          boxShadow: "0 14px 40px rgba(15,23,42,0.04)",
          backgroundImage: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          borderBottom: "1px solid #E3D5C3",
          backgroundColor: "#F2E2CC",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: "1px solid #E3D5C3",
          backgroundColor: "#F5E6D3",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: 12,
          marginInline: 8,
          marginBlock: 4,
          "& .MuiListItemIcon-root": {
            minWidth: 32,
          },
          "&.Mui-selected": {
            backgroundColor: "rgba(212,165,116,0.18)",
            "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
              color: "#2C1810",
              fontWeight: 600,
            },
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: "#8B7355",
          minWidth: 28,
          "& svg": {
            fontSize: "1.1rem",
          },
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontSize: "0.9rem",
          fontWeight: 500,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontSize: "0.75rem",
          fontWeight: 500,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-root": {
            backgroundColor: "#FAF2E6",
            fontWeight: 600,
          },
        },
      },
    },
  },
  customGradients: {
    pasta: "linear-gradient(135deg, #FAF8F5 0%, #D4A574 100%)",
  },
  chartColors: {
    ventasLine: "#D4A574",
    promedioLine: "#10B981",
    barVentas: "#D4A574",
    pagoEfectivo: "#10B981",
    pagoTransferencia: "#D4A574",
    pagoMercadoPago: "#0288D1",
    pagoFallback: "#8B7355",
  },
});

export const layout = {
  TOPBAR_HEIGHT: 56,
  DRAWER_WIDTH: 240,
  DRAWER_WIDTH_COLLAPSED: 70,
  BORDER: "1px solid",
} as const;
