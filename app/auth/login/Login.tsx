'use client';

import { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Eye, EyeOff, X } from 'lucide-react';
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "@/app/contexts/ThemeContext";
import Link from 'next/link';

export interface UserAuthData {
    username: string;
    id: string;
    role: string;
}

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { accessToken, setAccessToken, setUser } = useAuth();
    const { theme } = useTheme();
    const router = useRouter();

    useEffect(() => {
        if (accessToken) {
            router.push('/');
        }
    }, [accessToken, router]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        setError(null);
        setIsLoading(true);

        if (!username.trim() || !password.trim()) {
            setError("Username and password are required");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username.trim(),
                    password: password.trim(),
                }),
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            setAccessToken(data['access-token']);
            setUser(data.user);
            router.push('/');
        } catch (err) {
            console.error('Login error:', err);
            setError(err instanceof Error ? err.message : 'Invalid username or password');
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
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
                    maxWidth: 400,
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
                        Sign In
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Username"
                            variant="outlined"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            disabled={isLoading}
                            color="primary"
                            sx={{
                                mb: 3,
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
                            }}
                        />

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
                            sx={{
                                mb: 3,
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
                            }}
                        />

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
                                mb: 3,
                            }}
                            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                        >
                            {isLoading ? 'Signing In...' : 'Sign In'}
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
                        Don't have an account?{' '}
                        <Link
                            href="/auth/signup"
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
                            Sign up
                        </Link>
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
}