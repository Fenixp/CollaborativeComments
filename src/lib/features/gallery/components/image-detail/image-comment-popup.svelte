<script lang="ts">
	import { X } from 'lucide-svelte';
	import { getReadableTextColor, type GalleryImageComment } from '$lib/features/gallery/gallery';
	import { getOverlayPositionStyle } from '$lib/features/gallery/image-detail-overlays';

	let {
		comment,
		isPinned,
		onMouseEnter,
		onMouseLeave,
		onClose,
	} = $props<{
		comment: GalleryImageComment;
		isPinned: boolean;
		onMouseEnter: () => void;
		onMouseLeave: () => void;
		onClose: () => void;
	}>();

	const popupTextColor = $derived(getReadableTextColor(comment.author.colorValue));
	const popupStyle = $derived(getOverlayPositionStyle({ x: comment.x, y: comment.y }));
</script>

<div
	role="tooltip"
	data-comment-overlay
	class="pointer-events-auto absolute z-10 w-64"
	style={popupStyle}
	onmouseenter={onMouseEnter}
	onmouseleave={onMouseLeave}
>
	<div
		class="rounded-2xl px-4 py-3 shadow-xl"
		style={`background-color: ${comment.author.colorValue}; color: ${popupTextColor};`}
	>
		<div class="flex items-start gap-3">
			<div class="min-w-0 flex-1">
				<p class="truncate text-sm font-semibold">{comment.author.name}</p>
				<p class="mt-1 text-sm leading-5 opacity-95">{comment.text}</p>
			</div>

			{#if isPinned}
				<button
					type="button"
					class="rounded-full p-1 transition hover:bg-black/10"
					aria-label="Close comment popup"
					onclick={(event) => {
						event.stopPropagation();
						onClose();
					}}
				>
					<X class="h-4 w-4" />
				</button>
			{/if}
		</div>
	</div>
</div>
