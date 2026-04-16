import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';
import type { Clerk as ClerkInstance } from '@clerk/clerk-js';

let clerkPromise: Promise<ClerkInstance | null> | null = null;

export async function getClerk() {
	const publishableKey = env.PUBLIC_CLERK_PUBLISHABLE_KEY;

	if (!browser || !publishableKey) {
		return null;
	}

	clerkPromise ??= (async () => {
		const { Clerk } = await import('@clerk/clerk-js');
		const clerk = new Clerk(publishableKey);
		await clerk.load();
		return clerk;
	})();

	return clerkPromise;
}
