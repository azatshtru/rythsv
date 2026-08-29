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

function parseCodespan(cx, next, start) {
    if (next != 96 /* '`' */ || (start && cx.char(start - 1) == 96)) return -1;
    let pos = start + 1;
    while (pos < cx.end && cx.char(pos) == 96) pos++;
    let size = pos - start,
    curSize = 0;
    for (; pos < cx.end; pos++) {
        if (cx.char(pos) == 96) {
            curSize++;
            if (curSize == size && cx.char(pos + 1) != 96)
                return cx.append(
                    cx.elt("Codespan", start, pos + 1, [
                        cx.elt("BacktickRun", start, start + size),
                        cx.elt("BacktickRun", pos + 1 - size, pos + 1),
                    ]),
                );
        } else {
            curSize = 0;
        }
    }
    return -1;
}

function rysvmdDelimiterResolver(cx) {
    return {
        cx,
        instructions: [],
        stack: [],
        makeDelimiter(delimiter, from, to, opens, closes) {
            return {
                delimiter,
                from,
                to,
                opens,
                closes
            };
        },
        addElement(elt) {
            this.instructions.push({ elt });
            return elt.to;
        },
        addAsterisk(from) {
            const last = this.stack.findLastIndex(p => p === '*');
            if(last > -1) {
                this.stack.length = last;
            } else {
                this.stack.push('*');
            }
            this.instructions.push(this.makeDelimiter(asterisk, from, from + 1, true, true));
            return from + 1;
        },
        addTilde(from) {
            const last = this.stack.findLastIndex(p => p === '~');
            if(last > -1) {
                this.stack.length = last;
            } else {
                this.stack.push('~');
            }
            this.instructions.push(this.makeDelimiter(tilde, from, from + 1, true, true));
            return from + 1;
        },
        u3Split(major) {
            const idx = this.instructions.findLastIndex(p => Object.hasOwn(p, 'isU3'));
            if(idx === -1) {
                return;
            }
            const [delim, antidelim] = major ? [dunder, underscore] : [underscore, dunder];
            const delta = major ? 2 : 1;
            const from = this.instructions[idx].from;
            this.instructions[idx] = this.makeDelimiter(delim, from, from + delta, true, true);
            this.instructions[idx + 1] = this.makeDelimiter(antidelim, from + delta, from + 3, true, true);
        },
        addU3(from) {
            const lastU3 = this.stack.findLastIndex(p => p === '___');
            const lastU1 = this.stack.findLastIndex(p => p === '_');
            const lastU2 = this.stack.findLastIndex(p => p === '__');
            const last = Math.max(lastU3, lastU1, lastU2);
            if(last > -1) {
                const run = this.stack[last].length;
                this.stack.length = last;
                switch(run) {
                    case 1:
                        this.instructions.push(this.makeDelimiter(underscore, from, from + 1, true, true));
                        break;
                    case 2:
                        this.instructions.push(this.makeDelimiter(dunder, from, from + 2, true, true));
                        break;
                    default:
                        this.u3Split(true);
                        this.instructions.push(this.makeDelimiter(underscore, from, from + 1, true, true));
                        this.instructions.push(this.makeDelimiter(dunder, from + 1, from + 3, true, true));
                        break;
                }
                return from + run;
            } else {
                this.stack.push('___');
                this.instructions.push({ isU3: true, from });
                this.instructions.push({ noop: true });
                return from + 3;
            }
        },
        addUnderscore(from) {
            const lastU3 = this.stack.findLastIndex(p => p === '___');
            const lastU1 = this.stack.findLastIndex(p => p === '_');
            if(lastU3 > -1) {
                this.u3Split(true);
                this.stack.length = lastU3 + 1;
                this.stack[lastU3] = '__';
            } else if(lastU1 > -1) {
                this.stack.length = lastU1;
            } else {
                this.stack.push('_');
            }
            this.instructions.push(this.makeDelimiter(underscore, from, from + 1, true, true));
            return from + 1;
        },
        addDunder(from) {
            const lastU3 = this.stack.findLastIndex(p => p === '___');
            const lastU2 = this.stack.findLastIndex(p => p === '__');
            if(lastU3 > -1) {
                this.u3Split(false);
                this.stack.length = lastU3 + 1;
                this.stack[lastU3] = '_';
            } else if(lastU2 > -1) {
                this.stack.length = lastU2;
            } else {
                this.stack.push('__');
            }
            this.instructions.push(this.makeDelimiter(dunder, from, from + 2, true, true));
            return from + 2;
        },
        resolve() {
            for(const instruction of this.instructions) {
                if(Object.hasOwn(instruction, 'elt')) {
                    this.cx.addElement(instruction.elt);
                } else if(Object.hasOwn(instruction, 'delimiter')) {
                    this.cx.addDelimiter(
                        instruction.delimiter,
                        instruction.from,
                        instruction.to,
                        instruction.opens,
                        instruction.closes
                    );
                }
            }
        },
    };
}

