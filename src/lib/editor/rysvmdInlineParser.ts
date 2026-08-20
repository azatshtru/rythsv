const asterisk: DelimiterType = { resolve: "Bold", mark: 'Asterisk' };
const underscore: DelimiterType = { resolve: "Italic", mark: 'Underscore' };
const tilde: DelimiterType = { resolve: "Strikethrough", mark: 'Tilde' };
const dunder: DelimiterType = { resolve: "Underline", mark: 'Dunder' };

export function rysvmdInlineParser() {
    const inlineEmphasis = {
        remove: ["Emphasis", "StrongEmphasis", "Comment", "ProcessingInstruction", "Autolink", "HTMLTag"],
        defineNodes: ["Bold", "Asterisk", "Italic", "Underscore", "Strikethrough", "Tilde", "Underline", "Dunder", "InlineMath", "Dollar"],
        parseInline: [{
            name: "rysvmdInline",
            parse(cx, next, pos) {
                if(next === '*'.codePointAt(0)) {
                    return cx.addDelimiter(asterisk, pos, pos + 1, true, true);
                } else if(next === '~'.codePointAt(0)) {
                    return cx.addDelimiter(tilde, pos, pos + 1, true, true);
                } else if(next === '_'.codePointAt(0)) {
                    let underscoreRun = 1;
                    let current = pos + 1;
                    while(current < cx.end
                        && cx.char(current) === '_'.codePointAt(0)
                        && underscoreRun < 4
                    ) {
                        underscoreRun += 1;
                        current += 1;
                    }
                    switch(underscoreRun) {
                        case 1: return cx.addDelimiter(underscore, pos, pos + 1, true, true);
                        case 2: return cx.addDelimiter(dunder, pos, pos + 2, true, true);
                        case 3: return -1;
                        default: return -1;
                    }
                } else if(next === '$'.codePointAt(0)) {
                    let current = pos;
                    while(current < cx.end) {
                        current += 1;
                        if(cx.char(current) === '$'.codePointAt(0)) {
                            return cx.addElement(
                                cx.elt("InlineMath", pos, current + 1, [
                                    cx.elt("Dollar", pos, pos + 1),
                                    cx.elt("Dollar", current, current + 1),
                                ]));
                        }
                    }
                    return -1;
                }
            }
        }]
    }
    return inlineEmphasis;
}
