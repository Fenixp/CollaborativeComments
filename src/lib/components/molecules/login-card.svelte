<script lang="ts">
	import { MessageSquareMore } from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Panel from '$lib/components/ui/panel.svelte';
	import { auth } from '$lib/auth/state';

	let {
		error = null,
		title = 'Collaborative Comments',
		compact = false
	} = $props();

	const actionState = $derived($auth.presentationState);
	const isBusy = $derived(actionState === 'sign-in-in-progress' || actionState === 'sign-up-in-progress');
</script>

<Panel class={compact ? 'max-w-xl p-8 sm:p-9' : 'max-w-xl p-8 sm:p-10'}>
	<div class="space-y-6 text-center">
		<div class="flex items-center justify-center gap-3">
			<div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-200">
				<MessageSquareMore class="h-5 w-5" />
			</div>
			<h1 class="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
		</div>

		{#if error}
			<div class="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
				{error}
			</div>
		{/if}

		<div class="flex flex-col gap-3 sm:flex-row">
			<Button size="lg" class="w-full sm:flex-1" disabled={isBusy} onclick={() => auth.signIn()}>
				Sign in
			</Button>
			<Button variant="secondary" size="lg" class="w-full sm:flex-1" disabled={isBusy} onclick={() => auth.signUp()}>
				Create account
			</Button>
		</div>
	</div>
</Panel>
