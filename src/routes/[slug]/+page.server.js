import { fromUuid, save, remove, filter } from '$lib/database/database.ts';
import { toHTML, toHTMLPreview } from '$lib/rysvmd/rysvmdToHtml.ts';

export function load({ params }) {
    const uuid = params.slug;
    const rawContent = fromUuid(uuid).content;

    const content = toHTML(rawContent);

    return {
        uuid,
        content,
    };
}
