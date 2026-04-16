<script lang="ts">
	import { browser } from '$app/environment';
	import { auth } from '$lib/auth/state';
	import GallerySection from '$lib/components/organisms/gallery-section.svelte';
	import { getConvexClient } from '$lib/convex/client';
	import ImageDetailModal from '$lib/features/gallery/components/image-detail-modal.svelte';
	import UploadImageModal from '$lib/features/gallery/components/upload-image-modal.svelte';
	import { galleryApi, type GalleryImage } from '$lib/features/gallery/gallery';

	let isDialogOpen = $state(false);
	let isGalleryLoading = $state(true);
	let galleryImages = $state<GalleryImage[]>([]);
	let selectedImage = $state<GalleryImage | null>(null);
	let commentCounts = $state<Record<string, number>>({});
	let unsubscribeGallery: (() => void) | null = null;
	let unsubscribeCommentCounts: (() => void) | null = null;

	function closeDialog() {
		isDialogOpen = false;
	}

	function openDialog() {
		isDialogOpen = true;
	}

	function openImageDetail(image: GalleryImage) {
		selectedImage = image;
	}

	function closeImageDetail() {
		selectedImage = null;
	}

	$effect(() => {
		if (!browser) {
			return;
		}

		const client = getConvexClient();

		if (!$auth.isAuthenticated || !$auth.convexAuthenticated || !client) {
			unsubscribeGallery?.();
			unsubscribeGallery = null;
			unsubscribeCommentCounts?.();
			unsubscribeCommentCounts = null;
			galleryImages = [];
			commentCounts = {};
			isGalleryLoading = true;
			return;
		}

		isGalleryLoading = true;
		unsubscribeGallery?.();
		unsubscribeGallery = client.onUpdate(galleryApi.listGallery, {}, (images) => {
			galleryImages = images as GalleryImage[];
			isGalleryLoading = false;
		});

		unsubscribeCommentCounts?.();
		unsubscribeCommentCounts = client.onUpdate(galleryApi.getCommentCountsByImageId, {}, (counts) => {
			commentCounts = counts as Record<string, number>;
		});

		return () => {
			unsubscribeGallery?.();
			unsubscribeGallery = null;
			unsubscribeCommentCounts?.();
			unsubscribeCommentCounts = null;
		};
	});
</script>

<svelte:window
	onkeydown={(event) => {
		if (event.key === 'Escape' && isDialogOpen) {
			closeDialog();
		}
	}}
/>

<GallerySection
	images={galleryImages}
	isLoading={isGalleryLoading}
	{commentCounts}
	onAddImage={openDialog}
	onSelectImage={openImageDetail}
/>

<UploadImageModal
	isOpen={isDialogOpen}
	onClose={closeDialog}
/>

{#if selectedImage}
	<ImageDetailModal image={selectedImage} onClose={closeImageDetail} />
{/if}
