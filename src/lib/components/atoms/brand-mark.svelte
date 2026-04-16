<script lang="ts">
	import { MessageSquareMore, ShieldCheck } from 'lucide-svelte';

	let { compact = false } = $props();
</script>

<div class="flex items-start gap-4 text-slate-900">
	<div class={compact ? 'flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-200' : 'flex h-14 w-14 items-center justify-center rounded-3xl bg-sky-600 text-white shadow-xl shadow-sky-200/80'}>
		<MessageSquareMore class={compact ? 'h-5 w-5' : 'h-6 w-6'} />
	</div>
	<div class="space-y-2">
		<div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-sky-700 sm:text-sm">
			Workspace access
			<ShieldCheck class="h-4 w-4" />
		</div>
		<div class="space-y-1">
			<h1 class={compact ? 'text-2xl font-semibold tracking-tight text-slate-950' : 'text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl'}>
				Collaborative Comments
			</h1>
		</div>
	</div>
</div>
