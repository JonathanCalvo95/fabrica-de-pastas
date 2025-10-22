import { Box, Typography, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

type Props = {
  code?: string;
  title: string;
  message?: string;
  Icon: React.ElementType;
  actionLabel?: string;
  actionTo?: string;
  onActionClick?: () => void;
};

export default function ErrorPage({
  code,
  title,
  message,
  Icon,
  actionLabel = "Volver al inicio",
  actionTo = "/",
  onActionClick,
}: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "background.default",
        background: "linear-gradient(135deg, #FAF8F5 0%, #F5E6D3 100%)",
      }}
    >
      <Box sx={{ textAlign: "center", px: 3 }}>
        <Box
          sx={{
            mb: 4,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 120,
            height: 120,
            borderRadius: "50%",
            backgroundColor: "primary.light",
            boxShadow: "0 8px 24px rgba(212, 165, 116, 0.3)",
          }}
        >
          <Icon sx={{ fontSize: 64, color: "primary.dark" }} />
        </Box>

        {code && (
          <Typography
            variant="h1"
            component="h1"
            sx={{
              mb: 2,
              fontSize: { xs: "5rem", md: "7rem" },
              fontWeight: 700,
              color: "primary.main",
              textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            {code}
          </Typography>
        )}

        <Typography
          variant="h4"
          sx={{ mb: 4, color: "text.secondary", fontWeight: 500 }}
        >
          {title}
        </Typography>

        {message && (
          <Typography
            variant="body1"
            sx={{ mb: 4, color: "text.secondary", maxWidth: 400, mx: "auto" }}
          >
            {message}
          </Typography>
        )}

        <Button
          component={onActionClick ? "button" : RouterLink}
          to={onActionClick ? undefined : actionTo}
          onClick={onActionClick}
          variant="contained"
          color="primary"
          size="large"
          sx={{
            px: 4,
            py: 1.5,
            fontSize: "1rem",
            fontWeight: 600,
            boxShadow: "0 4px 14px rgba(212, 165, 116, 0.4)",
            "&:hover": { boxShadow: "0 6px 20px rgba(212, 165, 116, 0.5)" },
          }}
        >
          {actionLabel}
        </Button>
      </Box>
    </Box>
  );
}
