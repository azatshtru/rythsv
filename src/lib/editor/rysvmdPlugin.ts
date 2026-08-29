import { StateField } from "@codemirror/state";
import { EditorView, Decoration } from "@codemirror/view";
import { defineLanguageFacet, Language, LanguageSupport, syntaxTree } from "@codemirror/language";
import { parser as base } from '@lezer/markdown';
import {
    h1Decoration,
    h2Decoration,
    h3Decoration,
    italicDecoration,
    boldDecoration,
    strikethroughDecoration,
    codespanDecoration,
    inlineMathDecoration,
    underlineDecoration,
    grayDecoration,
} from './rysvmdDecorations.ts';
import { rysvmdInlineParser } from './rysvmdInlineParser.ts';
import { rysvmdNewlineParser } from './rysvmdNewlineParser.ts';

export function rysvmdLanguage() {
    const parser = base.configure([rysvmdInlineParser(), rysvmdNewlineParser()]);
    return new Language(defineLanguageFacet({}), parser, [], "rysvmd");
}

export function rysvmd() {
    return new LanguageSupport(rysvmdLanguage());
}

export function rysvmdHighlights() {
    const rysvmdHighlightField = StateField.define({
        create() {
            return Decoration.none;
        },

        update(decorations, tr) {
            decorations = decorations.map(tr.changes);
            if (tr.docChanged || tr.scrollIntoView) {
                const builder = {
                    ranges: [],
                    add(from, to, decoration) {
                        this.ranges.push(decoration.range(from, to));
                    },
                    finish() {
                        return this.ranges;
                    },
                };
                const tree = syntaxTree(tr.state);
                tree.iterate({
                    enter: (node) => {
                        switch(node.name) {
                            case 'ATXHeading1':
                                builder.add(node.from, node.to, h1Decoration);
                                break;

                            case 'ATXHeading2':
                                builder.add(node.from, node.to, h2Decoration);
                                break;

                            case 'ATXHeading3':
                                builder.add(node.from, node.to, h3Decoration);
                                break;

                            case 'Italic':
                                builder.add(node.from, node.to, italicDecoration);
                                break;

                            case 'Bold':
                                builder.add(node.from, node.to, boldDecoration);
                                break;

                            case 'Underline':
                                builder.add(node.from + 2, node.to - 2, underlineDecoration);
                                break;

                            case 'Dunder':
                                builder.add(node.from, node.to, grayDecoration);
                                break;

                            case 'Strikethrough':
                                if(node.from + 1 < node.to - 1) {
                                    builder.add(node.from + 1, node.to - 1, strikethroughDecoration);
                                }
                                break;

                            case 'Codespan':
                                builder.add(node.from, node.to, codespanDecoration);
                                break;

                            case 'InlineMath':
                                builder.add(node.from, node.to, inlineMathDecoration);
                                break;
                        }
                    }
                });

                const set = Decoration.set(builder.finish(), true);
                return set;
            }

            return decorations;
        },

        provide: (field) => EditorView.decorations.from(field)
    });

    return rysvmdHighlightField;
}
