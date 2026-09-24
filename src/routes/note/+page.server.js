import { redirect } from '@sveltejs/kit';
import { save, savePreview } from '$lib/database/database.ts';
import { toHTMLPreview } from '$lib/rysvmd/rysvmdToHtml.ts';

export const actions = {
    default: async({ request }) => {
        const data = await request.formData();
        const uuid = save(null, data.get('content'), {});
        savePreview(uuid, toHTMLPreview(data.get('content'), 3));
        throw redirect(303, `/${uuid}`);
    }
}
