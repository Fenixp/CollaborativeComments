<script lang="ts">
	import GalleryImageCard from '$lib/features/gallery/components/gallery-image-card.svelte';
	import type { GalleryImage } from '$lib/features/gallery/gallery';

	let {
		images,
		commentCounts,
		onSelect,
	} = $props<{
		images: GalleryImage[];
		commentCounts: Record<string, number>;
		onSelect?: (image: GalleryImage) => void;
	}>();
</script>

<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
	{#each images as image (image.id)}
		<GalleryImageCard {image} commentCount={commentCounts[image.id] ?? 0} {onSelect} />
	{/each}
</div>
