<script lang="ts">
	import type { GalleryImageComment } from '$lib/features/gallery/gallery';

	let {
		comment,
		isActive,
		onHoverStart,
		onHoverEnd,
		onPin,
	} = $props<{
		comment: GalleryImageComment;
		isActive: boolean;
		onHoverStart: () => void;
		onHoverEnd: () => void;
		onPin: () => void;
	}>();
</script>

<button
	type="button"
	class={`pointer-events-auto absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md transition duration-150 ${isActive ? 'scale-110 ring-4 ring-white/70' : 'hover:scale-110'}`}
	style={`left: ${comment.x * 100}%; top: ${comment.y * 100}%; background-color: ${comment.author.colorValue};`}
	aria-label={`Open comment from ${comment.author.name}`}
	onmouseenter={onHoverStart}
	onmouseleave={onHoverEnd}
	onclick={(event) => {
		event.stopPropagation();
		onPin();
	}}
></button>
