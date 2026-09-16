import { WidgetType } from "@codemirror/view";
import mathup from '$lib/mathup/mathup.min.js';

export class InlineMathWidget extends WidgetType {
    constructor(readonly raw: string) { super(); }

    eq(other: InlineMathWidget) { return other.raw === this.raw; }
    ignoreEvent() { return false; }

    toDOM() {
        const span = document.createElement('span');
        span.classList.add(
            'align-baseline',
            'pointer-events-none',
            'select-none',
            'drag-none',
        );

        const mathml = mathup(this.raw, {});
        span.append(mathml.toDOM());
        MathJax.typesetPromise([span]);

        return span;
    }
}
