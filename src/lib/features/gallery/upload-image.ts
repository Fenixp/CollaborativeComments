import type { ConvexClient } from 'convex/browser';
import {
	formatUploadError,
	galleryApi,
	getAutofilledImageName,
	validateSelectedFile,
} from '$lib/features/gallery/gallery';

type UploadResponse = {
	storageId: string;
};

type PreparedUpload = {
	imageId: string;
	uploadUrl: string;
	resolvedName: string;
};

export type UploadModalState = {
	status: 'uploading' | 'failed';
	name: string;
	fileName: string;
	message: string;
};

export type SelectedUploadFileResult = {
	selectedFile: File | null;
	imageName: string;
	formError: string | null;
	shouldResetInput: boolean;
};

export function getSelectedUploadFileResult(file: File | null): SelectedUploadFileResult {
	if (!file) {
		return {
			selectedFile: null,
			imageName: '',
			formError: null,
			shouldResetInput: false,
		};
	}

	const validationError = validateSelectedFile(file);

	if (validationError) {
		return {
			selectedFile: null,
			imageName: '',
			formError: validationError,
			shouldResetInput: true,
		};
	}

	return {
		selectedFile: file,
		imageName: getAutofilledImageName(file),
		formError: null,
		shouldResetInput: false,
	};
}

export function validateUploadSubmission(selectedFile: File | null, imageName: string, client: ConvexClient | null) {
	if (!selectedFile) {
		return 'Choose an image file before uploading.';
	}

	const validationError = validateSelectedFile(selectedFile);

	if (validationError) {
		return validationError;
	}

	if (!imageName.trim()) {
		return 'Enter an image name before uploading.';
	}

	if (!client) {
		return 'Convex is not configured for this browser session.';
	}

	return null;
}

export function createUploadingState(imageName: string, fileName: string): UploadModalState {
	return {
		status: 'uploading',
		name: imageName.trim(),
		fileName,
		message: 'Uploading image and waiting for Convex to commit it to the shared gallery.',
	};
}

export function createFailedUploadState(imageName: string, fileName: string, error: unknown): UploadModalState {
	return {
		status: 'failed',
		name: imageName.trim(),
		fileName,
		message: formatUploadError(error),
	};
}

export async function uploadGalleryImage(client: ConvexClient, selectedFile: File, imageName: string) {
	let preparedUpload: PreparedUpload | null = null;
	let storageId: string | undefined;

	try {
		preparedUpload = (await client.mutation(galleryApi.prepareUpload, {
			name: imageName.trim(),
			fileName: selectedFile.name,
			contentType: selectedFile.type,
			sizeBytes: selectedFile.size,
		})) as PreparedUpload;

		const uploadResponse = await fetch(preparedUpload.uploadUrl, {
			method: 'POST',
			headers: {
				'Content-Type': selectedFile.type,
			},
			body: selectedFile,
		});

		if (!uploadResponse.ok) {
			throw new Error('The storage upload did not complete successfully.');
		}

		const payload = (await uploadResponse.json()) as UploadResponse;
		storageId = payload.storageId;

		await client.action(galleryApi.finalizeUpload, {
			imageId: preparedUpload.imageId,
			storageId,
		});
	} catch (error) {
		if (preparedUpload) {
			try {
				await client.mutation(galleryApi.cleanupUpload, {
					imageId: preparedUpload.imageId,
					storageId,
				});
			} catch {
				// Cleanup is best coordinated with the backend contract; keep the original error visible.
			}
		}

		throw error;
	}
}
