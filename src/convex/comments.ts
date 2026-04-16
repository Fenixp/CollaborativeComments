import { mutationGeneric, queryGeneric } from 'convex/server';
import { v } from 'convex/values';
import { isUserColorToken, resolveUserColorValue } from '../lib/features/users/user-colors.js';

const MAX_COMMENT_LENGTH = 100;
const FALLBACK_COLOR_TOKEN = 'sky';
const FALLBACK_COLOR_VALUE = '#38bdf8';

async function requireIdentity(ctx: { auth: { getUserIdentity: () => Promise<any> } }) {
	const identity = await ctx.auth.getUserIdentity();

	if (!identity) {
		throw new Error('You must be signed in to access image comments.');
	}

	return identity;
}

function normalizeCommentText(text: string) {
	const normalized = text.trim().replace(/\s+/g, ' ');

	if (!normalized) {
		throw new Error('Enter a comment before submitting.');
	}

	if (normalized.length > MAX_COMMENT_LENGTH) {
		throw new Error(`Comments can be at most ${MAX_COMMENT_LENGTH} characters.`);
	}

	return normalized;
}

function validateCoordinate(value: number, axis: 'x' | 'y') {
	if (!Number.isFinite(value) || value < 0 || value > 1) {
		throw new Error(`Comment ${axis}-coordinate must be between 0 and 1.`);
	}

	return value;
}

async function getReadyImage(ctx: { db: any }, imageId: any) {
	const image = await ctx.db.get(imageId);

	if (!image || image.state !== 'ready') {
		throw new Error('Image not found.');
	}

	return image;
}

export const listImageComments = queryGeneric({
	args: {
		imageId: v.id('images'),
	},
	handler: async (ctx, args) => {
		await requireIdentity(ctx);
		await getReadyImage(ctx, args.imageId);

		const comments = await ctx.db
			.query('imageComments')
			.withIndex('by_image', (q) => q.eq('imageId', args.imageId))
			.collect();

		const subjects = [...new Set(comments.map((comment) => comment.authorSubject))];
		const usersBySubject = new Map(
			await Promise.all(
				subjects.map(async (subject) => {
					const user = await ctx.db
						.query('users')
						.withIndex('by_subject', (q: any) => q.eq('subject', subject))
						.unique();

					return [subject, user] as const;
				})
			)
		);

		return comments
			.sort((left, right) => left.createdAt - right.createdAt)
			.map((comment) => {
				const user = usersBySubject.get(comment.authorSubject);
				const colorToken = user?.colorToken && isUserColorToken(user.colorToken) ? user.colorToken : FALLBACK_COLOR_TOKEN;

				return {
					id: comment._id,
					imageId: comment.imageId,
					text: comment.text,
					x: comment.x,
					y: comment.y,
					createdAt: comment.createdAt,
					author: {
						subject: comment.authorSubject,
						name: user?.name ?? user?.email ?? 'Authenticated teammate',
						colorToken,
						colorValue: colorToken === FALLBACK_COLOR_TOKEN ? FALLBACK_COLOR_VALUE : resolveUserColorValue(colorToken),
					},
				};
			});
	},
});

export const getCommentCountsByImageId = queryGeneric({
	handler: async (ctx) => {
		await requireIdentity(ctx);

		const comments = await ctx.db.query('imageComments').collect();

		const counts: Record<string, number> = {};
		for (const comment of comments) {
			const id = comment.imageId as string;
			counts[id] = (counts[id] ?? 0) + 1;
		}

		return counts;
	},
});

export const createImageComment = mutationGeneric({
	args: {
		imageId: v.id('images'),
		text: v.string(),
		x: v.number(),
		y: v.number(),
	},
	handler: async (ctx, args) => {
		const identity = await requireIdentity(ctx);
		await getReadyImage(ctx, args.imageId);

		const text = normalizeCommentText(args.text);
		const x = validateCoordinate(args.x, 'x');
		const y = validateCoordinate(args.y, 'y');
		const now = Date.now();

		return ctx.db.insert('imageComments', {
			imageId: args.imageId,
			authorSubject: identity.subject,
			text,
			x,
			y,
			createdAt: now,
			updatedAt: now,
		});
	},
});
