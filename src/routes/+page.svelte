<script lang="ts">
    import Editor from "$lib/components/Editor.svelte";
    let content = $state('# rythspace\nsimple, beautiful notes.');
    function setContent(newContent: string) {
        content = newContent;
    }
</script>

<main>
<h1 class="text-2xl font-bold">.</h1>
<Editor content={content} setContent={setContent} />
</main>
