import { WidgetType } from "@codemirror/view";

export class ArrowSvgWidget extends WidgetType {
    constructor() { super(); }

    eq(other) { return true; }
    ignoreEvent() { return false; }

    toDOM() {
        const span = document.createElement('span');
        span.classList.add(
            "relative",
            "inline",
            "align-baseline",
            "mr-[0.85ch]",
        );

        const svgNamespace = "http://www.w3.org/2000/svg";

        const svg = document.createElementNS(svgNamespace, 'svg');
        svg.setAttribute('viewBox', "0 0 100 100");
        svg.classList.add(
            "absolute",
            "w-[1em]",
            "h-[1em]",
            "left-0",
            "bottom-0",
            "-translate-x-[0.06em]",
        );

        const path = document.createElementNS(svgNamespace, 'path');
        path.setAttribute('d', "M 0 101 L 0 100 L 50 50 M 50 90 L 50 50 L 10 50");
        path.classList.add(
            "stroke-linecap-butt",
            "fill-none",
            "stroke-blue-800",
            "stroke-[0.09em]",
            "[vector-effect:non-scaling-stroke]",
        );

        svg.append(path);
        span.append(svg);
        return span;
    }
}
