<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
	import '../app.css';
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
	<link
		href="https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=Lilex:ital,wght@0,100..700;1,100..700&family=Work+Sans:ital,wght@0,100..900;1,100..900&display=swap"
		rel="stylesheet"
	/>
	<title>rythspace</title>
	<meta name="description" content="simple, beautiful notes." />
</svelte:head>

{@render children()}

<style>
	@reference "tailwindcss";

	:global(body) {
		font-family: var(--font-lilex);
	}
</style>
