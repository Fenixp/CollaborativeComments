import { mutationGeneric } from 'convex/server';
import { getRandomUserColorToken, isUserColorToken, USER_COLOR_TOKENS } from '../lib/features/users/user-colors.js';

async function pickUniqueColorToken(ctx: { db: any }): Promise<string> {
	const existingUsers = await ctx.db.query('users').collect();
	const usedTokens = new Set(existingUsers.map((u: any) => u.colorToken).filter(Boolean));
	const available = USER_COLOR_TOKENS.filter((token) => !usedTokens.has(token));

	if (available.length > 0) {
		return available[Math.floor(Math.random() * available.length)];
	}

	return getRandomUserColorToken();
}

async function requireIdentity(ctx: { auth: { getUserIdentity: () => Promise<any> } }) {
	const identity = await ctx.auth.getUserIdentity();

	if (!identity) {
		throw new Error('You must be signed in to access user data.');
	}

	return identity;
}

export const ensureCurrentUser = mutationGeneric({
	args: {},
	handler: async (ctx) => {
		const identity = await requireIdentity(ctx);
		const now = Date.now();
		const existingUser = await ctx.db
			.query('users')
			.withIndex('by_subject', (q) => q.eq('subject', identity.subject))
			.unique();

		if (existingUser) {
			const patch: {
				tokenIdentifier?: string;
				name?: string;
				email?: string;
				colorToken?: string;
				updatedAt?: number;
			} = {};

			if (existingUser.tokenIdentifier !== identity.tokenIdentifier) {
				patch.tokenIdentifier = identity.tokenIdentifier;
			}

			if (identity.name && existingUser.name !== identity.name) {
				patch.name = identity.name;
			}

			if (identity.email && existingUser.email !== identity.email) {
				patch.email = identity.email;
			}

			if (!existingUser.colorToken || !isUserColorToken(existingUser.colorToken)) {
				patch.colorToken = await pickUniqueColorToken(ctx);
			}

			if (Object.keys(patch).length > 0) {
				patch.updatedAt = now;
				await ctx.db.patch(existingUser._id, patch);
			}

			return {
				id: existingUser._id,
				subject: existingUser.subject,
				name: identity.name ?? existingUser.name ?? null,
				email: identity.email ?? existingUser.email ?? null,
				colorToken: patch.colorToken ?? existingUser.colorToken ?? getRandomUserColorToken(),
			};
		}

		const colorToken = await pickUniqueColorToken(ctx);
		const userId = await ctx.db.insert('users', {
			subject: identity.subject,
			tokenIdentifier: identity.tokenIdentifier,
			name: identity.name ?? undefined,
			email: identity.email ?? undefined,
			colorToken,
			updatedAt: now,
		});

		return {
			id: userId,
			subject: identity.subject,
			name: identity.name ?? null,
			email: identity.email ?? null,
			colorToken,
		};
	},
});
