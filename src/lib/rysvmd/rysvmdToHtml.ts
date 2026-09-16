function inlineStack() {
    return {
        stack: [],
        pushAsterisk(i) {
            const last = this.stack.findLastIndex(token => token.kind === ch);
            if(last > -1) {
                const from = this.stack[last].from;
                const children = this.stack.slice(last);
                this.stack.length = last;
                this.stack.push({ kind: 'Bold', from, to: i, children });
            } else {
                this.stack.push({ kind: '*' });
            }
        },
        pushText(text) {
            stack.push({ kind: text })
        }
    }
}

function parseInline(line) {
    let i = 0;
    let j = 0;
    const stack = inlineStack();
    while(i < line.length) {
        const c = line.at(i);
        if(c === '*') {
            stack.pushText(line.slice(j, i));
            stack.pushAsterisk(i);
            j = i;
        }
        i += 1;
    }
}

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

function parse(plaintext) {
    
}

function preview(plaintext) {
    const it = splitNewline(plaintext);
}

export function toHTML(plaintext) {
    const tokens = parse(plaintext);
}

export function toHTMLPreview(plaintext) {
    const tokens = parse(plaintext);
    console.log(tokens);
}
