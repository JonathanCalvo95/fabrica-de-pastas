import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Theme {
    customGradients: {
      pasta: string;
    };
    chartColors: {
      ventasLine: string;
      promedioLine: string;
      barVentas: string;
      pagoEfectivo: string;
      pagoTransferencia: string;
      pagoDebito: string;
      pagoCredito: string;
      pagoMercadoPago: string;
      pagoFallback: string;
    };
  }
  interface ThemeOptions {
    customGradients?: {
      pasta?: string;
    };
    chartColors?: {
      ventasLine?: string;
      promedioLine?: string;
      barVentas?: string;
      pagoEfectivo?: string;
      pagoTransferencia?: string;
      pagoDebito?: string;
      pagoCredito?: string;
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
    primary: {
      main: "#D4A574", // Dorado pasta
      light: "#E8C9A0",
      dark: "#B8905E",
      contrastText: "#2C1810",
    },
    secondary: {
      main: "#F5E6D3",
      dark: "#D4C4B0",
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
      primary: "#2C1810",
      secondary: "#8B7355",
    },
    accent: {
      // opcional para chips/badges
      main: "#EADBC8",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: "2.5rem", fontWeight: 700 },
    h2: { fontSize: "2rem", fontWeight: 600 },
    h3: { fontSize: "1.5rem", fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
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
