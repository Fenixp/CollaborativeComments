<script lang="ts">
	import { LoaderCircle, Trash2 } from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';
	import type { GalleryImage } from '$lib/features/gallery/gallery';

	let {
		image,
		currentUserSubject,
		isConfirmingDelete,
		isDeletingImage,
		deleteError,
		onRequestDelete,
		onCancelDelete,
		onConfirmDelete,
		onClose,
	} = $props<{
		image: GalleryImage;
		currentUserSubject?: string;
		isConfirmingDelete: boolean;
		isDeletingImage: boolean;
		deleteError: string | null;
		onRequestDelete: () => void;
		onCancelDelete: () => void;
		onConfirmDelete: () => void;
		onClose: () => void;
	}>();

	const canDelete = $derived(image.uploaderSubject === currentUserSubject);
</script>

<div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
	<div class="flex items-center gap-3">
		{#if canDelete}
			{#if isConfirmingDelete}
				<Button
					size="sm"
					class="gap-1.5 bg-rose-600 text-white hover:bg-rose-700"
					onclick={onConfirmDelete}
					disabled={isDeletingImage}
				>
					{#if isDeletingImage}
						<LoaderCircle class="h-4 w-4 animate-spin" />
					{:else}
						<Trash2 class="h-4 w-4" />
					{/if}
					Confirm delete
				</Button>
				<Button variant="ghost" size="sm" onclick={onCancelDelete} disabled={isDeletingImage}>
					Cancel
				</Button>
			{:else}
				<Button variant="ghost" size="sm" class="gap-1.5" onclick={onRequestDelete}>
					<Trash2 class="h-4 w-4" />
					Delete image
				</Button>
			{/if}
			{#if deleteError}
				<span class="text-sm text-rose-600">{deleteError}</span>
			{/if}
		{/if}
	</div>
	<Button onclick={onClose}>OK</Button>
</div>
