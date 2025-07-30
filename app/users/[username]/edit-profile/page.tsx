"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import {
  Mail,
  Phone,
  Upload,
  Trash2,
  User as UserIcon,
  Save,
  X
} from 'lucide-react';
import { useAuth } from "@/app/contexts/AuthContext";
import { useTheme } from "@/app/contexts/ThemeContext";
import { notFound } from "next/navigation";
import UserProfileAvatar from "@/app/components/UserProfileAvatar";
import { fetchAuth } from "@/app/utils/auth";
import { RequestInit } from "next/dist/server/web/spec-extension/request";
import { useRouter } from "next/navigation";
import { User } from '@/app/types';
import BaseLayoutProfile from "@/app/components/BaseLayoutProfile";
import UserAvatar from "@/app/components/UserAvatar";

async function getUserData(currentUser: User | null, setAccessToken: (token: string) => void, router: ReturnType<typeof useRouter>): Promise<User | null> {
  try {
    const option: RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      cache: 'no-store'
    };

    const response = await fetchAuth({
      url: `/api/users?username=${currentUser?.username}`,
      options: option,
      user: currentUser,
      setAccessToken,
      router
    });

    if (!response || !response.ok) {
      console.error('Failed to fetch user data');
      notFound();
    }

    const data = await response.json();
    return data.status === 'error' ? null : data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

interface FormData {
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  about?: string;
}

interface ApiResponse {
  message?: string;
  error?: string;
}

export default function ProfileUpdate({ params }: { params: { username: string } }) {
  const router = useRouter();
  const { user: currentUser, accessToken, setAccessToken } = useAuth();
  const { theme } = useTheme();

  const [user, setUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [about, setAbout] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Common transition properties
  const transitionProps = {
    transition: theme.transitions.create([
      'background-color',
      'color',
      'border-color',
      'box-shadow'
    ], {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.standard,
    }),
  };

  const elevatedTransitionProps = {
    transition: theme.transitions.create([
      'background-color',
      'color',
      'border-color',
      'box-shadow',
      'transform'
    ], {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.standard,
    }),
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const data = await getUserData(currentUser, setAccessToken, router);
      setUser(data);
      setIsLoaded(true);
    };
    fetchUserData();
  }, [params.username, currentUser, setAccessToken, router]);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstname);
      setLastName(user.lastname);
      setEmail(user.email);
      setPhoneNumber(user.phoneNumber);
      setAbout(user.about || "");
      setIsCurrentUser(currentUser?.username === params.username);
    }
  }, [user, currentUser, params.username]);

  const handleFileUpload = async (file: File, userid: number | string) => {
    setIsUploadingAvatar(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append('image', file);
      const option = {
        method: 'POST',
        body: formData,
      };

      const response = await fetchAuth({
        url: `/api/avatar/${userid}`,
        options: option,
        user: currentUser,
        setAccessToken,
        router
      });

      if (!response) {
        throw new Error('Failed to upload avatar');
      }

      const data = await response.json();
      console.log('File uploaded successfully:', data);
      setMessage("Avatar uploaded successfully");
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
      router.refresh();
    }
  };

  const handleAvatarDelete = async (userid: number | string) => {
    setIsUploadingAvatar(true);
    setError("");
    setMessage("");

    try {
      const option = {
        method: 'DELETE',
      };

      const response = await fetchAuth({
        url: `/api/avatar/${userid}`,
        options: option,
        user: currentUser,
        setAccessToken,
        router
      });

      if (!response) {
        throw new Error('Failed to delete avatar');
      }

      const data = await response.json();
      console.log('Avatar deleted successfully:', data);
      setMessage("Avatar deleted successfully");
    } catch (error) {
      console.error('Error deleting avatar:', error);
      setError('Failed to delete avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true);

    const data: FormData = {
      firstname: firstName,
      lastname: lastName,
      email: email,
      phoneNumber: phoneNumber,
      about: about,
    };

    try {
      const option = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "access-token": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      };

      const response = await fetchAuth({
        url: `/api/users/${user?.id}`,
        options: option,
        user: currentUser,
        setAccessToken,
        router
      });

      if (!response) {
        setError("Failed to update profile");
        return;
      }

      const result: ApiResponse = await response.json();
      if (response.ok) {
        setMessage(result.message || "Profile updated successfully");
      } else {
        setError(result.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
      bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'background.default',
      ...transitionProps,
      '&:hover': {
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.6)' : 'action.hover',
      },
      '& fieldset': {
        borderColor: 'divider',
        ...transitionProps,
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
      ...transitionProps,
      '&.Mui-focused': {
        color: 'primary.main',
      },
    },
    '& .MuiOutlinedInput-input': {
      color: 'text.primary',
      ...transitionProps,
    },
  };

  if (!isCurrentUser && isLoaded) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          ...transitionProps,
        }}
      >
        <Typography variant="h6" color="error" sx={transitionProps}>
          You are not authorized to view this page
        </Typography>
      </Box>
    );
  }

  if (!isLoaded) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          ...transitionProps,
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          ...transitionProps,
        }}
      >
        <Typography variant="h6" color="text.secondary" sx={transitionProps}>
          User not found
        </Typography>
      </Box>
    );
  }

  return (
    <BaseLayoutProfile user={currentUser}>
      <Box sx={{
        maxWidth: '1200px',
        margin: '0 auto',
        p: 3,
        ...transitionProps,
      }}>
        <Grid container spacing={4}>
          {/* Profile Display Card */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={8}
              sx={{
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                overflow: 'hidden',
                ...elevatedTransitionProps,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[12],
                },
              }}
            >
              <Box sx={{ p: 4 }}>
                {/* User Header */}
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  mb: 4,
                  ...transitionProps,
                }}>
                  <Box sx={{
                    ...elevatedTransitionProps,
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                  }}>
                    <UserAvatar
                      username={user.username}
                      userId={user.id}
                      size={200}
                      clickable={false}
                    />
                  </Box>
                  <Typography
                    variant="h4"
                    sx={{
                      color: 'primary.main',
                      fontWeight: 'bold',
                      mt: 2,
                      mb: 1,
                      ...transitionProps,
                    }}
                  >
                    {user.firstname} {user.lastname}
                  </Typography>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    gutterBottom
                    sx={transitionProps}
                  >
                    @{user.username}
                  </Typography>
                </Box>

                <Divider sx={{
                  mb: 3,
                  borderColor: 'divider',
                  ...transitionProps,
                }} />

                {/* About Section */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h6"
                    color="primary.main"
                    gutterBottom
                    sx={transitionProps}
                  >
                    About Me
                  </Typography>
                  <Chip
                    label={user.about || 'No description provided'}
                    sx={{
                      bgcolor: theme.palette.mode === 'dark' ? 'primary.dark' : 'primary.light',
                      color: theme.palette.mode === 'dark' ? 'primary.light' : 'primary.dark',
                      fontWeight: 500,
                      ...elevatedTransitionProps,
                      '&:hover': {
                        transform: 'scale(1.02)',
                      },
                    }}
                  />
                </Box>

                {/* Role Section */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h6"
                    color="primary.main"
                    gutterBottom
                    sx={transitionProps}
                  >
                    Role
                  </Typography>
                  <Chip
                    icon={<UserIcon size={16} />}
                    label={user.role}
                    variant="outlined"
                    sx={{
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      ...elevatedTransitionProps,
                      '&:hover': {
                        bgcolor: 'rgba(37, 99, 235, 0.1)',
                        transform: 'scale(1.02)',
                      },
                    }}
                  />
                </Box>

                {/* Contact Information */}
                <Box>
                  <Typography
                    variant="h6"
                    color="primary.main"
                    gutterBottom
                    sx={transitionProps}
                  >
                    Contact Information
                  </Typography>
                  <List dense>
                    <ListItem sx={{
                      ...elevatedTransitionProps,
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: 'action.hover',
                        transform: 'translateX(4px)',
                      },
                    }}>
                      <ListItemAvatar>
                        <Avatar sx={{
                          bgcolor: 'primary.main',
                          width: 32,
                          height: 32,
                          ...transitionProps,
                        }}>
                          <Mail size={16} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={user.email}
                        sx={{
                          '& .MuiListItemText-primary': {
                            color: 'text.primary',
                            ...transitionProps,
                          }
                        }}
                      />
                    </ListItem>
                    <ListItem sx={{
                      ...elevatedTransitionProps,
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: 'action.hover',
                        transform: 'translateX(4px)',
                      },
                    }}>
                      <ListItemAvatar>
                        <Avatar sx={{
                          bgcolor: 'primary.main',
                          width: 32,
                          height: 32,
                          ...transitionProps,
                        }}>
                          <Phone size={16} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={user.phoneNumber}
                        sx={{
                          '& .MuiListItemText-primary': {
                            color: 'text.primary',
                            ...transitionProps,
                          }
                        }}
                      />
                    </ListItem>
                  </List>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Profile Update Form */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={8}
              sx={{
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                maxHeight: '80vh',
                overflow: 'auto',
                ...elevatedTransitionProps,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[12],
                },
              }}
            >
              <Box sx={{ p: 4 }}>
                <Typography
                  variant="h4"
                  align="center"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 'bold',
                    mb: 4,
                    ...transitionProps,
                  }}
                >
                  Update Profile
                </Typography>

                {/* Alerts */}
                {message && (
                  <Alert
                    severity="success"
                    sx={{
                      mb: 3,
                      ...elevatedTransitionProps,
                    }}
                    action={
                      <IconButton
                        aria-label="close"
                        size="small"
                        onClick={() => setMessage("")}
                        sx={{
                          color: 'success.main',
                          ...transitionProps,
                        }}
                      >
                        <X size={18} />
                      </IconButton>
                    }
                  >
                    {message}
                  </Alert>
                )}

                {error && (
                  <Alert
                    severity="error"
                    sx={{
                      mb: 3,
                      ...elevatedTransitionProps,
                    }}
                    action={
                      <IconButton
                        aria-label="close"
                        size="small"
                        onClick={() => setError("")}
                        sx={{
                          color: 'error.main',
                          ...transitionProps,
                        }}
                      >
                        <X size={18} />
                      </IconButton>
                    }
                  >
                    {error}
                  </Alert>
                )}

                {/* Avatar Management Section */}
                <Card
                  variant="outlined"
                  sx={{
                    mb: 3,
                    bgcolor: 'background.default',
                    border: '1px solid',
                    borderColor: 'divider',
                    ...elevatedTransitionProps,
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: theme.shadows[4],
                    },
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      color="primary.main"
                      gutterBottom
                      sx={transitionProps}
                    >
                      Avatar Management
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Button
                        component="label"
                        variant="outlined"
                        startIcon={isUploadingAvatar ? <CircularProgress size={20} /> : <Upload size={20} />}
                        disabled={isUploadingAvatar}
                        fullWidth
                        sx={{
                          mb: 2,
                          borderColor: 'primary.main',
                          color: 'primary.main',
                          ...elevatedTransitionProps,
                          '&:hover': {
                            borderColor: 'primary.dark',
                            bgcolor: 'rgba(37, 99, 235, 0.1)',
                            transform: 'translateY(-1px)',
                          }
                        }}
                      >
                        {isUploadingAvatar ? 'Uploading...' : 'Upload Avatar'}
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              handleFileUpload(file, user.id);
                            }
                          }}
                        />
                      </Button>
                    </Box>

                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={isUploadingAvatar ? <CircularProgress size={20} /> : <Trash2 size={20} />}
                      onClick={() => handleAvatarDelete(user.id)}
                      disabled={isUploadingAvatar}
                      fullWidth
                      sx={{
                        borderColor: 'error.main',
                        color: 'error.main',
                        ...elevatedTransitionProps,
                        '&:hover': {
                          borderColor: 'error.dark',
                          bgcolor: 'rgba(239, 68, 68, 0.1)',
                          transform: 'translateY(-1px)',
                        }
                      }}
                    >
                      {isUploadingAvatar ? 'Deleting...' : 'Delete Avatar'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Profile Update Form */}
                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        variant="outlined"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        disabled={isLoading}
                        inputProps={{ maxLength: 25 }}
                        sx={textFieldStyles}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        variant="outlined"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        disabled={isLoading}
                        inputProps={{ maxLength: 25 }}
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
                        inputProps={{ maxLength: 50 }}
                        sx={textFieldStyles}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        variant="outlined"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                        disabled={isLoading}
                        inputProps={{ maxLength: 20 }}
                        sx={textFieldStyles}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="About"
                        multiline
                        rows={3}
                        variant="outlined"
                        value={about}
                        onChange={(e) => setAbout(e.target.value)}
                        disabled={isLoading}
                        inputProps={{ maxLength: 70 }}
                        sx={textFieldStyles}
                      />
                    </Grid>
                  </Grid>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Save size={20} />}
                    sx={{
                      bgcolor: 'primary.main',
                      height: 48,
                      fontSize: '1rem',
                      fontWeight: 600,
                      mt: 3,
                      ...elevatedTransitionProps,
                      '&:hover': {
                        bgcolor: 'primary.dark',
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[8],
                      },
                      '&:disabled': {
                        bgcolor: 'action.disabledBackground',
                      },
                    }}
                  >
                    {isLoading ? 'Updating...' : 'Update Profile'}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </BaseLayoutProfile>
  );
}