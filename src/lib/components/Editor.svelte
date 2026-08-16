<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { EditorState } from '@codemirror/state';
	import { EditorView, keymap } from '@codemirror/view';
	import { defaultKeymap } from '@codemirror/commands';
	import { rysvmd, rysvmdHighlights } from '$lib/editor/rysvmdPlugin';

	let { content, setContent } = $props();

	let editor: HTMLDivElement;
	let view: EditorView;

	onMount(() => {
		let state = EditorState.create({
			doc: content,
			extensions: [
				rysvmd(),
				rysvmdHighlights(),
				keymap.of(defaultKeymap),
				EditorView.lineWrapping,
				EditorView.updateListener.of((update) => {
					setContent(update.state.doc.toString());
				})
			]
		});

		view = new EditorView({
			state,
			parent: editor
		});
	});

	onDestroy(() => {
		if (view) {
			view.destroy();
		}
	});
</script>

<div bind:this={editor}></div>

<style>
	@reference "tailwindcss";

	:global(.cm-content) {
		font-family: var(--font-lilex);
	}

	:global(.cm-editor.cm-focused) {
		outline: none;
	}
</style>
