<script lang="ts">
	import { MessageSquare } from 'lucide-svelte';
	import { FALLBACK_THUMBNAIL_URL, formatBytes, type GalleryImage } from '$lib/features/gallery/gallery';

	let {
		image,
		commentCount,
		onSelect,
	} = $props<{
		image: GalleryImage;
		commentCount: number;
		onSelect?: (image: GalleryImage) => void;
	}>();

	let thumbnailSrc = $state(FALLBACK_THUMBNAIL_URL);
	let isFlashing = $state(false);

	// Track previous count to detect increases without triggering on initial render
	let prevCount = 0;
	let initialized = false;

	$effect(() => {
		const current = commentCount;
		if (!initialized) {
			initialized = true;
			prevCount = current;
			return;
		}
		if (current > prevCount) {
			isFlashing = true;
			setTimeout(() => {
				isFlashing = false;
			}, 600);
		}
		prevCount = current;
	});

	$effect(() => {
		thumbnailSrc = image.thumbnailUrl ?? FALLBACK_THUMBNAIL_URL;
	});
</script>

<article class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
	<button
		type="button"
		class="group block w-full text-left outline-none transition duration-200 ease-out hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
		aria-label={`Open ${image.name}`}
		onclick={() => {
			onSelect?.(image);
		}}
	>
		<div class="relative aspect-square overflow-hidden bg-slate-100">
			<img
				src={thumbnailSrc}
				alt={image.name}
				class="h-full w-full object-cover transition duration-200 ease-out group-hover:scale-[1.02]"
				onerror={() => {
					thumbnailSrc = FALLBACK_THUMBNAIL_URL;
				}}
			/>

			<div class="pointer-events-none absolute inset-0 bg-slate-950/0 transition duration-200 ease-out group-hover:bg-slate-950/8"></div>

			{#if commentCount > 0}
				<div
					class="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-slate-900/75 px-2 py-1 text-xs font-medium text-white shadow-[0_0_0_1.5px_white] backdrop-blur-sm {isFlashing ? 'badge-flash' : ''}"
					aria-label="{commentCount} {commentCount === 1 ? 'comment' : 'comments'}"
				>
					<MessageSquare class="h-3 w-3" />
					{commentCount}
				</div>
			{/if}
		</div>

		<div class="space-y-2 p-4">
			<p class="break-words text-sm font-semibold text-slate-950">{image.name}</p>
			<div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
				<span>{image.uploaderName}</span>
				<span>{formatBytes(image.sizeBytes)}</span>
			</div>
		</div>
	</button>
</article>

<style>
	@keyframes badge-flash {
		0%   { background-color: rgb(14 165 233 / 0.9); transform: scale(1); }
		40%  { background-color: rgb(14 165 233 / 0.9); transform: scale(1.15); }
		100% { background-color: rgb(15 23 42 / 0.75); transform: scale(1); }
	}

	.badge-flash {
		animation: badge-flash 0.6s ease-out forwards;
	}
</style>
