import { Decoration } from '@codemirror/view';
import { ArrowSvgWidget } from './rysvmdAnchorArrowWidget.ts';

export const h1Decoration = Decoration.mark({
    class: 'font-bold text-3xl',
    attributes: { 'style': '--anchor-underline-stroke:3px;--anchor-underline-offset:7px' },
});

export const h2Decoration = Decoration.mark({
    class: 'font-bold text-2xl',
    attributes: { 'style': '--anchor-underline-stroke:2px;--anchor-underline-offset:6px' },
});

export const h3Decoration = Decoration.mark({
    class: 'font-bold text-xl',
    attributes: { 'style': '--anchor-underline-stroke:1px;--anchor-underline-offset:5px' },
});

export const italicDecoration = Decoration.mark({
    class: 'italic',
    tagName: 'em',
});

export const boldDecoration = Decoration.mark({
    class: 'font-bold',
    tagName: 'strong',
});

export const underlineDecoration = Decoration.mark({
    class: 'underline decoration-2',
});

export const strikethroughDecoration = Decoration.mark({
    class: 'line-through decoration-2 decoration-neutral-700 text-neutral-400',
    tagName: 's',
});

export const codespanDecoration = Decoration.mark({
    class: 'font-lilex bg-gray-200 rounded-xs border-gray-300 border text-[0.875em]',
    tagName: 'code',
});

export const inlineMathDecoration = Decoration.mark({
    class: 'font-eb-garamond bg-mauve-400 rounded-xs border-mauve-500 border'
});

export const grayDecoration = Decoration.mark({
    class: 'text-gray-400',
});

export const anchorDecoration = Decoration.mark({
    class: 'text-blue-800 break-all underline underline-offset-[var(--anchor-underline-offset)] decoration-(length:--anchor-underline-stroke)',
    tagName: 'a',
});

export const anchorArrowDecoration = Decoration.widget({
    widget: new ArrowSvgWidget(),
    side: 1,
});

export const decorationSimple = Decoration.mark({
    class: 'text-black',
});
