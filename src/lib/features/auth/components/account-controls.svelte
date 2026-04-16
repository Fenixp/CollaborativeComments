<script lang="ts">
	import { auth } from '$lib/auth/state';
	import Button from '$lib/components/ui/button.svelte';
</script>

<div class="flex flex-wrap items-center gap-2">
	<Button href="/account" variant="secondary" size="sm">Account</Button>
	<Button variant="ghost" size="sm" onclick={() => auth.openAccount()}>Manage account</Button>
	<Button variant="secondary" size="sm" onclick={() => auth.signOut()}>Sign out</Button>
</div>
