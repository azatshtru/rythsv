export const mathjaxTypeset = (node) => {
    if(window.MathJax && window.MathJax.typesetPromise) {
        const promise = window.MathJax.typesetPromise([node]);
    } else {
        console.log("MathJax is not loaded yet.");
    }
}