function resolveDelimiters(cx, slice, offset, ignore) {
    let i = offset;
    let j = 0;
    const resolver = rysvmdDelimiterResolver(cx);

    while(i < offset + slice.length) {
        if (j < ignore.length && ignore[j].from <= i && i < ignore[j].to) {
            i = resolver.addElement(ignore[j]);
            j += 1;
        }

        const c = slice.at(i - offset);
        if(c === '*') {
            i = resolver.addAsterisk(i);
            continue;
        } else if(c === '~') {
            i = resolver.addTilde(i);
            continue;
        } else if(c === '_') {
            let underscoreRun = 0;
            while(slice.at(i - offset + underscoreRun) === '_' && i < cx.end) {
                underscoreRun += 1;
            }

            switch(underscoreRun) {
                case 1:
                    i = resolver.addUnderscore(i);
                    break;
                case 2:
                    i = resolver.addDunder(i);
                    break;
                default:
                    i = resolver.addU3(i);
                    break;
            }
            
            continue;
        }
        i += 1;
    }

    resolver.resolve();
}

function closeUrl(cx, start) {
    let spaced = cx.char(start + 1) === 32;
    let pos = start + 1 + +!!spaced;
    let depth = 1;
    while(pos < cx.end) {
        const ch = cx.char(pos);
        if(ch === 32 && spaced && pos + 1 < cx.end && cx.char(pos + 1) === ')'.charCodeAt(0)) {
            return pos + 2;
        } else if(ch === 32) {
            return -1;
        }

        if(ch === '`'.charCodeAt(0)) {
            return -1;
        }

        if(cx.char(pos) === '('.charCodeAt(0)) {
            depth += 1;
        } else if(cx.char(pos) === ')'.charCodeAt(0)) {
            depth -= 1;
            if(depth === 0) {
                return pos + 1;
            }
        }
        pos += 1;
    }
    return -1;
}

function rysvmdInlineParserImpl(cx, next, pos) {
    if(next === '$'.codePointAt(0)) {
        return parseMath(cx, next, pos);
    } else if(next === '`'.codePointAt(0)) {
        return parseCodespan(cx, next, pos);
    } else if(next === '['.codePointAt(0)) {
        return cx.addDelimiter(bra, pos, pos + 1, true, false);
    } else if (next === ']'.codePointAt(0)) {
        const open = cx.findOpeningDelimiter(bra);
        if(open !== null) {
            const start = cx.getDelimiterAt(open).from;
            const elts = cx.takeContent(open);
            resolveDelimiters(cx, cx.slice(start + 1, pos), start + 1, elts);
            const branch = cx.elt("Branch", start, pos + 1, cx.takeContent(open));
            const url = cx.char(pos + 1) === '('.charCodeAt(0) ? closeUrl(cx, pos + 1) : -1;
            if(url > -1) {
                return cx.addElement(cx.elt("UrlBranch", start, url, [
                    cx.elt("Url", pos + 1, url, []),
                    branch,
                ]));
            } else {
                return cx.addElement(branch);
            }
        }
    }
    return -1;
}

export function rysvmdInlineParser() {
    const inlineEmphasis = {
        remove: ["Emphasis", "StrongEmphasis", "Comment", "ProcessingInstruction", "Autolink", "HTMLTag", "Link", "InlineCode"],
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
            "Codespan",
            "BacktickRun",
            "Bra",
            "Ket",
            "Branch",
            "UrlBranch",
            "Url",
        ],
        parseInline: [{
            name: "rysvmdInline",
            parse(cx, next, pos) {
                const r = rysvmdInlineParserImpl(cx, next, pos);
                if(pos + 1 >= cx.end || r >= cx.end) {
                    const elts = cx.takeContent(0);
                    resolveDelimiters(cx, cx.text, cx.offset, elts);
                }
                return r;
            }
        }]
    }
    return inlineEmphasis;
}
