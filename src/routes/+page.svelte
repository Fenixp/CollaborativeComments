<script lang="ts">
	import { auth } from '$lib/auth/state';
	import LoginCard from '$lib/components/molecules/login-card.svelte';
	import AuthenticatedShell from '$lib/components/templates/authenticated-shell.svelte';
</script>

{#if !$auth.initialized || $auth.loading}
	<div class="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-8 px-4 py-10 sm:px-6 lg:px-8">
		<div class="max-w-xl rounded-[2rem] border border-white/70 bg-white/92 p-8 shadow-2xl shadow-slate-200/70 backdrop-blur sm:p-10">
			<p class="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Initializing</p>
			<h2 class="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Preparing secure access</h2>
			<p class="mt-3 text-base leading-7 text-slate-600">
				Loading the authentication client and restoring any active workspace session.
			</p>
		</div>
	</div>
{:else if $auth.isAuthenticated}
	<AuthenticatedShell />
{:else}
	<div class="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
		<LoginCard error={$auth.error} />
	</div>
{/if}
