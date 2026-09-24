import { redirect } from '@sveltejs/kit';
import { fromUuid, save, savePreview } from '$lib/database/database.ts';
import { toHTMLPreview } from '$lib/rysvmd/rysvmdToHtml.ts';

export function load({ params }) {
    const content = fromUuid(params.slug).content;
    return {
        content,
    };
}

export const actions = {
    default: async({ request, params }) => {
        const data = await request.formData();
        const uuid = save(params.slug, data.get('content'), {});
        savePreview(uuid, toHTMLPreview(data.get('content'), 3));

        throw redirect(303, `/${uuid}`);
    }
}
