import { actionGeneric, makeFunctionReference, mutationGeneric, queryGeneric } from 'convex/server';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel.js';

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

function sanitizeImageName(name: string) {
	return name.replace(/[\\/]+/g, '-').replace(/\s+/g, ' ').trim();
}

function normalizeImageName(name: string) {
	return sanitizeImageName(name).toLocaleLowerCase();
}

function splitExtension(name: string) {
	const trimmed = sanitizeImageName(name);
	const dotIndex = trimmed.lastIndexOf('.');

	if (dotIndex <= 0 || dotIndex === trimmed.length - 1) {
		return { base: trimmed, extension: '' };
	}

	return {
		base: trimmed.slice(0, dotIndex),
		extension: trimmed.slice(dotIndex),
	};
}

function appendShortGuidSuffix(name: string) {
	const { base, extension } = splitExtension(name);
	const suffix = crypto.randomUUID().split('-')[0];

	return `${base}-${suffix}${extension}`;
}

function validateImageConstraints({
	name,
	contentType,
	sizeBytes,
}: {
	name: string;
	contentType: string;
	sizeBytes: number;
}) {
	const sanitizedName = sanitizeImageName(name);

	if (!sanitizedName) {
		throw new Error('Enter an image name before uploading.');
	}

	if (!contentType.startsWith('image/')) {
		throw new Error('Only image files are allowed.');
	}

	if (sizeBytes > MAX_IMAGE_SIZE_BYTES) {
		throw new Error('Images must be 2 MB or smaller.');
	}

	return sanitizedName;
}

async function requireIdentity(ctx: { auth: { getUserIdentity: () => Promise<any> } }) {
	const identity = await ctx.auth.getUserIdentity();

	if (!identity) {
		throw new Error('You must be signed in to access the gallery.');
	}

	return identity;
}

async function resolveUniqueImageName(ctx: { db: any }, proposedName: string) {
	let candidate = sanitizeImageName(proposedName);

	for (let attempt = 0; attempt < 25; attempt += 1) {
		const existing = await ctx.db
			.query('images')
			.withIndex('by_normalized_name', (q: any) => q.eq('normalizedName', normalizeImageName(candidate)))
			.collect();

		if (existing.length === 0) {
			return candidate;
		}

		candidate = appendShortGuidSuffix(proposedName);
	}

	return appendShortGuidSuffix(candidate);
}

export const listGallery = queryGeneric({
	args: {},
	handler: async (ctx) => {
		await requireIdentity(ctx);

		const images = await ctx.db
			.query('images')
			.withIndex('by_state', (q) => q.eq('state', 'ready'))
			.order('desc')
			.collect();

		return Promise.all(
			images.map(async (image) => ({
				id: image._id,
				name: image.name,
				thumbnailUrl: image.storageId ? await ctx.storage.getUrl(image.storageId) : null,
				contentType: image.contentType,
				sizeBytes: image.sizeBytes,
				uploaderName: image.uploaderName ?? image.uploaderEmail ?? 'Authenticated teammate',
				uploaderSubject: image.uploaderSubject,
				createdAt: image.finalizedAt ?? image.updatedAt ?? image._creationTime,
			}))
		);
	},
});

export const getPreparedUpload = queryGeneric({
	args: {
		imageId: v.id('images'),
	},
	handler: async (ctx, args) => {
		const identity = await requireIdentity(ctx);
		const image = await ctx.db.get(args.imageId);

		if (!image || image.uploaderTokenIdentifier !== identity.tokenIdentifier) {
			throw new Error('Upload session not found.');
		}

		return image;
	},
});

export const getStorageMetadata = queryGeneric({
	args: {
		storageId: v.id('_storage'),
	},
	handler: async (ctx, args) => {
		await requireIdentity(ctx);

		return ctx.db.system.get('_storage', args.storageId);
	},
});

export const prepareUpload = mutationGeneric({
	args: {
		name: v.string(),
		fileName: v.string(),
		contentType: v.string(),
		sizeBytes: v.number(),
	},
	handler: async (ctx, args) => {
		const identity = await requireIdentity(ctx);
		const sanitizedName = validateImageConstraints(args);
		const resolvedName = await resolveUniqueImageName(ctx, sanitizedName);
		const uploadUrl = await ctx.storage.generateUploadUrl();
		const now = Date.now();

		const imageId = await ctx.db.insert('images', {
			state: 'uploading',
			name: resolvedName,
			normalizedName: normalizeImageName(resolvedName),
			originalFileName: args.fileName,
			contentType: args.contentType,
			sizeBytes: args.sizeBytes,
			uploaderSubject: identity.subject,
			uploaderTokenIdentifier: identity.tokenIdentifier,
			uploaderName: identity.name ?? undefined,
			uploaderEmail: identity.email ?? undefined,
			updatedAt: now,
		});

		return {
			imageId,
			uploadUrl,
			resolvedName,
			maxSizeBytes: MAX_IMAGE_SIZE_BYTES,
		};
	},
});

