import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Container,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  AttachMoney,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { login, type ILoginRequest } from "../api/auth";

export default function Login() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");

  const {
    handleSubmit,
    formState: { errors },
  } = useForm<ILoginRequest>();

  const [loginError, setLoginError] = useState<string | null>(null);

  const onSubmit: SubmitHandler<ILoginRequest> = async () => {
    try {
      const { token } = await login({ usuario, clave });
      localStorage.setItem("authToken", token);
      localStorage.setItem("usuario", usuario);
      navigate("/");
    } catch {
      setLoginError("Usuario o contraseña inválidos.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: theme.customGradients.pasta,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderRadius: 2,
            bgcolor: "background.paper",
          }}
        >
          <LoginIcon sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />

          <Typography
            component="h1"
            variant="h4"
            gutterBottom
            fontWeight="bold"
          >
            Iniciar Sesión
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Ingresa tus credenciales para acceder al sistema
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            sx={{ width: "100%" }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="usuario"
              label="Nombre de usuario"
              name="usuario"
              autoComplete="usuario"
              autoFocus
              onChange={(e) => setUsuario(e.target.value)}
              value={usuario}
              error={!!errors.usuario}
              helperText={errors.usuario?.message}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="clave"
              id="clave"
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              onChange={(e) => setClave(e.target.value)}
              value={clave}
              error={!!errors.clave}
              helperText={errors.clave?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            {loginError && (
              <Typography color="error" sx={{ mb: 2 }}>
                {loginError}
              </Typography>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ py: 1.5, mb: 2, fontWeight: "bold", fontSize: "1.1rem" }}
            >
              Ingresar
            </Button>

            <Box
              sx={{
                mt: 3,
                pt: 3,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2, textAlign: "center" }}
              >
                Listados de precios
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  justifyContent: "center",
                }}
              >
                {[1, 2, 3].map((num) => (
                  <Button
                    key={num}
                    variant="outlined"
                    size="small"
                    startIcon={<AttachMoney />}
                    onClick={() => navigate(`/precios/${num}`)}
                    sx={{ minWidth: "90px" }}
                  >
                    Precios {num}
                  </Button>
                ))}
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
