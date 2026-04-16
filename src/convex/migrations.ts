import { mutationGeneric } from 'convex/server';
import { USER_COLOR_TOKENS } from '../lib/features/users/user-colors.js';

export const reassignUniqueUserColors = mutationGeneric({
	args: {},
	handler: async (ctx) => {
		const users = await ctx.db.query('users').collect();
		const now = Date.now();

		const shuffled = [...USER_COLOR_TOKENS].sort(() => Math.random() - 0.5);

		for (let i = 0; i < users.length; i++) {
			const colorToken = shuffled[i % shuffled.length];
			await ctx.db.patch(users[i]._id, { colorToken, updatedAt: now });
		}

		return { updated: users.length };
	},
});
