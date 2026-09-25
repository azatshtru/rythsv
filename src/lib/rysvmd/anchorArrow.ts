export function anchorArrow() {
    const spanClassList = [
        "[display:var(--anchor-arrow-display,inline-block)]",
        "w-[0.85ch]",
        "h-[1em]",
        "translate-y-[calc(var(--anchor-underline-offset)+var(--anchor-underline-stroke))]",
        "-translate-x-[calc(var(--anchor-underline-stroke)/2)]"
    ];

    const svgNamespace = "http://www.w3.org/2000/svg";
    const viewBox = '0 0 100 100';
    const svgClassList = [
        "w-[1em]",
        "h-[1em]",
    ];

    const pathd = "M 0 110 L 0 100 L 50 50 M 50 90 L 50 50 L 10 50";
    const pathClassList = [
        "fill-none",
        "stroke-blue-800",
        "stroke-(length:--anchor-underline-stroke)",
        "[vector-effect:non-scaling-stroke]",
    ];

    const template = 
`<span class="${spanClassList.join(' ')}">
<svg xmlns="${svgNamespace}" viewBox="${viewBox}" class="${svgClassList.join(' ')}">
<path d="${pathd}" class="${pathClassList.join(' ')}" />
</svg>
</span>`;

    return template;
}
