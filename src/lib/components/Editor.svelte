<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { EditorView } from '@codemirror/view';
	import '$lib/mathup/mathup.css';

	const { initialContent, name, form } = $props();

	let content = $state(initialContent);

	let view: EditorView;
	let editor: HTMLDivElement;
	let textarea: HTMLTextAreaElement;

	onMount(async () => {
		const { EditorState } = await import('@codemirror/state');
		const { EditorView, keymap } = await import('@codemirror/view');
		const { defaultKeymap } = await import('@codemirror/commands');
		const { rysvmd, rysvmdHighlights } = await import('$lib/editor/rysvmdPlugin');

		let state = EditorState.create({
			doc: content,
			extensions: [
				rysvmd(),
				rysvmdHighlights(),
				keymap.of(defaultKeymap),
				EditorView.lineWrapping,
				EditorView.updateListener.of((update) => {
					content = update.state.doc.toString();
				})
			]
		});

		view = new EditorView({
			state,
			parent: editor
		});

		const [anchor, head] = textarea ? [textarea.selectionStart, textarea.selectionEnd] : [0, 0];

		view.dispatch({
			selection: { anchor, head },
			scrollIntoView: true
		});

		const textareaIsFocused = document.activeElement === textarea;

		textarea.hidden = true;

		if (textareaIsFocused) {
			view.focus();
		}
	});

	onDestroy(() => {
		if (view) {
			view.destroy();
		}
	});
</script>

<svelte:head>
	<script>
		window.MathJax = {
			loader: { load: ['input/mml', 'output/chtml'] },
			options: {
				enableMenu: false
			}
		};
	</script>
	<script
		id="MathJax-script"
		async
		src="https://cdn.jsdelivr.net/npm/mathjax@4/tex-mml-chtml.js"
	></script>
</svelte:head>

<textarea
	bind:this={textarea}
	bind:value={content}
    name={name}
    form={form}
	class="w-full h-fit field-sizing-content p-1.5 resize-none outline-0 border-0"></textarea>
<div bind:this={editor}></div>

<style>
	@reference "tailwindcss";

	:global(.cm-content) {
		font-family: var(--font-lilex);
		--anchor-underline-stroke: 1px;
		--anchor-underline-offset: 4px;
	}

	:global(.cm-editor.cm-focused) {
		outline: none;
	}
</style>
