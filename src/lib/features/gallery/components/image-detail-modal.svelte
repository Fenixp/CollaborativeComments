<script lang="ts">
	import { browser } from '$app/environment';
	import { auth } from '$lib/auth/state';
	import { Check, LoaderCircle, MessageCircleMore, Trash2, X } from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Panel from '$lib/components/ui/panel.svelte';
	import { getConvexClient } from '$lib/convex/client';
	import CursorArrow from './cursor-arrow.svelte';
	import {
		FALLBACK_THUMBNAIL_URL,
		formatBytes,
		formatCommentError,
		galleryApi,
		getPopupPlacement,
		getReadableTextColor,
		MAX_COMMENT_LENGTH,
		validateCommentSubmission,
		type GalleryImage,
		type GalleryImageComment,
		type ImageCommentOverlayState,
		type RemoteCursor,
	} from '$lib/features/gallery/gallery';

	let {
		image,
		onClose,
	} = $props<{
		image: GalleryImage;
		onClose: () => void;
	}>();

	type TimeoutHandle = ReturnType<typeof setTimeout>;
	type IntervalHandle = ReturnType<typeof setInterval>;
	const CURSOR_UPDATE_INTERVAL_MS = 250;

	let comments = $state<GalleryImageComment[]>([]);
	let isCommentsLoading = $state(true);
	let isSubmittingComment = $state(false);
	let commentError = $state<string | null>(null);
	let draftText = $state('');
	let overlayState = $state<ImageCommentOverlayState>({ kind: 'idle' });
	let commentInput = $state<HTMLInputElement | null>(null);
	let unsubscribeComments: (() => void) | null = null;
	let isDraftFlashing = $state(false);
	const activeComment = $derived(getActiveComment());
	let previewDismissTimer: TimeoutHandle | null = null;
	let draftFlashTimer: TimeoutHandle | null = null;

	// Cursor state
	let remoteCursors = $state<RemoteCursor[]>([]);
	let unsubscribeCursors: (() => void) | null = null;
	let cursorInterval: IntervalHandle | null = null;
	let latestCursorX = 0;
	let latestCursorY = 0;
	let isCursorOnImage = false;
	let hasPendingCursorUpdate = false;
	let lastCursorPublishedAt = 0;
	let currentTime = $state(Date.now());
	let animatedCursorSubjects = $state<Record<string, boolean>>({});
	const visibleRemoteCursors = $derived(
		remoteCursors.filter(
			(cursor) => cursor.userSubject !== $auth.user?.subject && currentTime - cursor.updatedAt < 2000,
		),
	);

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

	function getCursorStyle(cursor: RemoteCursor) {
		const transition = animatedCursorSubjects[cursor.userSubject]
			? `left ${CURSOR_UPDATE_INTERVAL_MS}ms ease, top ${CURSOR_UPDATE_INTERVAL_MS}ms ease`
			: 'none';

		return `left: ${cursor.x * 100}%; top: ${cursor.y * 100}%; transition: ${transition}; will-change: left, top;`;
	}

	function areAnimatedSubjectMapsEqual(
		left: Record<string, boolean>,
		right: Record<string, boolean>,
	) {
		const leftKeys = Object.keys(left);
		const rightKeys = Object.keys(right);

		if (leftKeys.length !== rightKeys.length) {
			return false;
		}

		return leftKeys.every((key) => left[key] === right[key]);
	}

	function closeModal() {
		const client = getConvexClient();
		if (client && $auth.isAuthenticated) {
			void client.mutation(galleryApi.clearCursor, { imageId: image.id });
		}
		onClose();
	}

	function handleStageMouseMove(event: MouseEvent) {
		const stage = event.currentTarget as HTMLDivElement;
		const rect = stage.getBoundingClientRect();
		if (rect.width === 0 || rect.height === 0) return;

		const wasCursorOnImage = isCursorOnImage;
		isCursorOnImage = true;
		latestCursorX = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
		latestCursorY = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1);
		hasPendingCursorUpdate = true;

		if (!wasCursorOnImage || Date.now() - lastCursorPublishedAt >= CURSOR_UPDATE_INTERVAL_MS) {
			void publishCursorPosition();
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

	function flashExistingDraft() {
		clearDraftFlashTimer();
		isDraftFlashing = true;
		focusDraftInput();
		draftFlashTimer = setTimeout(() => {
			isDraftFlashing = false;
		}, 220);
	}

	function closeDraft(options?: { force?: boolean }) {
		if (isSubmittingComment && !options?.force) {
			return;
		}

		overlayState = { kind: 'idle' };
		draftText = '';
		commentError = null;
		isDraftFlashing = false;
		clearDraftFlashTimer();
	}

	function schedulePreviewDismiss(commentId: string) {
		clearPreviewDismissTimer();

		previewDismissTimer = setTimeout(() => {
			if (overlayState.kind === 'preview' && overlayState.commentId === commentId) {
				overlayState = { kind: 'idle' };
			}
		}, 110);
	}

	function openDraft(anchorX: number, anchorY: number) {
		clearPreviewDismissTimer();
		overlayState = {
			kind: 'draft',
			anchor: {
				x: anchorX,
				y: anchorY,
			},
		};
		draftText = '';
		commentError = null;
		isDraftFlashing = false;

		setTimeout(() => {
			focusDraftInput();
		}, 0);
	}

	function handleStageClick(event: MouseEvent) {
		const stage = event.currentTarget as HTMLDivElement;
		const rect = stage.getBoundingClientRect();

		if (rect.width === 0 || rect.height === 0) {
			return;
		}

		// Ignore clicks that originated inside the draft form or comment popup
		const target = event.target as Element;
		if (target.closest('[data-comment-overlay]')) {
			return;
		}

		if (overlayState.kind === 'draft') {
			flashExistingDraft();
			return;
		}

		const anchorX = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
		const anchorY = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1);
		openDraft(anchorX, anchorY);
	}

	function handleMarkerEnter(commentId: string) {
		clearPreviewDismissTimer();

		if (overlayState.kind === 'pinned') {
			return;
		}

		overlayState = { kind: 'preview', commentId };
	}

	function handleMarkerLeave(commentId: string) {
		if (overlayState.kind === 'pinned') {
			return;
		}

		schedulePreviewDismiss(commentId);
	}

	function pinComment(commentId: string) {
		clearPreviewDismissTimer();
		overlayState = { kind: 'pinned', commentId };
		commentError = null;
	}

	function closePopup() {
		if (overlayState.kind === 'preview' || overlayState.kind === 'pinned') {
			overlayState = { kind: 'idle' };
		}
	}

	function getActiveComment() {
		if (overlayState.kind !== 'preview' && overlayState.kind !== 'pinned') {
			return null;
		}

		return comments.find((comment) => comment.id === overlayState.commentId) ?? null;
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

	// Subscribe to remote cursors
	$effect(() => {
		if (!browser) return;

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
		const nextAnimatedSubjects = { ...animatedCursorSubjects };
		let shouldPromoteNewSubjects = false;

		for (const cursor of visibleRemoteCursors) {
			if (!(cursor.userSubject in nextAnimatedSubjects)) {
				nextAnimatedSubjects[cursor.userSubject] = false;
				shouldPromoteNewSubjects = true;
			}
		}

		const visibleSubjects = new Set(visibleRemoteCursors.map((cursor) => cursor.userSubject));
		for (const subject of Object.keys(nextAnimatedSubjects)) {
			if (!visibleSubjects.has(subject)) {
				delete nextAnimatedSubjects[subject];
			}
		}

		if (!areAnimatedSubjectMapsEqual(animatedCursorSubjects, nextAnimatedSubjects)) {
			animatedCursorSubjects = nextAnimatedSubjects;
		}

		if (!shouldPromoteNewSubjects || !browser) {
			return;
		}

		const frame = requestAnimationFrame(() => {
			animatedCursorSubjects = Object.fromEntries(
				Object.entries(nextAnimatedSubjects).map(([subject]) => [subject, true]),
			);
		});

		return () => {
			cancelAnimationFrame(frame);
		};
	});

	// Broadcast cursor position at the configured interval
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
		if (!browser) return;

		cursorInterval = setInterval(() => {
			if (!isCursorOnImage || !hasPendingCursorUpdate) {
				return;
			}

			void publishCursorPosition();
		}, CURSOR_UPDATE_INTERVAL_MS);

		return () => {
			if (cursorInterval) {
				clearInterval(cursorInterval);
				cursorInterval = null;
			}
			// Clear cursor presence on unmount
			const client = getConvexClient();
			if (client && $auth.isAuthenticated) {
				void client.mutation(galleryApi.clearCursor, { imageId: image.id });
			}
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

	<div class="relative z-10 w-full max-w-6xl" role="dialog" aria-modal="true" aria-labelledby="image-detail-dialog-title">
		<Panel class="p-6 sm:p-8">
			<div class="flex items-start justify-between gap-4">
				<div>
					<p class="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Gallery image</p>
					<h2 id="image-detail-dialog-title" class="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
						{image.name}
					</h2>
					<p class="mt-2 text-sm leading-6 text-slate-600">
						Uploaded by {image.uploaderName} · {image.contentType} · {formatBytes(image.sizeBytes)}
					</p>
				</div>
				<Button variant="ghost" size="sm" onclick={closeModal}>
					<X class="h-4 w-4" />
				</Button>
			</div>

			<div class="mt-6 flex max-h-[calc(100vh-18rem)] min-h-[18rem] items-center justify-center rounded-3xl bg-slate-100 p-4 sm:p-6">
				<div
					class="relative inline-block max-h-full max-w-full"
					onclick={handleStageClick}
					onmousemove={handleStageMouseMove}
					onmouseleave={handleStageMouseLeave}
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
							{@const isActive = overlayState.kind === 'preview' || overlayState.kind === 'pinned' ? overlayState.commentId === comment.id : false}
							<button
								type="button"
								class={`pointer-events-auto absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md transition duration-150 ${isActive ? 'scale-110 ring-4 ring-white/70' : 'hover:scale-110'}`}
								style={`left: ${comment.x * 100}%; top: ${comment.y * 100}%; background-color: ${comment.author.colorValue};`}
								aria-label={`Open comment from ${comment.author.name}`}
								onmouseenter={() => {
									handleMarkerEnter(comment.id);
								}}
								onmouseleave={() => {
									handleMarkerLeave(comment.id);
								}}
								onclick={(event) => {
									event.stopPropagation();
									pinComment(comment.id);
								}}
							></button>
						{/each}

						{#each visibleRemoteCursors as cursor (cursor.userSubject)}
							<div
								class="pointer-events-none absolute"
								style={getCursorStyle(cursor)}
							>
								<CursorArrow colorValue={cursor.colorValue} />
							</div>
						{/each}

						{#if activeComment !== null}
							{@const placement = getPopupPlacement({ x: activeComment.x, y: activeComment.y })}
							{@const popupTextColor = getReadableTextColor(activeComment.author.colorValue)}
							<div
								role="tooltip"
								data-comment-overlay
								class="pointer-events-auto absolute z-10 w-64"
								style={`
									${placement.horizontal === 'right' ? `right: ${(1 - activeComment.x) * 100}%` : `left: ${activeComment.x * 100}%`};
									${placement.vertical === 'above' ? `bottom: ${(1 - activeComment.y) * 100}%` : `top: ${activeComment.y * 100}%`};
								`}
								onmouseenter={clearPreviewDismissTimer}
								onmouseleave={() => {
									if (overlayState.kind === 'preview') {
										overlayState = { kind: 'idle' };
									}
								}}
							>
								<div
									class="rounded-2xl px-4 py-3 shadow-xl"
									style={`background-color: ${activeComment.author.colorValue}; color: ${popupTextColor};`}
								>
									<div class="flex items-start gap-3">
										<div class="min-w-0 flex-1">
											<p class="truncate text-sm font-semibold">{activeComment.author.name}</p>
											<p class="mt-1 text-sm leading-5 opacity-95">{activeComment.text}</p>
										</div>

										{#if overlayState.kind === 'pinned'}
											<button
												type="button"
												class="rounded-full p-1 transition hover:bg-black/10"
												aria-label="Close comment popup"
												onclick={(event) => {
													event.stopPropagation();
													closePopup();
												}}
											>
												<X class="h-4 w-4" />
											</button>
										{/if}
									</div>
								</div>
							</div>
						{/if}

						{#if overlayState.kind === 'draft'}
							{@const placement = getPopupPlacement(overlayState.anchor)}
							<form
								data-comment-overlay
								class={`pointer-events-auto absolute z-20 w-72 rounded-2xl border bg-white/96 p-3 shadow-xl backdrop-blur ${isDraftFlashing ? 'border-rose-400 ring-2 ring-rose-300' : 'border-slate-200'}`}
								style={`
									${placement.horizontal === 'right' ? `right: ${(1 - overlayState.anchor.x) * 100}%` : `left: ${overlayState.anchor.x * 100}%`};
									${placement.vertical === 'above' ? `bottom: ${(1 - overlayState.anchor.y) * 100}%` : `top: ${overlayState.anchor.y * 100}%`};
								`}
								onsubmit={(event) => {
									event.preventDefault();
									void submitDraft();
								}}
							>
								<div class="flex items-start gap-3">
									<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
										<MessageCircleMore class="h-4 w-4" />
									</div>
									<div class="min-w-0 flex-1">
										<p class="text-sm font-semibold text-slate-900">Add comment</p>
										<p class="mt-1 text-xs text-slate-500">Press Enter or OK to save.</p>
									</div>
								</div>

								<div class="mt-3 space-y-2">
									<input
										bind:this={commentInput}
										type="text"
										class="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
										bind:value={draftText}
										maxlength={MAX_COMMENT_LENGTH}
										placeholder="Write a comment…"
										disabled={isSubmittingComment}
									/>
									<div class="flex items-center justify-between gap-3 text-xs">
										<span class={`${draftText.trim().length === 0 ? 'text-slate-400' : 'text-slate-600'}`}>{draftText.length}/{MAX_COMMENT_LENGTH}</span>
										{#if commentError}
											<span class="text-right text-rose-600">{commentError}</span>
										{:else}
											<span class="text-slate-400">Esc or trash cancels</span>
										{/if}
									</div>
								</div>

								<div class="mt-3 flex items-center justify-end gap-2">
									<Button
										variant="ghost"
										size="sm"
										onclick={(event) => {
											event.preventDefault();
											closeDraft();
										}}
										disabled={isSubmittingComment}
									>
										<Trash2 class="h-4 w-4" />
									</Button>
									<Button size="sm" class="gap-1.5" type="submit" disabled={isSubmittingComment}>
										{#if isSubmittingComment}
											<LoaderCircle class="h-4 w-4 animate-spin" />
										{:else}
											<Check class="h-4 w-4" />
										{/if}
										OK
									</Button>
								</div>
							</form>
						{/if}
					</div>
				</div>
			</div>

			<div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
				<Button onclick={closeModal}>OK</Button>
			</div>
		</Panel>
	</div>
</div>
