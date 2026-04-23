<script lang="ts">
	import { Check, LoaderCircle, MessageCircleMore, Trash2 } from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { MAX_COMMENT_LENGTH, type ImageCommentAnchor } from '$lib/features/gallery/gallery';
	import { getOverlayPositionStyle } from '$lib/features/gallery/image-detail-overlays';

	let {
		anchor,
		draftText,
		isDraftFlashing,
		isSubmitting,
		commentError,
		onDraftTextChange,
		onSubmit,
		onCancel,
		onInputMount,
	} = $props<{
		anchor: ImageCommentAnchor;
		draftText: string;
		isDraftFlashing: boolean;
		isSubmitting: boolean;
		commentError: string | null;
		onDraftTextChange: (value: string) => void;
		onSubmit: () => void;
		onCancel: () => void;
		onInputMount?: (element: HTMLInputElement | null) => void;
	}>();

	let inputElement = $state<HTMLInputElement | null>(null);
	const formStyle = $derived(getOverlayPositionStyle(anchor));

	$effect(() => {
		onInputMount?.(inputElement);
	});
</script>

<form
	data-comment-overlay
	class={`pointer-events-auto absolute z-20 w-72 rounded-2xl border bg-white/96 p-3 shadow-xl backdrop-blur ${isDraftFlashing ? 'border-rose-400 ring-2 ring-rose-300' : 'border-slate-200'}`}
	style={formStyle}
	onsubmit={(event) => {
		event.preventDefault();
		onSubmit();
	}}
>
	<div class="flex items-start gap-3">
		<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
			<MessageCircleMore class="h-4 w-4" />
		</div>
		<div class="min-w-0 flex-1">
			<p class="text-sm font-semibold text-slate-900">Add comment</p>
			<p class="mt-1 text-xs text-slate-500">Press Enter or OK to save.</p>
		</div>
	</div>

	<div class="mt-3 space-y-2">
		<input
			bind:this={inputElement}
			type="text"
			class="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
			value={draftText}
			maxlength={MAX_COMMENT_LENGTH}
			placeholder="Write a comment…"
			disabled={isSubmitting}
			oninput={(event) => {
				onDraftTextChange((event.currentTarget as HTMLInputElement).value);
			}}
		/>
		<div class="flex items-center justify-between gap-3 text-xs">
			<span class={`${draftText.trim().length === 0 ? 'text-slate-400' : 'text-slate-600'}`}
				>{draftText.length}/{MAX_COMMENT_LENGTH}</span
			>
			{#if commentError}
				<span class="text-right text-rose-600">{commentError}</span>
			{:else}
				<span class="text-slate-400">Esc or trash cancels</span>
			{/if}
		</div>
	</div>

	<div class="mt-3 flex items-center justify-end gap-2">
		<Button
			variant="ghost"
			size="sm"
			type="button"
			onclick={(event) => {
				event.preventDefault();
				onCancel();
			}}
			disabled={isSubmitting}
		>
			<Trash2 class="h-4 w-4" />
		</Button>
		<Button size="sm" class="gap-1.5" type="submit" disabled={isSubmitting}>
			{#if isSubmitting}
				<LoaderCircle class="h-4 w-4 animate-spin" />
			{:else}
				<Check class="h-4 w-4" />
			{/if}
			OK
		</Button>
	</div>
</form>
