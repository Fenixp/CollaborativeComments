<script lang="ts">
	import { cn } from '$lib/utils';

	let { class: className = '', children } = $props();
</script>

<div class={cn('rounded-2xl border border-slate-200/80 bg-white/90 shadow-xl shadow-slate-200/60 backdrop-blur', className)}>
	{@render children?.()}
</div>
