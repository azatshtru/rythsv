export function rysvmdNewlineParser() {
    const newlineParser = {
        remove: ["ATXHeading4", "ATXHeading5", "ATXHeading6", "SetextHeading1", "SetextHeading2"],
        parseBlock: [{
            name: "rysvmdNewline",
            endLeaf(cx, line, leaf) {
                return true;
            },
        }],
    }
    return newlineParser;
}
