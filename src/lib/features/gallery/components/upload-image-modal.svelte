<script lang="ts">
	import { AlertCircle, ImagePlus, LoaderCircle, Upload, X } from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Panel from '$lib/components/ui/panel.svelte';
	import { getConvexClient } from '$lib/convex/client';
	import {
		MAX_IMAGE_SIZE_LABEL,
	} from '$lib/features/gallery/gallery';
	import {
		createFailedUploadState,
		createUploadingState,
		getSelectedUploadFileResult,
		type UploadModalState,
		uploadGalleryImage,
		validateUploadSubmission,
	} from '$lib/features/gallery/upload-image';

	let {
		isOpen,
		onClose,
	} = $props<{
		isOpen: boolean;
		onClose: () => void;
	}>();

	let isSubmitting = $state(false);
	let selectedFile = $state<File | null>(null);
	let imageName = $state('');
	let formError = $state<string | null>(null);
	let uploadState = $state<UploadModalState | null>(null);
	let fileInput = $state<HTMLInputElement | null>(null);
	let wasOpen = $state(false);

	function resetForm() {
		selectedFile = null;
		imageName = '';
		formError = null;
		uploadState = null;

		if (fileInput) {
			fileInput.value = '';
		}
	}

	function closeModal() {
		if (isSubmitting) {
			return;
		}

		onClose();
		resetForm();
	}

	function openFilePicker() {
		fileInput?.click();
	}

	function handleFileSelection(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const result = getSelectedUploadFileResult(input.files?.[0] ?? null);

		selectedFile = result.selectedFile;
		imageName = result.imageName;
		formError = result.formError;

		if (result.shouldResetInput) {
			input.value = '';
		}
	}

	async function submitUpload() {
		const client = getConvexClient();
		const submissionError = validateUploadSubmission(selectedFile, imageName, client);

		if (submissionError || !client || !selectedFile) {
			formError = submissionError;
			return;
		}

		isSubmitting = true;
		formError = null;
		uploadState = createUploadingState(imageName, selectedFile.name);

		try {
			await uploadGalleryImage(client, selectedFile, imageName);

			onClose();
			resetForm();
		} catch (error) {
			const failedState = createFailedUploadState(imageName, selectedFile.name, error);

			formError = failedState.message;
			uploadState = failedState;
		} finally {
			isSubmitting = false;
		}
	}

	$effect(() => {
		if (!isOpen && wasOpen) {
			resetForm();
		}

		wasOpen = isOpen;
	});
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
		<button
			type="button"
			class="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
			aria-label="Close upload dialog"
			onclick={closeModal}
		></button>

		<div class="relative z-10 w-full max-w-xl" role="dialog" aria-modal="true" aria-labelledby="upload-dialog-title">
			<Panel class="p-6 sm:p-8">
				<div class="flex items-start justify-between gap-4">
					<div>
						<p class="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Add image</p>
						<h2 id="upload-dialog-title" class="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Upload a new gallery image</h2>
						<p class="mt-2 text-sm leading-6 text-slate-600">
							Choose an image from disk, confirm the image name, and publish it to the shared gallery.
						</p>
					</div>
					<Button variant="ghost" size="sm" onclick={closeModal} disabled={isSubmitting}>
						<X class="h-4 w-4" />
					</Button>
				</div>

				<div class="mt-6 space-y-5">
					<div class="space-y-3">
						<label class="text-sm font-medium text-slate-900" for="image-name">Image name</label>
						<input
							id="image-name"
							type="text"
							class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
							bind:value={imageName}
							disabled={isSubmitting}
							placeholder="team-photo.png"
						/>
					</div>

					<div class="space-y-3">
						<p class="text-sm font-medium text-slate-900">Image file</p>
						<input
							bind:this={fileInput}
							type="file"
							accept="image/*"
							class="hidden"
							onchange={handleFileSelection}
							disabled={isSubmitting}
						/>

						<div class="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5">
							<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
								<div class="space-y-1">
									<p class="text-sm font-medium text-slate-900">
										{selectedFile ? selectedFile.name : 'No image selected yet'}
									</p>
									<p class="text-sm text-slate-500">
										{selectedFile
											? `${selectedFile.type || 'image file'} · ${Math.max(selectedFile.size / 1024, 1).toFixed(0)} KB`
											: `Choose an image file up to ${MAX_IMAGE_SIZE_LABEL}.`}
									</p>
								</div>

								<Button variant="secondary" class="gap-2" onclick={openFilePicker} disabled={isSubmitting}>
									<Upload class="h-4 w-4" />
									Choose file
								</Button>
							</div>
						</div>
					</div>

					{#if uploadState}
						<div
							class={`rounded-2xl border px-4 py-3 ${uploadState.status === 'failed' ? 'border-rose-200 bg-rose-50 text-rose-900' : 'border-sky-200 bg-sky-50 text-sky-900'}`}
						>
							<div class="flex items-start gap-3">
								{#if uploadState.status === 'uploading'}
									<LoaderCircle class="mt-0.5 h-5 w-5 animate-spin" />
								{:else}
									<AlertCircle class="mt-0.5 h-5 w-5" />
								{/if}

								<div class="min-w-0 flex-1 space-y-1">
									<p class="truncate text-sm font-semibold">{uploadState.name}</p>
									<p class="truncate text-xs opacity-80">{uploadState.fileName}</p>
									<p class="text-sm">{uploadState.message}</p>
								</div>
							</div>
						</div>
					{/if}

					{#if formError}
						<div class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
							{formError}
						</div>
					{/if}

					<div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
						<Button variant="ghost" onclick={closeModal} disabled={isSubmitting}>Cancel</Button>
						<Button class="gap-2" onclick={submitUpload} disabled={isSubmitting}>
							<ImagePlus class="h-4 w-4" />
							{isSubmitting ? 'Uploading…' : 'Upload image'}
						</Button>
					</div>
				</div>
			</Panel>
		</div>
	</div>
{/if}
