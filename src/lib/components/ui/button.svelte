<script lang="ts">
	import { cva } from 'class-variance-authority';
	import { cn } from '$lib/utils';

	const buttonVariants = cva(
		'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
		{
			variants: {
				variant: {
					default: 'bg-sky-600 text-white hover:bg-sky-700',
					secondary: 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50',
					ghost: 'text-slate-700 hover:bg-slate-100'
				},
				size: {
					default: 'h-10 px-4 py-2',
					sm: 'h-9 px-3',
					lg: 'h-11 px-6 text-base'
				}
			},
			defaultVariants: {
				variant: 'default',
				size: 'default'
			}
		}
	);

	let {
		href = undefined,
		variant = 'default',
		size = 'default',
		type = 'button',
		class: className = '',
		children,
		...restProps
	} = $props();
</script>

{#if href}
	<a href={href} class={cn(buttonVariants({ variant, size }), className)} {...restProps}>
		{@render children?.()}
	</a>
{:else}
	<button type={type} class={cn(buttonVariants({ variant, size }), className)} {...restProps}>
		{@render children?.()}
	</button>
{/if}
