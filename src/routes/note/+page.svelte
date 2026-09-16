<script lang="ts">
    import Editor from "$lib/components/Editor.svelte";
	import CheckIcon from "$lib/icons/CheckIcon.svelte";
    let content = $state("");
    let editing = $state(false);
    function toggleEditing() { 
        editing = !editing;
    }
    function setContent(newContent: string) {
        content = newContent;
    }
</script>

<nav class="flex flex-row mr-2.5 ml-1.5 mt-2.5 mb-3 gap-2.5 items-center-safe">
    <h1 class="text-2xl font-bold font-caveat grow">rythspace</h1>
    {#if editing}
        <button class="hover:bg-gray-50 rounded ring-gray-100 ring-2 p-1" onclick={toggleEditing} aria-label="done">
            <CheckIcon height="24px" width="24px" class="fill-gray-500" />
        </button>
    {:else}
        <button class="hover:bg-gray-50 rounded ring-gray-100 ring-2 p-1" onclick={toggleEditing} aria-label="edit">
            <span class="size-6 inline-block text-lg/tight text-gray-500">e</span>
        </button>
    {/if}
</nav>

<main>
    {#if editing}
        <Editor content={content} setContent={setContent} />
    {:else}
        {@html content}
    {/if}
</main>
