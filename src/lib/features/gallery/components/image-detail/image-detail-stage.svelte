<script lang="ts">
	import { LoaderCircle } from 'lucide-svelte';
	import CursorArrow from '$lib/features/gallery/components/cursor-arrow.svelte';
	import ImageCommentDraftForm from '$lib/features/gallery/components/image-detail/image-comment-draft-form.svelte';
	import ImageCommentMarker from '$lib/features/gallery/components/image-detail/image-comment-marker.svelte';
	import ImageCommentPopup from '$lib/features/gallery/components/image-detail/image-comment-popup.svelte';
	import {
		FALLBACK_THUMBNAIL_URL,
		type GalleryImage,
		type GalleryImageComment,
		type ImageCommentAnchor,
		type ImageCommentOverlayState,
		type RemoteCursor,
	} from '$lib/features/gallery/gallery';
	import { getCursorStyle } from '$lib/features/gallery/image-detail-cursors';
	import { isCommentOverlayActive } from '$lib/features/gallery/image-detail-comment-overlay';

	let {
		image,
		comments,
		isCommentsLoading,
		overlayState,
		activeComment,
		draftText,
		isDraftFlashing,
		isSubmittingComment,
		commentError,
		displayedRemoteCursors,
		onCursorMove,
		onCursorLeave,
		onOpenDraft,
		onFlashDraft,
		onMarkerEnter,
		onMarkerLeave,
		onPinComment,
		onPopupEnter,
		onPopupLeave,
		onClosePopup,
		onDraftTextChange,
		onSubmitDraft,
		onCancelDraft,
		onDraftInputMount,
	} = $props<{
		image: GalleryImage;
		comments: GalleryImageComment[];
		isCommentsLoading: boolean;
		overlayState: ImageCommentOverlayState;
		activeComment: GalleryImageComment | null;
		draftText: string;
		isDraftFlashing: boolean;
		isSubmittingComment: boolean;
		commentError: string | null;
		displayedRemoteCursors: RemoteCursor[];
		onCursorMove: (payload: { x: number; y: number; shouldPublishImmediately: boolean }) => void;
		onCursorLeave: () => void;
		onOpenDraft: (anchor: ImageCommentAnchor) => void;
		onFlashDraft: () => void;
		onMarkerEnter: (commentId: string) => void;
		onMarkerLeave: (commentId: string) => void;
		onPinComment: (commentId: string) => void;
		onPopupEnter: () => void;
		onPopupLeave: () => void;
		onClosePopup: () => void;
		onDraftTextChange: (value: string) => void;
		onSubmitDraft: () => void;
		onCancelDraft: () => void;
		onDraftInputMount: (element: HTMLInputElement | null) => void;
	}>();

	function getRelativeAnchor(event: MouseEvent) {
		const stage = event.currentTarget as HTMLDivElement;
		const rect = stage.getBoundingClientRect();

		if (rect.width === 0 || rect.height === 0) {
			return null;
		}

		return {
			x: Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1),
			y: Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1),
		};
	}

	function handleStageMouseMove(event: MouseEvent) {
		const anchor = getRelativeAnchor(event);

		if (!anchor) {
			return;
		}

		onCursorMove({
			x: anchor.x,
			y: anchor.y,
			shouldPublishImmediately: true,
		});
	}

	function handleStageClick(event: MouseEvent) {
		const target = event.target as Element;
		if (target.closest('[data-comment-overlay]')) {
			return;
		}

		if (overlayState.kind === 'draft') {
			onFlashDraft();
			return;
		}

		const anchor = getRelativeAnchor(event);
		if (!anchor) {
			return;
		}

		onOpenDraft(anchor);
	}
</script>

<div class="mt-6 flex max-h-[calc(100vh-18rem)] min-h-[18rem] items-center justify-center rounded-3xl bg-slate-100 p-4 sm:p-6">
	<div
		class="relative inline-block max-h-full max-w-full"
		onclick={handleStageClick}
		onmousemove={handleStageMouseMove}
		onmouseleave={onCursorLeave}
		role="presentation"
	>
		<img
			src={image.thumbnailUrl ?? FALLBACK_THUMBNAIL_URL}
			alt={image.name}
			class="block max-h-[calc(100vh-22rem)] w-auto max-w-full rounded-2xl object-contain shadow-sm"
		/>

		<div class="pointer-events-none absolute inset-0">
			{#if isCommentsLoading}
				<div class="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
					<LoaderCircle class="h-3.5 w-3.5 animate-spin" />
					Syncing comments…
				</div>
			{/if}

			{#each comments as comment (comment.id)}
				<ImageCommentMarker
					{comment}
					isActive={isCommentOverlayActive(overlayState, comment.id)}
					onHoverStart={() => {
						onMarkerEnter(comment.id);
					}}
					onHoverEnd={() => {
						onMarkerLeave(comment.id);
					}}
					onPin={() => {
						onPinComment(comment.id);
					}}
				/>
			{/each}

			{#each displayedRemoteCursors as cursor (cursor.userSubject)}
				<div class="pointer-events-none absolute" style={getCursorStyle(cursor)}>
					<CursorArrow colorValue={cursor.colorValue} />
				</div>
			{/each}

			{#if activeComment}
				<ImageCommentPopup
					comment={activeComment}
					isPinned={overlayState.kind === 'pinned'}
					onMouseEnter={onPopupEnter}
					onMouseLeave={onPopupLeave}
					onClose={onClosePopup}
				/>
			{/if}

			{#if overlayState.kind === 'draft'}
				<ImageCommentDraftForm
					anchor={overlayState.anchor}
					{draftText}
					{isDraftFlashing}
					isSubmitting={isSubmittingComment}
					{commentError}
					onDraftTextChange={onDraftTextChange}
					onSubmit={onSubmitDraft}
					onCancel={onCancelDraft}
					onInputMount={onDraftInputMount}
				/>
			{/if}
		</div>
	</div>
</div>
