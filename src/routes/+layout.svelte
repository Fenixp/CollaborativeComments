<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { auth } from '$lib/auth/state';

	const { children } = $props();

	onMount(() => {
		auth.init();
	});
</script>

<svelte:head>
	<title>Collaborative Comments</title>
	<meta
		name="description"
		content="Collaborative Comments offers a polished provider-backed sign-in flow with a lightweight authenticated shell."
	/>
</svelte:head>

{@render children()}
