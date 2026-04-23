<script lang="ts">
	import { X } from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { formatBytes, type GalleryImage } from '$lib/features/gallery/gallery';

	let {
		image,
		onClose,
	} = $props<{
		image: GalleryImage;
		onClose: () => void;
	}>();
</script>

<div class="flex items-start justify-between gap-4">
	<div>
		<p class="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Gallery image</p>
		<h2 id="image-detail-dialog-title" class="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
			{image.name}
		</h2>
		<p class="mt-2 text-sm leading-6 text-slate-600">
			Uploaded by {image.uploaderName} · {image.contentType} · {formatBytes(image.sizeBytes)}
		</p>
	</div>
	<Button variant="ghost" size="sm" onclick={onClose}>
		<X class="h-4 w-4" />
	</Button>
</div>
