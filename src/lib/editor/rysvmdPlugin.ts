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
    anchorDecoration,
    anchorArrowDecoration,
    decorationSimple,
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

function intersects(a1, b1, a2, b2) {
    return a1 <= b2 && a2 <= b1;
}

export function rysvmdHighlights() {
    const rysvmdHighlightField = StateField.define({
        create() {
            return Decoration.none;
        },

        update(decorations, tr) {
            decorations = decorations.map(tr.changes);
            if (tr.docChanged || tr.isUserEvent || tr.scrollIntoView) {
                const builder = {
                    ranges: [],
                    add(from, to, decoration) {
                        this.ranges.push(decoration.range(from, to));
                    },
                    addWidget(decoration, to) {
                        this.ranges.push(decoration.range(to));
                    },
                    finish() {
                        return this.ranges;
                    },
                };
                const decoration1 = (decoration, a, b) => {
                    const ranges = tr.state.selection.ranges;
                    const hide = ranges.every(range => !intersects(a, b, range.from, range.to));
                    return hide ? Decoration.replace({}) : decoration;
                }
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
                                if(node.from + 2 < node.to - 2) {
                                    builder.add(node.from + 2, node.to - 2, underlineDecoration);
                                }
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

                            case 'Anchor':
                                const branch = node.node.firstChild;
                                const url = node.node.lastChild;
                                builder.add(node.from, node.to, anchorDecoration);
                                builder.addWidget(anchorArrowDecoration, node.to);
                                break;

                            case 'Url':
                                builder.add(node.from, node.to, grayDecoration);
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
