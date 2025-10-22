import { Box, Button, Typography } from "@mui/material";

export default function GenericError({
  message = "Ocurrió un error inesperado.",
}: {
  message?: string;
}) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        p: 3,
      }}
    >
      <Box>
        <Typography variant="h3" sx={{ mb: 1, fontWeight: 700 }}>
          Algo salió mal 😔
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {message}
        </Typography>
        <Button onClick={() => window.location.reload()} variant="contained">
          Reintentar
        </Button>
      </Box>
    </Box>
  );
}
