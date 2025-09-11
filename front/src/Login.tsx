import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

export default function SignIn(props: { disableCustomTheme?: boolean }) {
  const [userError, setUserError] = React.useState(false);
  const [userErrorMessage, setUserErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (userError || passwordError) {
      event.preventDefault();
      return;
    }
    const data = new FormData(event.currentTarget);
    console.log({
      user: data.get('user'),
      password: data.get('password'),
    });
  };

  const validateInputs = () => {
    const user = document.getElementById('user') as HTMLInputElement;
    const password = document.getElementById('password') as HTMLInputElement;

    let isValid = true;

    if (!user.value || !/\S+@\S+\.\S+/.test(user.value)) {
      setUserError(true);
      setUserErrorMessage('Please enter a valid user.');
      isValid = false;
    } else {
      setUserError(false);
      setUserErrorMessage('');
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters long.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    return isValid;
  };

  return (
        <Card>
          <CardContent>
          <Typography component="h1" variant="h4" sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}>
            Iniciar sesion
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: 2,
            }}
          >
            <FormControl>
              <FormLabel htmlFor="user">Usuario</FormLabel>
              <TextField
                error={userError}
                helperText={userErrorMessage}
                id="user"
                type="text"
                name="user"
                placeholder="usuario"
                autoComplete="user"
                autoFocus
                required
                variant="outlined"
                color={userError ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                error={passwordError}
                helperText={passwordErrorMessage}
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="current-password"
                autoFocus
                required
                variant="outlined"
                color={passwordError ? 'error' : 'primary'}
              />
            </FormControl>

            <Button type="submit" fullWidth variant="contained" onClick={validateInputs}>
              Ingresar
            </Button>
          </Box>
          </CardContent>
        </Card>
  );
}