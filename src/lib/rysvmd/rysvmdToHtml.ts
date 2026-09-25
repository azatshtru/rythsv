import { anchorArrow } from './anchorArrow.ts';
import { inlineMathRenderer } from './inlineMathRenderer.ts';

function* splitNewline(s) {
    let start = 0;
    let match;
    const regex = /\r?\n/g;

    while((match = regex.exec(s)) !== null) {
        yield s.slice(start, match.index);
        start = regex.lastIndex;
    }

    if(start <= s.length) {
        yield s.slice(start);
    }
}

function inlineStack() {
    return {
        stack: [],
        tokens: [],
        pushCollapse(delimChar, delimKind, collapse) {
            const last = this.stack.findLastIndex(ch => ch === delimChar);
            if(last > -1) {
                this.stack.length = last;
                const tokenIndex = this.tokens.findLastIndex(token => token.kind === delimKind);
                this.tokens[tokenIndex] = { kind: 'Open'+collapse };
                this.tokens.push({ kind: 'Close'+collapse });
            } else {
                this.tokens.push({ kind: delimKind });
                this.stack.push(delimChar);
            }
        },
        pushAsterisk() {
            this.pushCollapse('*', 'Asterisk', 'Bold');
        },
        pushTilde() {
            this.pushCollapse('~', 'Tilde', 'Strikethrough');
        },
        splitU3(major, minor) {
            const tokenIndex = this.tokens.findLastIndex(token => token.kind === 'U3');
            this.tokens[tokenIndex] = { kind: major };
            this.tokens[tokenIndex + 1] = { kind: minor };
        },
        pushUnderscore() {
            const lastU3 = this.stack.findLastIndex(ch => ch === '___');
            if(lastU3 > -1) {
                this.stack[lastU3] = '__';
                this.stack.length = lastU3 + 1;
                this.splitU3('Dunder', 'OpenItalic');
                this.tokens.push({ kind: 'CloseItalic' });
            } else {
                this.pushCollapse('_', 'Underscore', 'Italic');
            }
        },
        pushDunder() {
            const lastU3 = this.stack.findLastIndex(ch => ch === '___');
            if(lastU3 > -1) {
                this.stack[lastU3] = '_';
                this.stack.length = lastU3 + 1;
                this.splitU3('Underscore', 'OpenUnderline');
                this.tokens.push({ kind: 'CloseUnderline' });
            } else {
                this.pushCollapse('__', 'Dunder', 'Underline');
            }
        },
        pushU3() {
            const lastU3 = this.stack.findLastIndex(ch => ch === '___');
            if(lastU3 > -1) {
                this.stack.length = lastU3;
                this.splitU3("OpenUnderline", "OpenItalic");
                this.tokens.push({ kind: 'CloseItalic' });
                this.tokens.push({ kind: 'CloseUnderline' });
            } else {
                this.stack.push('___');
                this.tokens.push({ kind: 'U3' });
                this.tokens.push({ kind: 'Noop' });
            }
        },
        pushText(text) {
            if(text.length > 0) {
                this.tokens.push({ kind: "Text", text })
            }
        },
        pushToken(token) {
            this.tokens.push(token);
        }
    }
}

function resolveUrl(line) {
    if(line.length === 0) {
        return null;
    }
    if(line.at(0) !== '(') {
        return null;
    }
    let i = 1;
    if(line.at(i) === ' ') {
        const space = line.indexOf(' ', i + 1);
        if(space > -1 && space + 1 < line.length) {
            return line.at(space + 1) === ')' ? space + 1 : null;
        }
    }
    let depth = 1;
    while(i < line.length) {
        if(line.at(i) === ' ' || line.at(i) === '`') {
            break;
        }
        if(line.at(i) === '(') {
            depth += 1;
        } else if(line.at(i) === ')') {
            depth -= 1;
            if(depth === 0) {
                return i;
            }
        }
        i += 1;
    }
    return null;
}

function parseInlinePrime(line) {
    let i = 0;
    let j = 0;
    let tokens = [];
    let depth = 0;
    while(i < line.length) {
        const c = line.at(i);
        if(c === '`') {
            const j = line.indexOf('`', i + 1);
            if(j > -1) {
                tokens.push({ kind: 'Codespan', text: line.slice(i, j + 1), from: i, to: j + 1 });
                i = j;
            }
        } else if (c === '$') {
            const j = line.indexOf('$', i + 1);
            if(j > -1) {
                tokens.push({ kind: 'InlineMath', text: line.slice(i, j + 1), from: i, to: j + 1 });
                i = j;
            }
        } else if(c === '[') {
            depth += 1;
            tokens.push({ kind: 'Bra', from: i })
        } else if(c === ']') {
            if(depth > 0) {
                depth -= 1;
                const last = tokens.findLastIndex(c => c.kind === 'Bra');
                const from = tokens[last].from;
                const children = parseInline(line.slice(from + 1, i), tokens.slice(last + 1), from + 1);
                tokens.length = last;
                const url = resolveUrl(line.slice(i + 1));
                if(url !== null) {
                    tokens.push({ kind: 'Url', from, to: i + 2 + url, children, url: line.slice(i + 2, i + 1 + url).trim() });
                } else {
                    tokens.push({ kind: 'Branch', from, to: i + 1, children });
                }
            }
        }
        i += 1;
    }
    tokens = parseInline(line, tokens, 0);
    return tokens;
}

