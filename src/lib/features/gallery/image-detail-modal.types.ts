import type { RemoteCursor } from '$lib/features/gallery/gallery';

export type TimeoutHandle = ReturnType<typeof setTimeout>;
export type IntervalHandle = ReturnType<typeof setInterval>;

export type QueuedCursorPosition = Pick<RemoteCursor, 'x' | 'y' | 'updatedAt'>;

export type AnimatedRemoteCursor = {
	userSubject: string;
	colorToken: RemoteCursor['colorToken'];
	colorValue: string;
	renderedX: number;
	renderedY: number;
	lastServerUpdatedAt: number;
	lastRenderedUpdatedAt: number;
	queue: QueuedCursorPosition[];
	activeTarget: QueuedCursorPosition | null;
	segmentStartX: number;
	segmentStartY: number;
	segmentStartedAt: number;
	segmentDurationMs: number;
};
