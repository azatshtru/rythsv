const asterisk: DelimiterType = { resolve: "Bold", mark: 'Asterisk' };
const underscore: DelimiterType = { resolve: "Italic", mark: 'Underscore' };
const tilde: DelimiterType = { resolve: "Strikethrough", mark: 'Tilde' };
const dunder: DelimiterType = { resolve: "Underline", mark: 'Dunder' };
const bra: DelimiterType = { mark: 'Bra' };

function parseMath(cx, next, pos) {
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

function parseUnderscores(cx, next, pos) {
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
        default: return current;
    }
}

export function rysvmdInlineParser() {
    const inlineEmphasis = {
        remove: ["Emphasis", "StrongEmphasis", "Comment", "ProcessingInstruction", "Autolink", "HTMLTag", "Link"],
        defineNodes: [
            "Bold",
            "Asterisk",
            "Italic",
            "Underscore",
            "Strikethrough",
            "Tilde",
            "Underline",
            "Dunder",
            "InlineMath",
            "Dollar",
            "Bra",
            "Ket",
            "Branch"
        ],
        parseInline: [{
            name: "rysvmdInline",
            parse(cx, next, pos) {
                if(next === '*'.codePointAt(0)) {
                    return cx.addDelimiter(asterisk, pos, pos + 1, true, true);
                } else if(next === '~'.codePointAt(0)) {
                    return cx.addDelimiter(tilde, pos, pos + 1, true, true);
                } else if(next === '_'.codePointAt(0)) {
                    return parseUnderscores(cx, next, pos);
                } else if(next === '$'.codePointAt(0)) {
                    return parseMath(cx, next, pos);
                } else if(next === '['.codePointAt(0)) {
                    return cx.addDelimiter(bra, pos, pos + 1, true, false);
                } else if (next === ']'.codePointAt(0)) {
                    const open = cx.findOpeningDelimiter(bra);
                    if(open !== null) {
                        const start = cx.getDelimiterAt(open).from;
                        const elts = cx.takeContent(open);
                        return cx.addElement(cx.elt("Branch", start, pos + 1, elts));
                    }
                    return -1;
                }
            }
        }]
    }
    return inlineEmphasis;
}
