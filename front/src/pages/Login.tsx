import React, { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { TextField, Button, Container, Box, Typography, Alert } from "@mui/material";
import { login, type ILoginRequest } from "../api/auth";

const Login: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ILoginRequest>();

  const [loginError, setLoginError] = useState<string | null>(null);

  const onSubmit: SubmitHandler<ILoginRequest> = async (data) => {
    try {
      const response = await login(data);
      const { token } = response;
      
      localStorage.setItem("authToken", token);
      
      console.log("Login successful, token received:", token);
      window.location.href = "/";
    } catch (error) {
      setLoginError("Usuario o contraseña inválidos.");
      console.error("Login failed:", error);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Fabrica de Pastas
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ mt: 1 }}
        >
          {loginError && <Alert severity="error" sx={{ mb: 2 }}>{loginError}</Alert>}
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            autoComplete="username"
            autoFocus
            {...register("username", { required: "Username is required" })}
            error={!!errors.username}
            helperText={errors.username?.message}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            {...register("password", { required: "Password is required" })}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Ingresar
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
