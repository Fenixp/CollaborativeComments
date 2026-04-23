<script lang="ts">
	import { browser } from '$app/environment';
	import { auth } from '$lib/auth/state';
	import Panel from '$lib/components/ui/panel.svelte';
	import { getConvexClient } from '$lib/convex/client';
	import ImageDetailFooter from '$lib/features/gallery/components/image-detail/image-detail-footer.svelte';
	import ImageDetailHeader from '$lib/features/gallery/components/image-detail/image-detail-header.svelte';
	import ImageDetailStage from '$lib/features/gallery/components/image-detail/image-detail-stage.svelte';
	import {
		formatCommentError,
		formatDeleteError,
		galleryApi,
		validateCommentSubmission,
		type GalleryImage,
		type GalleryImageComment,
		type ImageCommentOverlayState,
		type RemoteCursor,
	} from '$lib/features/gallery/gallery';
	import {
		CURSOR_UPDATE_INTERVAL_MS,
		rebuildDisplayedRemoteCursors,
		stepAnimatedRemoteCursors,
		syncAnimatedRemoteCursors,
	} from '$lib/features/gallery/image-detail-cursors';
	import {
		createDraftOverlayState,
		createIdleOverlayState,
		createPinnedOverlayState,
		createPreviewOverlayState,
		DRAFT_FLASH_DURATION_MS,
		getActiveComment,
		PREVIEW_DISMISS_DELAY_MS,
	} from '$lib/features/gallery/image-detail-comment-overlay';
	import type {
		AnimatedRemoteCursor,
		IntervalHandle,
		TimeoutHandle,
	} from '$lib/features/gallery/image-detail-modal.types';

	let {
		image,
		onClose,
	} = $props<{
		image: GalleryImage;
		onClose: () => void;
	}>();

	let comments = $state<GalleryImageComment[]>([]);
	let isCommentsLoading = $state(true);
	let isSubmittingComment = $state(false);
	let commentError = $state<string | null>(null);
	let isDeletingImage = $state(false);
	let isConfirmingDelete = $state(false);
	let deleteError = $state<string | null>(null);
	let draftText = $state('');
	let overlayState = $state<ImageCommentOverlayState>(createIdleOverlayState());
	let commentInput = $state<HTMLInputElement | null>(null);
	let unsubscribeComments: (() => void) | null = null;
	let isDraftFlashing = $state(false);
	const activeComment = $derived(getActiveComment(comments, overlayState));
	let previewDismissTimer: TimeoutHandle | null = null;
	let draftFlashTimer: TimeoutHandle | null = null;

	let remoteCursors = $state<RemoteCursor[]>([]);
	let displayedRemoteCursors = $state<RemoteCursor[]>([]);
	let unsubscribeCursors: (() => void) | null = null;
	let cursorInterval: IntervalHandle | null = null;
	let cursorAnimationFrame: number | null = null;
	let latestCursorX = 0;
	let latestCursorY = 0;
	let isCursorOnImage = false;
	let hasPendingCursorUpdate = false;
	let lastCursorPublishedAt = 0;
	let currentTime = $state(Date.now());
	let animatedRemoteCursors = $state<Record<string, AnimatedRemoteCursor>>({});

	async function publishCursorPosition() {
		const client = getConvexClient();

		if (!client || !$auth.isAuthenticated || !$auth.convexAuthenticated) {
			return;
		}

		await client.mutation(galleryApi.upsertCursor, {
			imageId: image.id,
			x: latestCursorX,
			y: latestCursorY,
		});

		lastCursorPublishedAt = Date.now();
		hasPendingCursorUpdate = false;
	}

	function rebuildCursorRenderState() {
		displayedRemoteCursors = rebuildDisplayedRemoteCursors(animatedRemoteCursors, currentTime);
	}

	function ensureCursorAnimationLoop() {
		if (!browser || cursorAnimationFrame !== null) {
			return;
		}

		const hasQueuedMotion = Object.values(animatedRemoteCursors).some(
			(cursor) => cursor.activeTarget !== null || cursor.queue.length > 0,
		);

		if (!hasQueuedMotion) {
			return;
		}

		cursorAnimationFrame = requestAnimationFrame(stepCursorAnimationLoop);
	}

	function stopCursorAnimationLoop() {
		if (cursorAnimationFrame !== null) {
			cancelAnimationFrame(cursorAnimationFrame);
			cursorAnimationFrame = null;
		}
	}

	function stepCursorAnimationLoop(timestamp: number) {
		cursorAnimationFrame = null;
		const hasMoreMotion = stepAnimatedRemoteCursors(animatedRemoteCursors, timestamp);
		rebuildCursorRenderState();

		if (hasMoreMotion) {
			ensureCursorAnimationLoop();
		}
	}

	function syncCursorMotion() {
		syncAnimatedRemoteCursors(animatedRemoteCursors, remoteCursors, $auth.user?.subject);
		rebuildCursorRenderState();
		ensureCursorAnimationLoop();
	}

	function clearRemoteCursorPresence() {
		const client = getConvexClient();
		if (client && $auth.isAuthenticated) {
			void client.mutation(galleryApi.clearCursor, { imageId: image.id });
		}
	}

	function closeModal() {
		clearRemoteCursorPresence();
		onClose();
	}

	async function confirmDeleteImage() {
		const client = getConvexClient();

		if (!client || !$auth.isAuthenticated) {
			return;
		}

		isDeletingImage = true;
		deleteError = null;

		try {
			await client.mutation(galleryApi.deleteImage, { imageId: image.id });
			onClose();
		} catch (error) {
			deleteError = formatDeleteError(error);
			isDeletingImage = false;
			isConfirmingDelete = false;
		}
	}

	function handleStageMouseLeave() {
		isCursorOnImage = false;
		hasPendingCursorUpdate = false;
	}

	function clearPreviewDismissTimer() {
		if (previewDismissTimer) {
			clearTimeout(previewDismissTimer);
			previewDismissTimer = null;
		}
	}

	function clearDraftFlashTimer() {
		if (draftFlashTimer) {
			clearTimeout(draftFlashTimer);
			draftFlashTimer = null;
		}
	}

	function focusDraftInput() {
		commentInput?.focus();
		commentInput?.select();
	}

	function setDraftInput(element: HTMLInputElement | null) {
		commentInput = element;
	}

	function flashExistingDraft() {
		clearDraftFlashTimer();
		isDraftFlashing = true;
		focusDraftInput();
		draftFlashTimer = setTimeout(() => {
			isDraftFlashing = false;
		}, DRAFT_FLASH_DURATION_MS);
	}

	function closeDraft(options?: { force?: boolean }) {
		if (isSubmittingComment && !options?.force) {
			return;
		}

		overlayState = createIdleOverlayState();
		draftText = '';
		commentError = null;
		isDraftFlashing = false;
		clearDraftFlashTimer();
	}

	function schedulePreviewDismiss(commentId: string) {
		clearPreviewDismissTimer();

		previewDismissTimer = setTimeout(() => {
			if (overlayState.kind === 'preview' && overlayState.commentId === commentId) {
				overlayState = createIdleOverlayState();
			}
		}, PREVIEW_DISMISS_DELAY_MS);
	}

	function openDraft(anchor: { x: number; y: number }) {
		clearPreviewDismissTimer();
		overlayState = createDraftOverlayState(anchor);
		draftText = '';
		commentError = null;
		isDraftFlashing = false;

		setTimeout(() => {
			focusDraftInput();
		}, 0);
	}

	function handleMarkerEnter(commentId: string) {
		clearPreviewDismissTimer();

		if (overlayState.kind === 'pinned') {
			return;
		}

		overlayState = createPreviewOverlayState(commentId);
	}

	function handleMarkerLeave(commentId: string) {
		if (overlayState.kind === 'pinned') {
			return;
		}

		schedulePreviewDismiss(commentId);
	}

	function pinComment(commentId: string) {
		clearPreviewDismissTimer();
		overlayState = createPinnedOverlayState(commentId);
		commentError = null;
	}

	function closePopup() {
		if (overlayState.kind === 'preview' || overlayState.kind === 'pinned') {
			overlayState = createIdleOverlayState();
		}
	}

	function handlePopupMouseLeave() {
		if (overlayState.kind === 'preview') {
			overlayState = createIdleOverlayState();
		}
	}

	function handleCursorMove(payload: { x: number; y: number; shouldPublishImmediately: boolean }) {
		const wasCursorOnImage = isCursorOnImage;
		isCursorOnImage = true;
		latestCursorX = payload.x;
		latestCursorY = payload.y;
		hasPendingCursorUpdate = true;

		if (
			payload.shouldPublishImmediately &&
			(!wasCursorOnImage || Date.now() - lastCursorPublishedAt >= CURSOR_UPDATE_INTERVAL_MS)
		) {
			void publishCursorPosition();
		}
	}

	async function submitDraft() {
		const client = getConvexClient();
		const submissionError = validateCommentSubmission(draftText, Boolean(client));

		if (overlayState.kind !== 'draft' || submissionError || !client) {
			commentError = submissionError;
			focusDraftInput();
			return;
		}

		isSubmittingComment = true;
		commentError = null;

		try {
			await client.mutation(galleryApi.createImageComment, {
				imageId: image.id,
				text: draftText.trim(),
				x: overlayState.anchor.x,
				y: overlayState.anchor.y,
			});

			closeDraft({ force: true });
		} catch (error) {
			commentError = formatCommentError(error);
			focusDraftInput();
		} finally {
			isSubmittingComment = false;
		}
	}

	$effect(() => {
		if (!browser) {
			return;
		}

		const client = getConvexClient();

		if (!$auth.isAuthenticated || !$auth.convexAuthenticated || !client) {
			unsubscribeComments?.();
			unsubscribeComments = null;
			comments = [];
			isCommentsLoading = false;
			return;
		}

		isCommentsLoading = true;
		unsubscribeComments?.();
		unsubscribeComments = client.onUpdate(galleryApi.listImageComments, { imageId: image.id }, (items) => {
			comments = items as GalleryImageComment[];
			isCommentsLoading = false;
		});

		return () => {
			unsubscribeComments?.();
			unsubscribeComments = null;
		};
	});

	$effect(() => {
		return () => {
			clearPreviewDismissTimer();
			clearDraftFlashTimer();
		};
	});

	$effect(() => {
		if (!browser) {
			return;
		}

		const client = getConvexClient();
		if (!$auth.isAuthenticated || !$auth.convexAuthenticated || !client) {
			unsubscribeCursors?.();
			unsubscribeCursors = null;
			remoteCursors = [];
			return;
		}

		unsubscribeCursors?.();
		unsubscribeCursors = client.onUpdate(galleryApi.listImageCursors, { imageId: image.id }, (items) => {
			remoteCursors = items as RemoteCursor[];
		});

		return () => {
			unsubscribeCursors?.();
			unsubscribeCursors = null;
		};
	});

	$effect(() => {
		remoteCursors;
		syncCursorMotion();
	});

	$effect(() => {
		currentTime;
		rebuildCursorRenderState();
	});

	$effect(() => {
		if (!browser) {
			return;
		}

		const timer = setInterval(() => {
			currentTime = Date.now();
		}, 250);

		return () => {
			clearInterval(timer);
		};
	});

	$effect(() => {
		if (!browser) {
			return;
		}

		cursorInterval = setInterval(() => {
			if (!isCursorOnImage || !hasPendingCursorUpdate) {
				return;
			}

			void publishCursorPosition();
		}, CURSOR_UPDATE_INTERVAL_MS);

		return () => {
			stopCursorAnimationLoop();
			if (cursorInterval) {
				clearInterval(cursorInterval);
				cursorInterval = null;
			}
			clearRemoteCursorPresence();
		};
	});
