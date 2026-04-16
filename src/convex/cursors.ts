import { mutationGeneric, queryGeneric } from 'convex/server';
import { v } from 'convex/values';
import { isUserColorToken, resolveUserColorValue } from '../lib/features/users/user-colors.js';

const FALLBACK_COLOR_TOKEN = 'sky';
const FALLBACK_COLOR_VALUE = '#38bdf8';

async function requireIdentity(ctx: { auth: { getUserIdentity: () => Promise<any> } }) {
	const identity = await ctx.auth.getUserIdentity();

	if (!identity) {
		throw new Error('You must be signed in to access cursor data.');
	}

	return identity;
}

function validateCoordinate(value: number, axis: 'x' | 'y') {
	if (!Number.isFinite(value) || value < 0 || value > 1) {
		throw new Error(`Cursor ${axis}-coordinate must be between 0 and 1.`);
	}

	return value;
}

export const upsertCursor = mutationGeneric({
	args: {
		imageId: v.id('images'),
		x: v.number(),
		y: v.number(),
	},
	handler: async (ctx, args) => {
		const identity = await requireIdentity(ctx);

		const x = validateCoordinate(args.x, 'x');
		const y = validateCoordinate(args.y, 'y');
		const now = Date.now();

		const existing = await ctx.db
			.query('imageCursors')
			.withIndex('by_user_image', (q: any) =>
				q.eq('userSubject', identity.subject).eq('imageId', args.imageId)
			)
			.unique();

		if (existing) {
			await ctx.db.patch(existing._id, { x, y, updatedAt: now, isActive: true });
		} else {
			await ctx.db.insert('imageCursors', {
				imageId: args.imageId,
				userSubject: identity.subject,
				x,
				y,
				updatedAt: now,
				isActive: true,
			});
		}
	},
});

export const clearCursor = mutationGeneric({
	args: {
		imageId: v.id('images'),
	},
	handler: async (ctx, args) => {
		const identity = await requireIdentity(ctx);

		const existing = await ctx.db
			.query('imageCursors')
			.withIndex('by_user_image', (q: any) =>
				q.eq('userSubject', identity.subject).eq('imageId', args.imageId)
			)
			.unique();

		if (existing) {
			await ctx.db.patch(existing._id, { isActive: false });
		}
	},
});

export const listImageCursors = queryGeneric({
	args: {
		imageId: v.id('images'),
	},
	handler: async (ctx, args) => {
		await requireIdentity(ctx);

		const cursors = await ctx.db
			.query('imageCursors')
			.withIndex('by_image', (q: any) => q.eq('imageId', args.imageId))
			.filter((q: any) => q.eq(q.field('isActive'), true))
			.collect();

		const subjects = [...new Set(cursors.map((c) => c.userSubject))];
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

		return cursors.map((cursor) => {
			const user = usersBySubject.get(cursor.userSubject);
			const colorToken =
				user?.colorToken && isUserColorToken(user.colorToken)
					? user.colorToken
					: FALLBACK_COLOR_TOKEN;

			return {
				userSubject: cursor.userSubject,
				x: cursor.x,
				y: cursor.y,
				updatedAt: cursor.updatedAt,
				colorToken,
				colorValue:
					colorToken === FALLBACK_COLOR_TOKEN
						? FALLBACK_COLOR_VALUE
						: resolveUserColorValue(colorToken),
			};
		});
	},
});
