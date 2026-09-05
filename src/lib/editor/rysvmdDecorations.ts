import { Decoration } from '@codemirror/view';
import { ArrowSvgWidget } from './rysvmdAnchorArrowWidget.ts';
import { InlineMathWidget } from './rysvmdInlineMathWidget.ts';

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

export const inlineMathDecoration = (raw) => Decoration.widget({
    widget: new InlineMathWidget(raw),
    side: 1,
});

export const inlineMathEditing = Decoration.mark({
    class: 'text-[0.875em] border rounded-xs border-slate-200',
})

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

export const noDecoration = Decoration.mark({
    class: '',
});
