<script lang="ts">
    import SymbolChip from "$lib/components/SymbolChip.svelte";

	const { content, symbols, uuid } = $props();
</script>

<div class="hover:scale-101 hover:rotate-1 hover:-translate-y-0.5 hover:translate-z-1 transition-transform ease-in-out duration-75 border rounded-xs overflow-hidden border-gray-200 outline outline-gray-300 p-4 h-fit break-inside-avoid mb-2 shadow">
    {@html content}
    <span class="font-bold text-xs text-gray-300 mb-3 block">...</span>
    <div class="flex gap-1 flex-wrap font-work-sans"> 
        {#each symbols as symbol}
            <SymbolChip
                symbol={symbol.symbol} 
                value={symbol.value} 
                type={symbol.type}
            />
        {/each}
    </div>
    <div class="mb-2 mt-3 w-full flex items-center gap-0 -translate-x-1">
        <a aria-label="open" href={`/${uuid}`}>
            <svg
                class="fill-slate-700"
                xmlns="http://www.w3.org/2000/svg"
                height="36px" viewBox="0 -960 960 960" width="36px"> 
                <path d="m256-240-56-56 384-384H240v-80h480v480h-80v-344L256-240Z"/>
            </svg>
        </a>
    </div>
    <p class="text-gray-300 text-xs break-all">#{uuid}</p>
</div>
