import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f3f4f6",
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h1" component="h1" sx={{ mb: 2, fontSize: "4rem", fontWeight: "bold" }}>
          404
        </Typography>
        <Typography variant="h5" component="p" sx={{ mb: 2, color: "#4b5563" }}>
          Página no encontrada
        </Typography>
        <Button
          component={Link}
          to="/"
          variant="text"
          sx={{ textDecoration: "underline", "&:hover": { textDecoration: "underline" } }}
        >
          Volver a la Home
        </Button>
      </Box>
    </Box>
  );
};

export default NotFound;
