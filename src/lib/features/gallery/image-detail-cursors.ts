import type { RemoteCursor } from '$lib/features/gallery/gallery';
import type { AnimatedRemoteCursor } from '$lib/features/gallery/image-detail-modal.types';

export const CURSOR_UPDATE_INTERVAL_MS = 250;
export const CURSOR_STALE_AFTER_MS = 2000;
export const MIN_CURSOR_SEGMENT_MS = 25;
export const MAX_CURSOR_SEGMENT_MS = CURSOR_UPDATE_INTERVAL_MS;

export function getCursorStyle(cursor: Pick<RemoteCursor, 'x' | 'y'>) {
	return `left: ${cursor.x * 100}%; top: ${cursor.y * 100}%; will-change: left, top;`;
}

export function rebuildDisplayedRemoteCursors(
	animatedRemoteCursors: Record<string, AnimatedRemoteCursor>,
	currentTime: number,
) {
	return Object.values(animatedRemoteCursors)
		.filter((cursor) => currentTime - cursor.lastServerUpdatedAt < CURSOR_STALE_AFTER_MS)
		.map((cursor) => ({
			userSubject: cursor.userSubject,
			x: cursor.renderedX,
			y: cursor.renderedY,
			updatedAt: cursor.lastServerUpdatedAt,
			colorToken: cursor.colorToken,
			colorValue: cursor.colorValue,
		}));
}

export function stepAnimatedRemoteCursors(
	animatedRemoteCursors: Record<string, AnimatedRemoteCursor>,
	timestamp: number,
) {
	let hasMoreMotion = false;

	for (const cursor of Object.values(animatedRemoteCursors)) {
		if (cursor.activeTarget === null && cursor.queue.length > 0) {
			const [nextTarget, ...remainingQueue] = cursor.queue;
			cursor.queue = remainingQueue;
			cursor.activeTarget = nextTarget;
			cursor.segmentStartX = cursor.renderedX;
			cursor.segmentStartY = cursor.renderedY;
			cursor.segmentStartedAt = timestamp;
			cursor.segmentDurationMs = clampCursorSegmentDuration(
				nextTarget.updatedAt - cursor.lastRenderedUpdatedAt,
			);
		}

		if (cursor.activeTarget === null) {
			continue;
		}

		const elapsed = timestamp - cursor.segmentStartedAt;
		const progress = Math.min(elapsed / cursor.segmentDurationMs, 1);
		const easedProgress = 1 - (1 - progress) * (1 - progress);

		cursor.renderedX =
			cursor.segmentStartX + (cursor.activeTarget.x - cursor.segmentStartX) * easedProgress;
		cursor.renderedY =
			cursor.segmentStartY + (cursor.activeTarget.y - cursor.segmentStartY) * easedProgress;

		if (progress >= 1) {
			cursor.renderedX = cursor.activeTarget.x;
			cursor.renderedY = cursor.activeTarget.y;
			cursor.lastRenderedUpdatedAt = cursor.activeTarget.updatedAt;
			cursor.activeTarget = null;
		}

		if (cursor.activeTarget !== null || cursor.queue.length > 0) {
			hasMoreMotion = true;
		}
	}

	return hasMoreMotion;
}

export function syncAnimatedRemoteCursors(
	animatedRemoteCursors: Record<string, AnimatedRemoteCursor>,
	remoteCursors: RemoteCursor[],
	currentUserSubject?: string,
) {
	const incomingRemoteCursors = remoteCursors.filter(
		(cursor) => cursor.userSubject !== currentUserSubject,
	);
	const incomingSubjects = new Set(incomingRemoteCursors.map((cursor) => cursor.userSubject));

	for (const cursor of incomingRemoteCursors) {
		const existing = animatedRemoteCursors[cursor.userSubject];

		if (!existing) {
			animatedRemoteCursors[cursor.userSubject] = {
				userSubject: cursor.userSubject,
				colorToken: cursor.colorToken,
				colorValue: cursor.colorValue,
				renderedX: cursor.x,
				renderedY: cursor.y,
				lastServerUpdatedAt: cursor.updatedAt,
				lastRenderedUpdatedAt: cursor.updatedAt,
				queue: [],
				activeTarget: null,
				segmentStartX: cursor.x,
				segmentStartY: cursor.y,
				segmentStartedAt: 0,
				segmentDurationMs: CURSOR_UPDATE_INTERVAL_MS,
			};
			continue;
		}

		existing.colorToken = cursor.colorToken;
		existing.colorValue = cursor.colorValue;
		existing.lastServerUpdatedAt = cursor.updatedAt;

		const latestQueuedTarget = existing.queue.at(-1) ?? existing.activeTarget;
		if (latestQueuedTarget && isSameCursorPoint(latestQueuedTarget, cursor)) {
			continue;
		}

		if (
			!latestQueuedTarget &&
			isSameCursorPoint({ x: existing.renderedX, y: existing.renderedY }, cursor)
		) {
			continue;
		}

		existing.queue = [
			...existing.queue,
			{
				x: cursor.x,
				y: cursor.y,
				updatedAt: cursor.updatedAt,
			},
		];
	}

	for (const subject of Object.keys(animatedRemoteCursors)) {
		if (!incomingSubjects.has(subject)) {
			delete animatedRemoteCursors[subject];
		}
	}
}

function isSameCursorPoint(
	left: Pick<RemoteCursor, 'x' | 'y'>,
	right: Pick<RemoteCursor, 'x' | 'y'>,
) {
	return Math.abs(left.x - right.x) < 0.0001 && Math.abs(left.y - right.y) < 0.0001;
}

function clampCursorSegmentDuration(durationMs: number) {
	return Math.min(Math.max(durationMs, MIN_CURSOR_SEGMENT_MS), MAX_CURSOR_SEGMENT_MS);
}