function parseInline(line, ignore, offset) {
    let i = 0;
    let j = 0;
    let skip = 0;
    const stack = inlineStack();
    while(i < line.length) {
        if(skip < ignore.length && ignore[skip].from <= i + offset && i + offset < ignore[skip].to) {
            stack.pushText(line.slice(j, i));
            stack.pushToken(ignore[skip]);
            i = ignore[skip].to - offset;
            j = i;
            skip += 1;
            continue;
        }
        const c = line.at(i);
        if(c === '*') {
            stack.pushText(line.slice(j, i));
            stack.pushAsterisk();
            j = i + 1;
        } else if(c === '_') {
            stack.pushText(line.slice(j, i));
            let run = 1;
            while(run < 3 && line.at(i + run) === '_') run += 1;
            i += run;
            j = i;
            switch(run) {
                case 1:
                    stack.pushUnderscore();
                    break;
                case 2:
                    stack.pushDunder();
                    break;
                default:
                    stack.pushU3();
                    break;
            }
            continue;
        } else if(c === '~') {
            stack.pushText(line.slice(j, i));
            stack.pushTilde();
            j = i + 1;
        }
        i += 1;
    }
    if(j != i) {
        stack.pushText(line.slice(j, i));
    }
    return stack.tokens;
}

function transformInlinePrime(tokens) {
    let result = '';
    for(const token of tokens) {
        switch(token.kind) {
            case 'Noop': break;
            case 'Asterisk':
                result += '*';
                break;
            case 'Underscore':
                result += '_';
                break;
            case 'Dunder':
                result += '__';
                break;
            case 'U3':
                result += '___';
                break;
            case 'Tilde':
                result += '~';
                break;
            case 'OpenUnderline':
                result += '<span class="underline decoration-2">'
                break;
            case 'CloseUnderline':
                result += '</span>';
                break;
            case 'OpenStrikethrough':
                result += '<s class="line-through decoration-2 decoration-neutral-700 text-neutral-400">'
                break;
            case 'CloseStrikethrough':
                result += '</s>';
                break;
            case 'OpenBold':
                result += '<strong class="font-bold">';
                break;
            case 'CloseBold':
                result += '</strong>';
                break;
            case 'OpenItalic':
                result += '<em class="italic">';
                break;
            case 'CloseItalic':
                result += '</em>';
                break;
            case 'Text':
                result += token.text;
                break;
            case 'Codespan':
                result += `<code class="font-lilex bg-gray-200 rounded-xs border-gray-300 border text-[0.875em] px-px">${token.text.slice(1, -1)}</code>`;
                break;
            case 'InlineMath':
                const inlineMathRender = inlineMathRenderer(token.text.slice(1, -1));
                result += inlineMathRender;
                break;
            case 'Branch':
                result += `<span>[${transformInlinePrime(token.children)}]</span>`;
                break;
            case 'Url':
                const anchorDecoration = "text-blue-800 break-all underline underline-offset-(--anchor-underline-offset) decoration-(length:--anchor-underline-stroke)";
                const arrow = anchorArrow();
                result += `<a class="${anchorDecoration}" href=${token.url}>${transformInlinePrime(token.children)}</a>${arrow}`;
                break;
            default:
                result += `<span class="text-red-500">${token.kind}</span>`;
                break;
        }
    }
    return result;
}

function transformInline(line) {
    return transformInlinePrime(parseInlinePrime(line));
}

function heading(line) {
    let i = 0;
    while(line.at(i) === '#' && i < 3) i += 1;
    if(line.at(i) !== ' ') return null;
    const utility = `text-${i === 3 ? '' : 4 - i}xl font-bold`;
    const style = 
        i === 1 ? '--anchor-underline-stroke:3px;--anchor-underline-offset:7px;' 
        : i === 2 ? '--anchor-underline-stroke:2px;--anchor-underline-offset:6px'
        : '--anchor-underline-stroke:1px;--anchor-underline-offset:5px';
    return `<h${i} style="${style}" class="${utility}">${transformInline(line.slice(i + 1))}</h${i}>`;
}

function paragraph(line) {
    return line.length > 0 ? `<p class="text-base">${transformInline(line)}</p>` : null;
}

function transform(plaintext) {
    const lines = splitNewline(plaintext);
    const transformer = {
        buffer: [],
        feed(line) {
            return heading(line) ?? paragraph(line) ?? null;
        },
    };
    const html = [];
    for(const line of lines) {
        const done = transformer.feed(line);
        if(done !== null) {
            html.push(done);
        }
    }
    return html;
}

export function toHTML(plaintext) {
    return transform(plaintext).join('');
}

function headingPreview(line) {
    let i = 0;
    while(line.at(i) === '#' && i < 3) i += 1;
    if(line.at(i) !== ' ') return null;
    const utility = `${i === 1 ? 'text-lg/tight' : (i === 2 ? 'text-base/tight' : 'text-sm/tight')} tracking-tight ${i <= 2 ? 'mb-1' : 'mb-0.5'} font-semibold line-clamp-6`;
    return `<h${i} class="${utility}">${transformInline(line.slice(i + 1))}</h${i}>`;
}

function paragraphPreview(line) {
    return line.length > 0 ? `<p class="text-sm/tight tracking-tight line-clamp-8">${transformInline(line)}</p>` : null;
}

function preview(plaintext, threshold = 1) {
    const lines = splitNewline(plaintext);
    const transformer = {
        buffer: [],
        feed(line) {
            return headingPreview(line) ?? paragraphPreview(line) ?? null;
        },
    };
    const html = [];
    for(const line of lines) {
        const done = transformer.feed(line);
        if(done !== null) {
            html.push(done);
        }
        if(html.length >= threshold) {
            break;
        }
    }
    return html;

}

export function toHTMLPreview(plaintext, threshold) {
    return `<div style="--anchor-arrow-display:none;--anchor-underline-stroke:1px;">${preview(plaintext, threshold).join('')}</div>`;
}
