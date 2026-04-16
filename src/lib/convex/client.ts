import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';
import { ConvexClient } from 'convex/browser';

let client: ConvexClient | null = null;

export function getConvexClient() {
	const convexUrl = env.PUBLIC_CONVEX_URL;

	if (!browser || !convexUrl) {
		return null;
	}

	client ??= new ConvexClient(convexUrl);
	return client;
}