export const commitUpload = mutationGeneric({
	args: {
		imageId: v.id('images'),
		storageId: v.id('_storage'),
		contentType: v.string(),
		sizeBytes: v.number(),
	},
	handler: async (ctx, args) => {
		const identity = await requireIdentity(ctx);
		const image = await ctx.db.get(args.imageId);

		if (!image || image.uploaderTokenIdentifier !== identity.tokenIdentifier) {
			throw new Error('Upload session not found.');
		}

		if (image.state !== 'uploading') {
			throw new Error('This image upload is no longer awaiting finalization.');
		}

		validateImageConstraints({
			name: image.name,
			contentType: args.contentType,
			sizeBytes: args.sizeBytes,
		});

		const now = Date.now();

		await ctx.db.patch(args.imageId, {
			state: 'ready',
			storageId: args.storageId,
			contentType: args.contentType,
			sizeBytes: args.sizeBytes,
			updatedAt: now,
			finalizedAt: now,
		});

		return {
			imageId: args.imageId,
			name: image.name,
		};
	},
});

export const cleanupUpload = mutationGeneric({
	args: {
		imageId: v.id('images'),
		storageId: v.optional(v.id('_storage')),
	},
	handler: async (ctx, args) => {
		const identity = await requireIdentity(ctx);
		const image = await ctx.db.get(args.imageId);

		if (image && image.uploaderTokenIdentifier !== identity.tokenIdentifier) {
			throw new Error('You cannot clean up another user\'s upload.');
		}

		if (image?.state === 'ready') {
			return { cleaned: false };
		}

		const storageId: Id<'_storage'> | undefined = args.storageId ?? image?.storageId;
		const cleanupErrors: string[] = [];

		if (storageId) {
			try {
				await ctx.storage.delete(storageId);
			} catch (error) {
				cleanupErrors.push(error instanceof Error ? error.message : 'Failed to delete uploaded storage.');
			}
		}

		if (image) {
			try {
				await ctx.db.delete(args.imageId);
			} catch (error) {
				cleanupErrors.push(error instanceof Error ? error.message : 'Failed to delete upload metadata.');
			}
		}

		if (cleanupErrors.length > 0) {
			throw new Error(cleanupErrors.join(' '));
		}

		return { cleaned: true };
	},
});

export const deleteImage = mutationGeneric({
	args: {
		imageId: v.id('images'),
	},
	handler: async (ctx, args) => {
		const identity = await requireIdentity(ctx);
		const image = await ctx.db.get(args.imageId);

		if (!image || image.state !== 'ready') {
			throw new Error('Image not found.');
		}

		if (image.uploaderTokenIdentifier !== identity.tokenIdentifier) {
			throw new Error('You can only delete your own images.');
		}

		const comments = await ctx.db
			.query('imageComments')
			.withIndex('by_image', (q: any) => q.eq('imageId', args.imageId))
			.collect();

		await Promise.all(comments.map((comment) => ctx.db.delete(comment._id)));

		const cursors = await ctx.db
			.query('imageCursors')
			.withIndex('by_image', (q: any) => q.eq('imageId', args.imageId))
			.collect();

		await Promise.all(cursors.map((cursor) => ctx.db.delete(cursor._id)));

		if (image.storageId) {
			await ctx.storage.delete(image.storageId);
		}

		await ctx.db.delete(args.imageId);
	},
});

export const finalizeUpload = actionGeneric({
	args: {
		imageId: v.id('images'),
		storageId: v.id('_storage'),
	},
	handler: async (ctx, args) => {
		await requireIdentity(ctx);

		try {
			const prepared = await ctx.runQuery(makeFunctionReference<'query'>('images:getPreparedUpload'), {
				imageId: args.imageId,
			});

			const metadata = await ctx.runQuery(makeFunctionReference<'query'>('images:getStorageMetadata'), {
				storageId: args.storageId,
			});

			if (!metadata) {
				throw new Error('Uploaded image data could not be located.');
			}

			validateImageConstraints({
				name: prepared.name,
				contentType: metadata.contentType ?? '',
				sizeBytes: metadata.size,
			});

			return await ctx.runMutation(makeFunctionReference<'mutation'>('images:commitUpload'), {
				imageId: args.imageId,
				storageId: args.storageId,
				contentType: metadata.contentType ?? prepared.contentType,
				sizeBytes: metadata.size,
			});
		} catch (error) {
			try {
				await ctx.runMutation(makeFunctionReference<'mutation'>('images:cleanupUpload'), {
					imageId: args.imageId,
					storageId: args.storageId,
				});
			} catch {
				// Preserve the original finalize error while still attempting compensation.
			}

			throw error;
		}
	},
});