</script>

<svelte:window
	onkeydown={(event) => {
		if (event.key === 'Escape') {
			if (overlayState.kind === 'draft') {
				event.preventDefault();
				closeDraft();
				return;
			}

			closeModal();
		}
	}}
/>

<div class="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
	<button
		type="button"
		class="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
		aria-label="Close image detail dialog"
		onclick={closeModal}
	></button>

	<div
		class="relative z-10 w-full max-w-6xl"
		role="dialog"
		aria-modal="true"
		aria-labelledby="image-detail-dialog-title"
	>
		<Panel class="p-6 sm:p-8">
			<ImageDetailHeader {image} onClose={closeModal} />

			<ImageDetailStage
				{image}
				{comments}
				{isCommentsLoading}
				{overlayState}
				{activeComment}
				{draftText}
				{isDraftFlashing}
				{isSubmittingComment}
				{commentError}
				{displayedRemoteCursors}
				onCursorMove={handleCursorMove}
				onCursorLeave={handleStageMouseLeave}
				onOpenDraft={openDraft}
				onFlashDraft={flashExistingDraft}
				onMarkerEnter={handleMarkerEnter}
				onMarkerLeave={handleMarkerLeave}
				onPinComment={pinComment}
				onPopupEnter={clearPreviewDismissTimer}
				onPopupLeave={handlePopupMouseLeave}
				onClosePopup={closePopup}
				onDraftTextChange={(value) => {
					draftText = value;
				}}
				onSubmitDraft={() => {
					void submitDraft();
				}}
				onCancelDraft={() => {
					closeDraft();
				}}
				onDraftInputMount={setDraftInput}
			/>

			<ImageDetailFooter
				{image}
				currentUserSubject={$auth.user?.subject}
				{isConfirmingDelete}
				{isDeletingImage}
				{deleteError}
				onRequestDelete={() => {
					isConfirmingDelete = true;
					deleteError = null;
				}}
				onCancelDelete={() => {
					isConfirmingDelete = false;
					deleteError = null;
				}}
				onConfirmDelete={() => {
					void confirmDeleteImage();
				}}
				onClose={closeModal}
			/>
		</Panel>
	</div>
</div>
