export function rysvmdNewlineParser() {
    const newlineParser = {
        parseBlock: [{
            name: "rysvmdNewline",
            endLeaf(cx, line, leaf) {
                return true;
            },
        }],
    }
    return newlineParser;
}
