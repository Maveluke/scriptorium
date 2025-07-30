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

async function getComments(username: string): Promise<Comment[]> {
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

    // const handleVote = async (postId: number, isUpvote: boolean) => {
    //     if (postId === null) {
    //         showToast({
    //             message: 'Failed to submit vote - Please refresh your page',
    //             type: 'error'
    //         });
    //         return;
    //     }

    //     if (!user || !accessToken) {
    //         showToast({
    //             message: 'Please log in to vote',
    //             type: 'info'
    //         });
    //         router.push('/auth/login');
    //         return;
    //     }

    //     const vote = isUpvote ? 1 : -1;
    //     let newVote = 0;
    //     const previousPosts = blogPosts;

    //     setBlogPosts(prevPosts =>
    //         prevPosts.map(post => {
    //             if (post.id === postId) {
    //                 newVote = post.userVote === vote ? 0 : vote;
    //                 return {
    //                     ...post,
    //                     score: post.score + newVote - post.userVote,
    //                     userVote: newVote
    //                 };
    //             }
    //             return post;
    //         })
    //     );

    //     try {
    //         await sendVote(newVote, postId);
    //         showToast({
    //             message: newVote === 0 ? 'Vote removed' : isUpvote ? 'Upvoted' : 'Downvoted',
    //             type: 'success'
    //         });
    //     } catch (err) {
    //         setBlogPosts(previousPosts);
    //         throw err;
    //     }
    // };

    // const sendVote = async (vote: number, postId: number) => {
    //     const method = vote === 0 ? 'DELETE' : 'POST';
    //     const url = '/api/rate/post';
    //     const options: RequestInit = {
    //         method: method,
    //         credentials: 'include',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'access-token': `Bearer ${accessToken}`,
    //         },
    //         body: JSON.stringify({
    //             userId: user!.id,
    //             postId: postId,
    //             value: vote
    //         }),
    //     };

    if (isLoading) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.default'
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
                    bgcolor: 'background.default'
                }}
            >
                <Typography variant="h6" color="text.secondary">
                    User not found
                </Typography>
            </Box>
        );
    }

    const NoDataMessage = ({ type }: { type: 'templates' | 'comments' | 'posts' }) => (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
                textAlign: 'center',
            }}
        >
            {type === 'templates' ? (
                <FileCode className="w-16 h-16 mb-4 text-gray-400" />
            ) : type === 'comments' ? (
                <MessageCircle className="w-16 h-16 mb-4 text-gray-400" />
            ) : (
                <BookOpen className="w-16 h-16 mb-4 text-gray-400" />
            )}
            <Typography variant="h6" color="text.secondary" gutterBottom>
                No {type} yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {type === 'templates'
                    ? 'This user hasn\'t created any templates yet.'
                    : type === 'comments'
                        ? 'This user hasn\'t made any comments yet.'
                        : 'This user hasn\'t written any blog posts yet.'}
            </Typography>
        </Box>
    );

    return (
        <BaseLayoutProfile user={user}>
            <Box sx={{ maxWidth: '1200px', margin: '0 auto', p: 3 }}>
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
                            }}
                        >
                            <Box sx={{ p: 4 }}>
                                {/* User Header */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                                    <UserProfileAvatar username={user.username} userId={user.id} />
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            color: 'primary.main',
                                            fontWeight: 'bold',
                                            mt: 2,
                                            mb: 1
                                        }}
                                    >
                                        {user.firstname} {user.lastname}
                                    </Typography>
                                    <Typography variant="h6" color="text.secondary" gutterBottom>
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
                                                '&:hover': {
                                                    bgcolor: 'primary.dark',
                                                },
                                            }}
                                        >
                                            Edit Profile
                                        </Button>
                                    )}
                                </Box>

                                <Divider sx={{ mb: 3 }} />

                                {/* About Section */}
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="h6" color="primary.main" gutterBottom>
                                        About Me
                                    </Typography>
                                    <Chip
                                        label={user.about || 'No description provided'}
                                        sx={{
                                            bgcolor: theme.palette.mode === 'dark' ? 'primary.dark' : 'primary.light',
                                            color: theme.palette.mode === 'dark' ? 'primary.light' : 'primary.dark',
                                            fontWeight: 500,
                                        }}
                                    />
                                </Box>

                                {/* Role Section */}
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="h6" color="primary.main" gutterBottom>
                                        Role
                                    </Typography>
                                    <Chip
                                        icon={<UserIcon size={16} />}
                                        label={user.role}
                                        variant="outlined"
                                        sx={{
                                            borderColor: 'primary.main',
                                            color: 'primary.main',
                                        }}
                                    />
                                </Box>

                                {/* Contact Information */}
                                <Box>
                                    <Typography variant="h6" color="primary.main" gutterBottom>
                                        Contact Information
                                    </Typography>
                                    <List dense>
                                        <ListItem>
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                                                    <Mail size={16} />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={user.email}
                                                sx={{ '& .MuiListItemText-primary': { color: 'text.primary' } }}
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                                                    <Phone size={16} />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={user.phoneNumber}
                                                sx={{ '& .MuiListItemText-primary': { color: 'text.primary' } }}
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
                            }}
                        >
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <Tabs
                                    value={tabValue}
                                    onChange={handleTabChange}
                                    sx={{
                                        '& .MuiTab-root': {
                                            color: 'text.secondary',
                                            '&.Mui-selected': {
                                                color: 'primary.main',
                                            },
                                        },
                                        '& .MuiTabs-indicator': {
                                            backgroundColor: 'primary.main',
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
                                <Box sx={{ maxHeight: 400, overflow: 'auto', px: 2 }}>
                                    {templates.length === 0 ? (
                                        <NoDataMessage type="templates" />
                                    ) : (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            {templates.map((template) => (
                                                <TemplateCard key={template.id} template={template} />
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                            </TabPanel>

                            <TabPanel value={tabValue} index={1}>
                                <Box sx={{ maxHeight: 400, overflow: 'auto', px: 2 }}>
                                    {blogPosts.length === 0 ? (
                                        <NoDataMessage type="posts" />
                                    ) : (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            {blogPosts.map((post) => (
                                                <PostPreview
                                                    key={post.id}
                                                    post={post}
                                                    handleVote={() => { return Promise.resolve() }} // Disable voting in profile view
                                                    handleReportClick={() => { }} // Disable reporting in profile view
                                                />
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                            </TabPanel>

                            <TabPanel value={tabValue} index={2}>
                                <Box sx={{ maxHeight: 400, overflow: 'auto', px: 2 }}>
                                    {comments.length === 0 ? (
                                        <NoDataMessage type="comments" />
                                    ) : (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            {comments.map((comment) => (
                                                <Card
                                                    key={comment.id}
                                                    variant="outlined"
                                                    sx={{
                                                        bgcolor: 'background.default',
                                                        border: '1px solid',
                                                        borderColor: 'divider',
                                                    }}
                                                >
                                                    <CardContent sx={{ pb: 2 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                            <UserAvatar
                                                                username={comment.author?.username || ""}
                                                                userId={comment.id}
                                                                size={32}
                                                            />
                                                            <Typography
                                                                variant="subtitle2"
                                                                sx={{ ml: 1, fontWeight: 600, color: 'text.primary' }}
                                                            >
                                                                {comment.author?.username || ""}
                                                            </Typography>
                                                        </Box>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                color: 'text.secondary',
                                                                ml: 5,
                                                                lineHeight: 1.5
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