<script lang="ts">
	import { auth } from '$lib/auth/state';
	import Button from '$lib/components/ui/button.svelte';
	import Panel from '$lib/components/ui/panel.svelte';
	import LoginCard from '$lib/components/molecules/login-card.svelte';
</script>

<div class="mx-auto flex min-h-screen max-w-4xl flex-col justify-center gap-6 px-4 py-10 sm:px-6 lg:px-8">
	<Button href="/" variant="ghost" size="sm" class="w-fit">← Back to root</Button>

	{#if !$auth.initialized || $auth.loading}
		<Panel class="p-8">
			<p class="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Loading</p>
			<h1 class="mt-3 text-2xl font-semibold text-slate-950">Preparing account controls</h1>
		</Panel>
	{:else if !$auth.isAuthenticated}
		<LoginCard
			error="Sign in first to access provider-backed account management."
			title="Sign in to manage your account"
			description="Use the same secure sign-in or sign-up flow before opening profile and session controls."
			compact={true}
		/>
	{:else}
		<Panel class="p-8 sm:p-10">
			<p class="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Account management</p>
			<h1 class="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Provider-backed account controls</h1>
			<p class="mt-3 max-w-2xl text-base leading-7 text-slate-600">
				Use Clerk's managed UI to inspect profile, sessions, and account-level settings without adding custom product business logic to this scaffold.
			</p>

			<div class="mt-6 flex flex-wrap gap-3">
				<Button onclick={() => auth.openAccount()}>Open Clerk account UI</Button>
				<Button variant="secondary" onclick={() => auth.signOut()}>Sign out</Button>
			</div>
		</Panel>
	{/if}
</div>
