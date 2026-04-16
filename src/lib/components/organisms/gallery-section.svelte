<script lang="ts">
	import { ImagePlus, Images, Upload } from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Panel from '$lib/components/ui/panel.svelte';
	import GalleryGrid from '$lib/features/gallery/components/gallery-grid.svelte';
	import type { GalleryImage } from '$lib/features/gallery/gallery';

	let {
		images,
		isLoading,
		commentCounts,
		onAddImage,
		onSelectImage,
	} = $props<{
		images: GalleryImage[];
		isLoading: boolean;
		commentCounts: Record<string, number>;
		onAddImage: () => void;
		onSelectImage: (image: GalleryImage) => void;
	}>();
</script>

<div class="space-y-6">
	<Panel class="p-6 sm:p-8">
		<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
			<div class="flex items-center gap-3">
				<div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
					<Images class="h-5 w-5" />
				</div>
				<div>
					<h2 class="text-2xl font-semibold tracking-tight text-slate-950">Image gallery</h2>
					<p class="text-sm text-slate-600">Newest committed images appear first for everyone who is signed in.</p>
				</div>
			</div>

			<Button size="lg" class="gap-2 self-start" onclick={onAddImage}>
				<ImagePlus class="h-5 w-5" />
				Add image
			</Button>
		</div>

		<div class="mt-6">
			{#if isLoading}
				<div class="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
					Loading the shared gallery…
				</div>
			{:else if images.length === 0}
				<div class="rounded-3xl border border-dashed border-sky-200 bg-sky-50/60 px-6 py-12 text-center">
					<div class="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-sky-700 shadow-sm shadow-sky-100">
						<Upload class="h-6 w-6" />
					</div>
					<h3 class="mt-5 text-2xl font-semibold tracking-tight text-slate-950">Be the first to upload an image</h3>
					<p class="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
						Start the shared gallery with a real image upload. Once it finishes, every signed-in user will see it here automatically.
					</p>
					<Button class="mt-6 gap-2" onclick={onAddImage}>
						<ImagePlus class="h-5 w-5" />
						Upload the first image
					</Button>
				</div>
			{:else}
				<GalleryGrid images={images} {commentCounts} onSelect={onSelectImage} />
			{/if}
		</div>
	</Panel>
</div>
