import { prisma } from '../../../../utils/db.js';
import { ForbiddenError } from '../../../../errors/ForbiddenError.js';
import { UnauthorizedError } from '../../../../errors/UnauthorizedError.js';
import { itemsRatingsToMetrics } from '../../../../utils/blog/metrics';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
        return Response.json({ status: 'error', message: 'Missing or invalid username' }, { status: 400 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { username: username },
        });

        const userId = user?.id;

        const posts = await prisma.blogPost.findMany({
            where: {
                authorId: parseInt(user.id),
            },
            select: {
                id: true,
                title: true,
                content: true,
                createdAt: true,
                author: {
                    select: {
                        id: true,
                        username: true
                    }
                },
                tags: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                ratings: {
                    select: {
                        value: true,
                        ...(userId && {
                            userId: true
                        })
                    }
                },
                codeTemplates: {
                    select: {
                        id: true,
                        title: true,
                    }
                }
            }
        });

        if (!posts || posts.length === 0) {
            return Response.json({ status: 'success', message: 'No posts found', posts: [] }, { status: 200 });
        }
        const postsWithVotes = posts.map(post => ({
            ...post,
            userVote: userId ? (post.ratings.find(rating => rating.userId === userId)?.value || 0) : 0
        }));

        const postsWithMetrics = itemsRatingsToMetrics(postsWithVotes);

        const processedPosts = postsWithMetrics.map((post) => ({
            id: post.id,
            title: post.title,
            content: post.content,
            authorId: post.author?.id,
            authorUsername: post.author?.username,
            tags: post.tags.map(tag => ({ id: tag.id, name: tag.name })),
            createdAt: post.createdAt,
            score: post.metrics.totalScore,
            userVote: post.userVote,
            allowAction: false,
        }));

        return Response.json({ status: 'success', posts: processedPosts }, { status: 200 });
    } catch (error) {
        if (error instanceof ForbiddenError || error instanceof UnauthorizedError) {
            return Response.json({ status: 'error', message: error.message }, { status: error.statusCode });
        }
        console.error('Error fetching posts:', error);
        return Response.json({ status: 'error', message: 'Internal server error' }, { status: 500 });
    }
}