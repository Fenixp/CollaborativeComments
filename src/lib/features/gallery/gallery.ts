import { api } from '../../../convex/_generated/api.js';

export const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
export const MAX_IMAGE_SIZE_LABEL = '2 MB';
export const FALLBACK_THUMBNAIL_URL = '/gallery-fallback.svg';
export const MAX_COMMENT_LENGTH = 100;

const commentsApi = (api as typeof api & {
	comments: {
		listImageComments: any;
		createImageComment: any;
		getCommentCountsByImageId: any;
	};
}).comments;

const cursorsApi = (api as typeof api & {
	cursors: {
		listImageCursors: any;
		upsertCursor: any;
		clearCursor: any;
	};
}).cursors;

export const galleryApi = {
	listGallery: api.images.listGallery,
	prepareUpload: api.images.prepareUpload,
	finalizeUpload: api.images.finalizeUpload,
	cleanupUpload: api.images.cleanupUpload,
	deleteImage: (api as typeof api & { images: { deleteImage: any } }).images.deleteImage,
	listImageComments: commentsApi.listImageComments,
	createImageComment: commentsApi.createImageComment,
	getCommentCountsByImageId: commentsApi.getCommentCountsByImageId,
	listImageCursors: cursorsApi.listImageCursors,
	upsertCursor: cursorsApi.upsertCursor,
	clearCursor: cursorsApi.clearCursor,
};

export type GalleryImage = {
	id: string;
	name: string;
	thumbnailUrl: string | null;
	contentType: string;
	sizeBytes: number;
	uploaderName: string;
	uploaderSubject: string;
	createdAt: number;
};

export type GalleryImageCommentAuthor = {
	subject: string;
	name: string;
	colorToken: string;
	colorValue: string;
};

export type GalleryImageComment = {
	id: string;
	imageId: string;
	text: string;
	x: number;
	y: number;
	createdAt: number;
	author: GalleryImageCommentAuthor;
};

export type RemoteCursor = {
	userSubject: string;
	x: number;
	y: number;
	updatedAt: number;
	colorToken: string;
	colorValue: string;
};

export type ImageCommentAnchor = {
	x: number;
	y: number;
};

export type ImageCommentOverlayState =
	| { kind: 'idle' }
	| { kind: 'draft'; anchor: ImageCommentAnchor }
	| { kind: 'preview'; commentId: string }
	| { kind: 'pinned'; commentId: string };

export function getAutofilledImageName(file: File) {
	return file.name.trim();
}

export function validateSelectedFile(file: File) {
	if (!file.type.startsWith('image/')) {
		return 'Only image files are allowed.';
	}

	if (file.size > MAX_IMAGE_SIZE_BYTES) {
		return `Images must be ${MAX_IMAGE_SIZE_LABEL} or smaller.`;
	}

	return null;
}

export function formatBytes(sizeBytes: number) {
	if (sizeBytes < 1024) {
		return `${sizeBytes} B`;
	}

	if (sizeBytes < 1024 * 1024) {
		return `${(sizeBytes / 1024).toFixed(1)} KB`;
	}

	return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatUploadError(error: unknown) {
	return error instanceof Error ? error.message : 'Unable to upload this image right now.';
}

export function validateCommentSubmission(commentText: string, hasClient: boolean) {
	const trimmed = commentText.trim();

	if (!trimmed) {
		return 'Enter a comment before submitting.';
	}

	if (trimmed.length > MAX_COMMENT_LENGTH) {
		return `Comments can be at most ${MAX_COMMENT_LENGTH} characters.`;
	}

	if (!hasClient) {
		return 'Convex is not configured for this browser session.';
	}

	return null;
}

export function formatCommentError(error: unknown) {
	return error instanceof Error ? error.message : 'Unable to save this comment right now.';
}

export function formatDeleteError(error: unknown) {
	return error instanceof Error ? error.message : 'Unable to delete this image right now.';
}

export function getPopupPlacement(anchor: ImageCommentAnchor) {
	return {
		horizontal: anchor.x > 0.68 ? 'right' : 'left',
		vertical: anchor.y > 0.68 ? 'above' : 'below',
	};
}

export function getReadableTextColor(backgroundHex: string) {
	const normalized = backgroundHex.replace('#', '');
	const safeHex = normalized.length === 3
		? normalized
				.split('')
				.map((character) => `${character}${character}`)
				.join('')
		: normalized;

	const red = Number.parseInt(safeHex.slice(0, 2), 16);
	const green = Number.parseInt(safeHex.slice(2, 4), 16);
	const blue = Number.parseInt(safeHex.slice(4, 6), 16);
	const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

	return luminance > 0.7 ? '#0f172a' : '#ffffff';
}
