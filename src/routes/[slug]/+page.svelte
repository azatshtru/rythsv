<script lang="ts">
    const { data } = $props();
</script>

<svelte:head>
	<script>
		window.MathJax = {
			loader: { load: ['input/mml', 'output/chtml'] },
			options: {
				enableMenu: false
			},
		};
	</script>
	<script
		id="MathJax-script"
		async
		src="https://cdn.jsdelivr.net/npm/mathjax@4/tex-mml-chtml.js"
	></script>
</svelte:head>

<nav class="flex flex-row mr-2.5 ml-1.5 mt-2.5 mb-3 gap-2.5 items-center-safe">
    <h1 class="text-2xl font-bold font-caveat grow"><a href="/">rythspace</a></h1>
    <a href={`${data.uuid}/edit`} class="hover:bg-gray-50 rounded ring-gray-100 ring-2 p-1" aria-label="edit">
        <span class="size-6 text-lg/tight text-gray-500 inline-flex justify-center">e</span>
    </a>
</nav>

<main>
    <div class="px-2 py-1" style="--anchor-underline-stroke:1px;--anchor-underline-offset:4px;">
        {@html data.content}
    </div>
</main>
