import { StateField, RangeSetBuilder } from "@codemirror/state";
import { EditorView, Decoration } from "@codemirror/view";
import { LRLanguage, LanguageSupport, syntaxTree } from "@codemirror/language";
import { parser } from './rysvmdParser.js';
import { h1Decoration, h2Decoration, h3Decoration } from './rysvmdDecorations.ts';

export const rysvmdLanguage = LRLanguage.define({
    name: 'rysvmd',
    parser: parser.configure({})
})

export function rysvmd() {
    return new LanguageSupport(rysvmdLanguage);
}

export function rysvmdHighlights() {
    const rysvmdHighlightField = StateField.define({
        create() {
            return Decoration.none;
        },

        update(decorations, tr) {
            decorations = decorations.map(tr.changes);
            if (tr.docChanged || tr.scrollIntoView) {
                const builder = new RangeSetBuilder<Decoration>();
                const tree = syntaxTree(tr.state);
                tree.iterate({
                    enter: (node) => {
                        switch(node.name) {
                            case 'Title':
                                builder.add(node.from, node.to, h1Decoration);
                                break;

                            case 'Heading':
                                builder.add(node.from, node.to, h2Decoration);
                                break;

                            case 'Subheading':
                                builder.add(node.from, node.to, h3Decoration);
                                break;
                        }
                    }
                });

                return builder.finish();
            }

            return decorations;
        },

        provide: (field) => EditorView.decorations.from(field)
    });

    return rysvmdHighlightField;
}
