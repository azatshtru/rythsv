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

function rysvmdInlineResolver(cx) {
    return {
        cx,
        instructions: [],
        stack: [],
        addDelimiter(ch, delimiter, from, to, opens, closes) {
            const last = this.stack.findLastIndex(d => d.ch === ch);
            this.instructions.push({
                delimiter, 
                from,
                to,
                opens,
                closes
            });
            if(last > -1) {
                this.stack.length = last;
            } else {
                this.stack.push({ ch })
            }
        },
        addElement(elt) {
            this.instructions.push({ elt });
        },
        addU3(from) {
            this.instructions.push({ ch: '___', from });
            this.stack.push({ ch: '___' });
            this.addNoop();
        },
        findLastU3() {
            const stackLast = this.stack.findLastIndex(d => d.ch === '___');
            if(stackLast === -1) {
                return null;
            }
            return {
                idx: this.instructions.findLastIndex(d => Object.hasOwn(d, 'ch') && d.ch === '___'),
                stack: stackLast
            };
        },
        u1NearestOrU2() {
            const u1 = this.stack.findLastIndex(d => d.ch === '_');
            const u2 = this.stack.findLastIndex(d => d.ch === '__');
            const last = Math.max(u1, u2);
            if(last > -1) {
                return this.stack[last].ch.length;
            }
            return null;
        },
        addNoop() {
            this.instructions.push({ noop: true });
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
        makeDelimiter(delimiter, from, to, opens, closes) {
            return {
                delimiter, from, to, opens, closes
            };
        },
    }
}

function resolveDelimiters(cx, slice, offset, ignore) {
    let i = offset;
    let j = 0;
    const resolver = rysvmdInlineResolver(cx);

    while(i < offset + slice.length) {
        if (j < ignore.length && ignore[j].from <= i && i < ignore[j].to) {
            i = ignore[j].to;
            resolver.addElement(ignore[j]);
            j += 1;
        }

        const c = slice.at(i - offset);
        if(c === '*') {
            resolver.addDelimiter('*', asterisk, i, i + 1, true, true);
        } else if(c === '~') {
            resolver.addDelimiter('~', tilde, i, i + 1, true, true);
        } else if(c === '_') {
            let underscoreRun = 0;
            while(slice.at(i - offset + underscoreRun) === '_' && i < cx.end) {
                underscoreRun += 1;
            }
            
            let u3 = resolver.findLastU3();
            if(u3 === null) {
                switch(underscoreRun) {
                    case 1:
                        resolver.addDelimiter('_', underscore, i, i + 1, true, true);
                        break; 
                    case 2:
                        resolver.addDelimiter('__', dunder, i, i + 2, true, true);
                        break; 
                    default:
                        const nearest = resolver.u1NearestOrU2();
                        if(nearest === null) {
                            resolver.addU3(i + underscoreRun - 3);
                        } else {
                            resolver.addDelimiter(
                                '_'.repeat(nearest),
                                nearest === 1 ? underscore : dunder,
                                i, i + nearest,
                                true, true
                            );
                            underscoreRun = nearest;
                        }
                        break;
                }
            } else {
                const from = resolver.instructions[u3.idx].from;
                switch(underscoreRun) {
                    case 1:
                        resolver.instructions[u3.idx] = resolver.makeDelimiter(dunder, from, from + 2, true, true);
                        resolver.instructions[u3.idx + 1] = resolver.makeDelimiter(underscore, from, from + 1, true, true);
                        resolver.stack[u3.stack] = { ch: '__' };
                        resolver.stack.length = u3.stack + 1;
                        resolver.stack.push({ ch: '_' });
                        resolver.addDelimiter('_', underscore, i, i + 1, true, true);
                        break; 
                    case 2:
                        resolver.instructions[u3.idx] = resolver.makeDelimiter(underscore, from, from + 1, true, true);
                        resolver.instructions[u3.idx + 1] = resolver.makeDelimiter(dunder, from, from + 2, true, true);
                        resolver.stack[u3.stack] = { ch: '_' };
                        resolver.stack.length = u3.stack + 1;
                        resolver.stack.push({ ch: '__' });
                        resolver.addDelimiter('__', dunder, i, i + 2, true, true);
                        break; 
                    default:
                        resolver.instructions[u3.idx] = resolver.makeDelimiter(dunder, from, from + 2, true, true);
                        resolver.instructions[u3.idx + 1] = resolver.makeDelimiter(underscore, from, from + 1, true, true);
                        resolver.stack.length = u3.stack;
                        resolver.stack.push({ ch: '__' });
                        resolver.stack.push({ ch: '_' });
                        resolver.addDelimiter('_', underscore, i, i + 1, true, true);
                        resolver.addDelimiter('__', dunder, i + 1, i + 3, true, true);
                        underscoreRun = 3;
                        break;
                }
            }

            i += underscoreRun;
            continue;
        }
        i += 1;
    }

    resolver.resolve();
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
                if(next === '$'.codePointAt(0)) {
                    return parseMath(cx, next, pos);
                } else if(next === '['.codePointAt(0)) {
                    return cx.addDelimiter(bra, pos, pos + 1, true, false);
                } else if (next === ']'.codePointAt(0)) {
                    const open = cx.findOpeningDelimiter(bra);
                    if(open !== null) {
                        const start = cx.getDelimiterAt(open).from;
                        const elts = cx.takeContent(open);
                        resolveDelimiters(cx, cx.slice(start + 1, pos), start + 1, elts);
                        return cx.addElement(cx.elt("Branch", start, pos + 1, cx.takeContent(open)));
                    }
                    return -1;
                } else if(pos + 1 === cx.end) {
                    const elts = cx.takeContent(0);
                    resolveDelimiters(cx, cx.text, cx.offset, elts);
                }
            }
        }]
    }
    return inlineEmphasis;
}
