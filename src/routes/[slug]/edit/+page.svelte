<script lang="ts">
	import { enhance } from "$app/forms";
	import Editor from "$lib/components/Editor.svelte";
	import CheckIcon from "$lib/icons/CheckIcon.svelte";

    const { data } = $props();
    const formId = 'savedoc';
</script>

<nav class="flex flex-row mr-2.5 ml-1.5 mt-2.5 mb-3 gap-2.5 items-center-safe">
    <h1 class="text-2xl font-bold font-caveat grow">rythspace</h1>
    <noscript>
        <p class="text-xs text-gray-400">You have disabled JavaScript for this website. ryth will work reliably regardless of JavaScript.</p>
        <p class="text-xs text-gray-400">That said, enabling JS enables live-editing, which makes editing notes much smoother and fun ;)</p>
    </noscript>
    <form class="flex items-center-safe" id={formId} method="POST" use:enhance>
        <button class="hover:bg-gray-50 rounded ring-gray-100 ring-2 p-1" aria-label="done">
            <CheckIcon height="24px" width="24px" class="fill-gray-500" />
        </button>
    </form>
</nav>

<main>
    <Editor initialContent={data.content} name="content" form={formId} />
</main>
