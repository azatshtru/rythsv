<script lang="ts">
    const { data } = $props();
</script>

<nav class="flex flex-row mr-2.5 ml-1.5 mt-2.5 mb-3 gap-2.5 items-center-safe">
    <h1 class="text-2xl font-bold font-caveat grow"><a href="/">rythspace</a></h1>
    <a href={`${data.uuid}/edit`} class="hover:bg-gray-50 rounded ring-gray-100 ring-2 p-1" aria-label="edit">
        <span class="size-6 text-lg/tight text-gray-500 inline-flex justify-center">e</span>
    </a>
</nav>

<main>
    <div class="px-2 py-1">
        {@html data.content}
    </div>
</main>
