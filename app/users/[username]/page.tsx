'use client';

import { notFound } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Grid,
    Avatar,
    Chip,
    Tab,
    Tabs,
    Card,
    CardContent,
    CircularProgress,
    Divider,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
} from '@mui/material';
import { Mail, Phone, Edit, FileCode, MessageCircle, User as UserIcon, BookOpen, Users2Icon } from 'lucide-react';
import TemplateCard from '@/app/components/TemplateCard';
import PostPreview from '@/app/blog-posts/search/PostPreview';
import UserAvatar from '@/app/components/UserAvatar';
import { CodeTemplate } from '@/app/types';
import { Post } from '@/app/types/post';
import { useAuth } from '@/app/contexts/AuthContext';
import { useTheme } from '@/app/contexts/ThemeContext';
import UserProfileAvatar from '@/app/components/UserProfileAvatar';
import BaseLayoutProfile from '@/app/components/BaseLayoutProfile';
import { Comment, RawComment } from '@/app/types/comment';
import { User } from '@/app/types/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/contexts/ToastContext';

async function getTemplates(username: string): Promise<CodeTemplate[]> {
    try {
        const response = await fetch(`/api/users/templates?username=${username}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store' // Ensures fresh data is fetched on each request
        });

        if (!response.ok) {
            console.error('Failed to fetch templates', response.status);
            return []; // Return an empty array if the request fails
        }

        const data = await response.json();
        return data.status === 'error' ? [] : data.templates;
    } catch (error) {
        console.error('Error fetching templates:', error);
        return [];
    }
}

// This function runs on the server and fetches user data.
async function getUserData(username: string): Promise<User | null> {
    try {
        // Find the corresponding user id from the database
        const response = await fetch(`/api/users?username=${username}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store' // Ensures fresh data is fetched on each request
        });

        if (!response.ok) {
            console.error('Failed to fetch user data');
            notFound(); // Triggers the 404 page
        }

        const data = await response.json();
        return data.status === 'error' ? null : data;
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
}

