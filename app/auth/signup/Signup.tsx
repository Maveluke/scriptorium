'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TextField,
  Button,
  Typography,
  Paper,
  Box,
  Alert,
  IconButton,
  CircularProgress,
  InputAdornment,
  Grid,
} from '@mui/material';
import { Eye, EyeOff, X } from 'lucide-react';
import { useTheme } from "@/app/contexts/ThemeContext";
import Link from 'next/link';

export default function Signup() {
  const router = useRouter();
  const { theme } = useTheme();

  const [username, setUsername] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  interface SignupData {
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    confirmPassword: string;
    phoneNumber: string;
  }

  interface ErrorResponse {
    message: string;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const signupData: SignupData = {
      username,
      firstname,
      lastname,
      email,
      password,
      confirmPassword,
      phoneNumber
    };

    try {
      const response = await fetch('/api/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      if (response.ok) {
        setUsername('');
        setFirstname('');
        setLastname('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setPhoneNumber('');
        setError(null);
        console.log('User created successfully');
        router.push('/auth/login');
      } else {
        const errorData: ErrorResponse = await response.json();
        console.log("error: " + errorData.message);
        setError(errorData.message);
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
      bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'background.default',
      '&:hover': {
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.6)' : 'action.hover',
      },
      '& fieldset': {
        borderColor: 'divider',
      },
      '&:hover fieldset': {
        borderColor: 'primary.main',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'primary.main',
      },
    },
    '& .MuiInputLabel-root': {
      color: 'text.secondary',
      '&.Mui-focused': {
        color: 'primary.main',
      },
    },
    '& .MuiOutlinedInput-input': {
      color: 'text.primary',
    },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: '100%',
          maxWidth: 600,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Box sx={{ p: 4 }}>
          <Typography
            variant="h4"
            align="center"
            sx={{
              color: 'primary.main',
              mb: 2,
              fontWeight: 'bold'
            }}
          >
            Scriptorium
          </Typography>

          <Typography
            variant="h6"
            align="center"
            sx={{
              color: 'text.primary',
              mb: 4
            }}
          >
            Create Account
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Username"
                  variant="outlined"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                  color="primary"
                  sx={textFieldStyles}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  variant="outlined"
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                  required
                  disabled={isLoading}
                  color="primary"
                  sx={textFieldStyles}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  variant="outlined"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  required
                  disabled={isLoading}
                  color="primary"
                  sx={textFieldStyles}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  color="primary"
                  sx={textFieldStyles}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  type="tel"
                  variant="outlined"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  disabled={isLoading}
                  color="primary"
                  sx={textFieldStyles}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  color="primary"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={togglePasswordVisibility}
                          edge="end"
                          disabled={isLoading}
                          sx={{ color: 'text.secondary' }}
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={textFieldStyles}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  variant="outlined"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  color="primary"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={toggleConfirmPasswordVisibility}
                          edge="end"
                          disabled={isLoading}
                          sx={{ color: 'text.secondary' }}
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={textFieldStyles}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                bgcolor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
                '&:disabled': {
                  bgcolor: 'action.disabledBackground',
                },
                height: 48,
                fontSize: '1rem',
                fontWeight: 600,
                mt: 3,
                mb: 3,
              }}
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                bgcolor: theme.palette.mode === 'dark'
                  ? 'rgba(127, 29, 29, 0.1)'
                  : 'error.light',
                border: '1px solid',
                borderColor: 'error.main',
                '& .MuiAlert-message': {
                  color: theme.palette.mode === 'dark'
                    ? 'rgb(248, 113, 113)'
                    : 'error.dark',
                },
                '& .MuiAlert-icon': {
                  color: theme.palette.mode === 'dark'
                    ? 'rgb(248, 113, 113)'
                    : 'error.main',
                },
              }}
              action={
                <IconButton
                  aria-label="close"
                  size="small"
                  onClick={() => setError(null)}
                  sx={{
                    color: theme.palette.mode === 'dark'
                      ? 'rgb(248, 113, 113)'
                      : 'error.main'
                  }}
                >
                  <X size={18} />
                </IconButton>
              }
            >
              {error}
            </Alert>
          )}

          <Typography
            align="center"
            sx={{
              color: 'text.secondary',
              fontSize: '0.875rem'
            }}
          >
            Already have an account?{' '}
            <Link
              href="/auth/login"
              style={{
                color: theme.palette.primary.main,
                textDecoration: 'none',
                transition: 'color 0.2s ease-in-out',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = theme.palette.primary.light;
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = theme.palette.primary.main;
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              Sign in
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}