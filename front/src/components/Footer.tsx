import { Box, Container, Typography } from "@mui/material";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 2,
        mt: "auto",
        bgcolor: "background.default",
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="caption"
          color="text.secondary"
          align="center"
          sx={{ display: "block", fontSize: "0.75rem" }}
        >
          © {currentYear} Fábrica de pastas. Todos los derechos reservados.
        </Typography>
      </Container>
    </Box>
  );
};
