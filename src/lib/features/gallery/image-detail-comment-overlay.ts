import type { GalleryImageComment, ImageCommentAnchor, ImageCommentOverlayState } from '$lib/features/gallery/gallery';

export const DRAFT_FLASH_DURATION_MS = 220;
export const PREVIEW_DISMISS_DELAY_MS = 110;

export function createIdleOverlayState(): ImageCommentOverlayState {
	return { kind: 'idle' };
}

export function createDraftOverlayState(anchor: ImageCommentAnchor): ImageCommentOverlayState {
	return { kind: 'draft', anchor };
}

export function createPreviewOverlayState(commentId: string): ImageCommentOverlayState {
	return { kind: 'preview', commentId };
}

export function createPinnedOverlayState(commentId: string): ImageCommentOverlayState {
	return { kind: 'pinned', commentId };
}

export function isCommentOverlayActive(
	overlayState: ImageCommentOverlayState,
	commentId: string,
) {
	return (overlayState.kind === 'preview' || overlayState.kind === 'pinned') && overlayState.commentId === commentId;
}

export function getActiveComment(
	comments: GalleryImageComment[],
	overlayState: ImageCommentOverlayState,
) {
	if (overlayState.kind !== 'preview' && overlayState.kind !== 'pinned') {
		return null;
	}

	return comments.find((comment) => comment.id === overlayState.commentId) ?? null;
}
