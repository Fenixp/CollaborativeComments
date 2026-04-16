import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';
import { writable } from 'svelte/store';
import type { Clerk } from '@clerk/clerk-js';
import { api } from '../../convex/_generated/api.js';
import { getClerk } from './clerk';
import { getConvexClient } from '$lib/convex/client';
import type { UserColorToken } from '$lib/features/users/user-colors';

const userApi = (api as typeof api & {
	users: {
		ensureCurrentUser: any;
	};
}).users;

type UserSummary = {
	id: string;
	subject: string;
	fullName: string | null;
	email: string | null;
	imageUrl: string | null;
	colorToken: UserColorToken | null;
};

type PersistedUserSummary = {
	id: string;
	subject: string;
	name: string | null;
	email: string | null;
	colorToken: UserColorToken;
};

type AuthState = {
	initialized: boolean;
	loading: boolean;
	isAuthenticated: boolean;
	convexAuthenticated: boolean;
	user: UserSummary | null;
	presentationState: 'initializing' | 'ready' | 'sign-in-in-progress' | 'sign-up-in-progress' | 'error';
	authSurface: 'provider-actions';
	error: string | null;
};

const initialState: AuthState = {
	initialized: false,
	loading: false,
	isAuthenticated: false,
	convexAuthenticated: false,
	user: null,
	presentationState: 'initializing',
	authSurface: 'provider-actions',
	error: null
};

function mapUser(clerk: Clerk | null, persistedUser: PersistedUserSummary | null = null): UserSummary | null {
	if (!clerk?.user) {
		return null;
	}

	const email = persistedUser?.email ?? clerk.user.primaryEmailAddress?.emailAddress ?? clerk.user.emailAddresses[0]?.emailAddress ?? null;
	const fullName = persistedUser?.name ?? ([clerk.user.firstName, clerk.user.lastName].filter(Boolean).join(' ') || clerk.user.username || null);

	return {
		id: persistedUser?.id ?? clerk.user.id,
		subject: persistedUser?.subject ?? clerk.user.id,
		fullName,
		email,
		imageUrl: clerk.user.imageUrl ?? null,
		colorToken: persistedUser?.colorToken ?? null
	};
}

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>(initialState);
	let initPromise: Promise<void> | null = null;
	let removeListener: (() => void) | null = null;

	const syncState = async (clerk: Clerk | null) => {
		const convex = getConvexClient();
		const publishableKey = env.PUBLIC_CLERK_PUBLISHABLE_KEY;
		let persistedUser: PersistedUserSummary | null = null;

		if (clerk?.session && convex) {
			convex.setAuth(
				async ({ forceRefreshToken }) => {
					return (await clerk.session?.getToken({
						template: 'convex',
						skipCache: forceRefreshToken
					})) ?? null;
				},
				(isAuthenticated) => {
					update((state) => ({ ...state, convexAuthenticated: isAuthenticated }));
				}
			);

			persistedUser = (await convex.mutation(userApi.ensureCurrentUser, {})) as PersistedUserSummary;
		} else {
			convex?.setAuth(async () => null, () => {
				update((state) => ({ ...state, convexAuthenticated: false }));
			});
		}

		set({
			initialized: true,
			loading: false,
			isAuthenticated: Boolean(clerk?.session),
			convexAuthenticated: Boolean(clerk?.session && persistedUser),
			user: mapUser(clerk, persistedUser),
			presentationState: publishableKey ? 'ready' : 'error',
			authSurface: 'provider-actions',
			error: publishableKey ? null : 'Set PUBLIC_CLERK_PUBLISHABLE_KEY to enable the login flow.'
		});
	};

	const withProviderAction = async (
		action: 'sign-in-in-progress' | 'sign-up-in-progress',
		run: (clerk: Clerk) => Promise<unknown>
	) => {
		const clerk = await getClerk();

		if (!clerk) {
			update((state) => ({
				...state,
				initialized: true,
				loading: false,
				presentationState: 'error',
				error: 'Missing PUBLIC_CLERK_PUBLISHABLE_KEY.'
			}));
			return;
		}

		update((state) => ({
			...state,
			presentationState: action,
			error: null
		}));

		try {
			await run(clerk);
		} catch (error) {
			update((state) => ({
				...state,
				presentationState: 'error',
				error: error instanceof Error ? error.message : 'Unable to open the authentication flow.'
			}));
			return;
		}

		update((state) => ({
			...state,
			presentationState: state.isAuthenticated ? state.presentationState : 'ready'
		}));
	};

	return {
		subscribe,
		init: async () => {
			if (!browser) {
				return;
			}

			update((state) => ({ ...state, loading: true, presentationState: 'initializing', error: null }));

			if (!initPromise) {
				initPromise = (async () => {
					const clerk = await getClerk();

					removeListener?.();
					removeListener = clerk
						? clerk.addListener(async () => {
							await syncState(clerk);
						})
						: null;

					await syncState(clerk);
				})().catch((error) => {
					set({
						...initialState,
						initialized: true,
						presentationState: 'error',
						error: error instanceof Error ? error.message : 'Failed to initialize Clerk.'
					});
				});
			}

			return initPromise;
		},
		signIn: async () => {
			await withProviderAction('sign-in-in-progress', async (clerk) => {
				await clerk.openSignIn();
			});
		},
		signUp: async () => {
			await withProviderAction('sign-up-in-progress', async (clerk) => {
				await clerk.openSignUp();
			});
		},
		openAccount: async () => {
			const clerk = await getClerk();

			if (!clerk) {
				return;
			}

			await clerk.openUserProfile();
		},
		signOut: async () => {
			const clerk = await getClerk();

			if (!clerk) {
				return;
			}

			await clerk.signOut();
			await syncState(clerk);
		}
	};
}

export const auth = createAuthStore();
