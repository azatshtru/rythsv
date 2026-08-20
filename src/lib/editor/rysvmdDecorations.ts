import { Decoration } from '@codemirror/view';

export const h1Decoration = Decoration.mark({
    class: 'font-bold text-3xl'
});

export const h2Decoration = Decoration.mark({
    class: 'font-bold text-2xl'
});

export const h3Decoration = Decoration.mark({
    class: 'font-bold text-xl'
});

export const italicDecoration = Decoration.mark({
    class: 'italic'
});

export const boldDecoration = Decoration.mark({
    class: 'font-bold'
});

export const underlineDecoration = Decoration.mark({
    class: 'underline'
});

export const strikethroughDecoration = Decoration.mark({
    class: 'line-through decoration-2'
});

export const codespanDecoration = Decoration.mark({
    class: 'font-lilex text-sm bg-gray-200 rounded-xs border-gray-300 border'
});

export const inlineMathDecoration = Decoration.mark({
    class: 'font-eb-garamond bg-mauve-400 rounded-xs border-mauve-500 border'
});
