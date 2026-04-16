<script lang="ts">
	import { auth } from '$lib/auth/state';
	import BrandMark from '$lib/components/atoms/brand-mark.svelte';
	import AccountControls from '$lib/features/auth/components/account-controls.svelte';
</script>

<header class="flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/70 p-6 shadow-lg shadow-slate-200/70 backdrop-blur lg:flex-row lg:items-center lg:justify-between">
	<div class="space-y-2">
		<BrandMark compact={true} />
		{#if $auth.user}
			<p class="pl-14 text-sm text-slate-600">
				Signed in as <span class="font-medium text-slate-900">{$auth.user.fullName ?? $auth.user.email}</span>
			</p>
		{/if}
	</div>

	<AccountControls />
</header>
