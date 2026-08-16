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