async function getComments(username: string): Promise<RawComment[]> {
    try {
        const response = await fetch(`/api/users/comments?username=${username}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store' // Ensures fresh data is fetched on each request
        });

        if (!response.ok) {
            console.error('Failed to fetch user data', response.status);
            return []; // Triggers the 404 page
        }

        const data = await response.json();
        console.log('Fetched comments:', data);
        return data.status === 'error' ? [] : data.comments;
    } catch (error) {
        console.error('Error fetching user data:', error);
        return [];
    }
}

async function getBlogPosts(username: string): Promise<Post[]> {
    try {
        console.log('Fetching blog posts for username:', username);
        const response = await fetch(`/api/users/posts?username=${username}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            console.error('Failed to fetch blog posts', response.status);
            return [];
        }

        const data = await response.json();
        return data.status === 'error' ? [] : data.posts || [];
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        return [];
    }
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`profile-tabpanel-${index}`}
            aria-labelledby={`profile-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ pt: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default function UserProfile({ params }: { params: { username: string } }) {
    const [user, setUser] = useState<User | null>(null);
    const [tabValue, setTabValue] = useState(0);
    const [comments, setComments] = useState<RawComment[]>([]);
    const [templates, setTemplates] = useState<CodeTemplate[]>([]);
    const [blogPosts, setBlogPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user: currentUser } = useAuth();
    const { theme } = useTheme();
    const router = useRouter();
    const { accessToken, setAccessToken, loading } = useAuth();
    const { showToast } = useToast();

    const canEdit = currentUser?.username === params.username;

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
            setIsLoading(true);
            try {
                const [userData, commentsData, templatesData, blogPostsData] = await Promise.all([
                    getUserData(params.username),
                    getComments(params.username),
                    getTemplates(params.username),
                    getBlogPosts(params.username)
                ]);

                setUser(userData);
                setComments(Array.isArray(commentsData) ? commentsData : []);
                setTemplates(templatesData);
                setBlogPosts(blogPostsData);
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserData();
    }, [params.username]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleEditProfile = () => {
        router.push(`/users/${user?.username}/edit-profile`);
    };

    if (isLoading) {
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
                <Typography variant="h6" color="text.secondary">
                    User not found
                </Typography>
            </Box>
        );
    }

    const renderUserProfile = (comment: RawComment) => (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <UserAvatar
                username={comment.author?.username || ""}
                userId={comment.id}
                size={32}
                clickable={false}
            />
            <Typography
                variant="subtitle2"
                sx={{
                    ml: 1,
                    fontWeight: 600,
                    color: 'text.primary',
                    ...transitionProps,
                }}
            >
                {comment.author?.username || ""}
            </Typography>
        </Box>
    );

    const NoDataMessage = ({ type }: { type: 'templates' | 'comments' | 'posts' }) => (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
                textAlign: 'center',
                ...transitionProps,
            }}
        >
            {type === 'templates' ? (
                <FileCode className="w-16 h-16 mb-4 text-gray-400" />
            ) : type === 'comments' ? (
                <MessageCircle className="w-16 h-16 mb-4 text-gray-400" />
            ) : (
                <BookOpen className="w-16 h-16 mb-4 text-gray-400" />
            )}
            <Typography
                variant="h6"
                color="text.secondary"
                gutterBottom
                sx={transitionProps}
            >
                No {type} yet
            </Typography>
            <Typography
                variant="body2"
                color="text.secondary"
                sx={transitionProps}
            >
                {type === 'templates'
                    ? 'This user hasn\'t created any templates yet.'
                    : type === 'comments'
                        ? 'This user hasn\'t made any comments yet.'
                        : 'This user hasn\'t written any blog posts yet.'}
            </Typography>
        </Box>
    );

    return (
        <BaseLayoutProfile user={currentUser}>
            <Box sx={{
                maxWidth: '1200px',
                margin: '0 auto',
                p: 3,
                ...transitionProps,
            }}>
                <Grid container spacing={4}>
                    {/* Profile Card */}
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

                                    {canEdit && (
                                        <Button
                                            variant="contained"
                                            startIcon={<Edit size={18} />}
                                            onClick={handleEditProfile}
                                            sx={{
                                                mt: 2,
                                                bgcolor: 'primary.main',
                                                ...elevatedTransitionProps,
                                                '&:hover': {
                                                    bgcolor: 'primary.dark',
                                                    transform: 'translateY(-1px)',
                                                    boxShadow: theme.shadows[8],
                                                },
                                            }}
                                        >
                                            Edit Profile
                                        </Button>
                                    )}
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

                    {/* Content Section */}
                    <Grid item xs={12} md={6}>
                        <Paper
                            elevation={8}
                            sx={{
                                bgcolor: 'background.paper',
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                minHeight: '500px',
                                ...elevatedTransitionProps,
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: theme.shadows[12],
                                },
                            }}
                        >
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <Tabs
                                    value={tabValue}
                                    onChange={handleTabChange}
                                    sx={{
                                        '& .MuiTab-root': {
                                            color: 'text.secondary',
                                            ...elevatedTransitionProps,
                                            '&.Mui-selected': {
                                                color: 'primary.main',
                                            },
                                            '&:hover': {
                                                color: 'primary.light',
                                                transform: 'translateY(-1px)',
                                            },
                                        },
                                        '& .MuiTabs-indicator': {
                                            backgroundColor: 'primary.main',
                                            ...transitionProps,
                                        },
                                    }}
                                >
                                    <Tab
                                        icon={<FileCode size={18} />}
                                        label="Templates"
                                        iconPosition="start"
                                        sx={{ minHeight: 'auto', py: 2 }}
                                    />
                                    <Tab
                                        icon={<BookOpen size={18} />}
                                        label="Posts"
                                        iconPosition="start"
                                        sx={{ minHeight: 'auto', py: 2 }}
                                    />
                                    <Tab
                                        icon={<MessageCircle size={18} />}
                                        label="Comments"
                                        iconPosition="start"
                                        sx={{ minHeight: 'auto', py: 2 }}
                                    />
                                </Tabs>
                            </Box>

                            <TabPanel value={tabValue} index={0}>
                                <Box sx={{
                                    maxHeight: 400,
                                    overflow: 'auto',
                                    px: 2,
                                    ...transitionProps,
                                }}>
                                    {templates.length === 0 ? (
                                        <NoDataMessage type="templates" />
                                    ) : (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            {templates.map((template, index) => (
                                                <Box
                                                    key={template.id}
                                                    sx={{
                                                        ...elevatedTransitionProps,
                                                        '&:hover': {
                                                            transform: 'translateX(4px)',
                                                        },
                                                        animationDelay: `${index * 0.1}s`,
                                                    }}
                                                >
                                                    <TemplateCard template={template} />
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                            </TabPanel>

                            <TabPanel value={tabValue} index={1}>
                                <Box sx={{
                                    maxHeight: 400,
                                    overflow: 'auto',
                                    px: 2,
                                    ...transitionProps,
                                }}>
                                    {blogPosts.length === 0 ? (
                                        <NoDataMessage type="posts" />
                                    ) : (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            {blogPosts.map((post, index) => (
                                                <Box
                                                    key={post.id}
                                                    sx={{
                                                        ...elevatedTransitionProps,
                                                        '&:hover': {
                                                            transform: 'translateX(4px)',
                                                        },
                                                        animationDelay: `${index * 0.1}s`,
                                                    }}
                                                >
                                                    <PostPreview
                                                        post={post}
                                                        handleVote={() => { return Promise.resolve() }}
                                                        handleReportClick={() => { }}
                                                    />
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                            </TabPanel>

                            <TabPanel value={tabValue} index={2}>
                                <Box sx={{
                                    maxHeight: 400,
                                    overflow: 'auto',
                                    px: 2,
                                    ...transitionProps,
                                }}>
                                    {comments.length === 0 ? (
                                        <NoDataMessage type="comments" />
                                    ) : (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            {comments.map((comment, index) => (
                                                <Card
                                                    key={comment.id}
                                                    variant="outlined"
                                                    sx={{
                                                        bgcolor: 'background.default',
                                                        border: '1px solid',
                                                        borderColor: 'divider',
                                                        ...elevatedTransitionProps,
                                                        animationDelay: `${index * 0.1}s`,
                                                        '&:hover': {
                                                            transform: 'translateX(4px)',
                                                            boxShadow: theme.shadows[4],
                                                        },
                                                    }}
                                                >
                                                    <CardContent sx={{ pb: 2 }}>
                                                        {renderUserProfile(comment)}
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                color: 'text.secondary',
                                                                ml: 5,
                                                                lineHeight: 1.5,
                                                                ...transitionProps,
                                                            }}
                                                        >
                                                            {comment.content}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                            </TabPanel>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </BaseLayoutProfile>
    );
}