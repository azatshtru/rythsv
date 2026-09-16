<script>
    const { symbol, value, type } = $props();
</script>

<span class="flex pl-1 pr-1 gap-0.75 py-0 items-stretch border border-slate-500 text-xs bg-gray-800 rounded-md">
    <span class="py-1 text-gray-200 flex items-center">{symbol}</span>
    {#if value.length > 0}
        <span
            class="
            bg-gray-900 text-gray-50 font-medium
            px-1.5
            border border-y-0 border-gray-500
            flex items-center
            "
        >{value}</span>
    {/if}
    <span class="text-gray-500 text-base flex items-center">{type}</span>
</span>
