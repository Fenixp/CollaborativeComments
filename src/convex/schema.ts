import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	users: defineTable({
		subject: v.string(),
		tokenIdentifier: v.string(),
		name: v.optional(v.string()),
		email: v.optional(v.string()),
		colorToken: v.optional(v.string()),
		updatedAt: v.number(),
	})
		.index('by_subject', ['subject'])
		.index('by_token_identifier', ['tokenIdentifier']),
	images: defineTable({
		state: v.union(v.literal('uploading'), v.literal('ready')),
		name: v.string(),
		normalizedName: v.string(),
		originalFileName: v.string(),
		contentType: v.string(),
		sizeBytes: v.number(),
		storageId: v.optional(v.id('_storage')),
		uploaderSubject: v.string(),
		uploaderTokenIdentifier: v.string(),
		uploaderName: v.optional(v.string()),
		uploaderEmail: v.optional(v.string()),
		updatedAt: v.number(),
		finalizedAt: v.optional(v.number()),
	})
		.index('by_state', ['state'])
		.index('by_normalized_name', ['normalizedName'])
		.index('by_uploader_token', ['uploaderTokenIdentifier']),
	imageComments: defineTable({
		imageId: v.id('images'),
		authorSubject: v.string(),
		text: v.string(),
		x: v.number(),
		y: v.number(),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index('by_image', ['imageId'])
		.index('by_author_subject', ['authorSubject']),
	imageCursors: defineTable({
		imageId: v.id('images'),
		userSubject: v.string(),
		x: v.number(),
		y: v.number(),
		updatedAt: v.number(),
		isActive: v.boolean(),
	})
		.index('by_image', ['imageId'])
		.index('by_user_image', ['userSubject', 'imageId']),
});
