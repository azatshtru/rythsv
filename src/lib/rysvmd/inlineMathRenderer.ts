import mathup from '$lib/mathup/mathup.min.js';

export function inlineMathRenderer(raw) {
    const spanClassList = [
        'align-baseline',
        'pointer-events-none',
        'select-none',
        'drag-none',
    ];

    const mathml = mathup(raw, {});

    const template = `
<span class="${spanClassList.join(' ')}">
${mathml.toString()}
</span>
`;
    return template;
}
