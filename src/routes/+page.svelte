<script lang="ts">
	import NoteCard from "$lib/components/NoteCard.svelte";
	import CommandIcon from "$lib/icons/CommandIcon.svelte";
	import SlashIcon from "$lib/icons/SlashIcon.svelte";
	import PlusIcon from "$lib/icons/PlusIcon.svelte";

    const { data } = $props();

    function symbol(symbol: string, ...args: string[]) { 
        const [value, type] = args.length === 0 ? ['', '!'] : args;
        return { 
            symbol,
            value,
            type,
        };
    }
</script>

<nav class="flex flex-row mr-2.5 ml-1.5 mt-2.5 mb-3 gap-2.5 items-center-safe">
    <h1 class="text-2xl font-bold font-caveat grow">rythspace</h1>
    <button class="hover:bg-gray-50 rounded ring-gray-100 ring-2 p-1" aria-label="command">
        <CommandIcon width="24px" height="24px" class="fill-gray-400" />
    </button>
    <button class="hover:bg-gray-50 rounded ring-gray-100 ring-2 p-1" aria-label="filter">
        <SlashIcon width="24px" height="24px" class="fill-gray-400" />
    </button>
    <a href="/note" class="hover:bg-gray-50 rounded ring-gray-100 ring-2 p-1" aria-label="note">
        <PlusIcon width="24px" height="24px" class="fill-gray-400" />
    </a>
</nav>

<main>
    <div class="columns-1 xs:columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 m-2 gap-2"> 
        {#each data.all as [uuid, entry], i}
        <NoteCard content={`${entry.content}`} 
                symbols={[
                    symbol('alpha', 'Adwait', '$'),
                    symbol('bravo', '2', '#'),
                    symbol('charlie'),
                    symbol('delta', (Math.random() * 100).toString().slice(0, 6), '#'),
                    symbol('echo', '2025/11/25', '&'),
                    symbol('foxtrot')
                ]} 
                uuid={uuid} 
            />
        {/each}
    </div>
</main>
