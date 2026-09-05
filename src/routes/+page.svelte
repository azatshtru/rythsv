<script lang="ts">
    import Editor from "$lib/components/Editor.svelte";
    import { mementoMori } from "$lib/copywriting/samples";
    let content = $state(mementoMori);
    function setContent(newContent: string) {
        content = newContent;
    }
</script>

<main>
<h1 class="text-2xl font-bold px-2 py-2 font-caveat">rythspace</h1>
<Editor content={content} setContent={setContent} />
</main>
