import { redirect } from '@sveltejs/kit';
import { fromUuid, save } from '$lib/database/database.ts';

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
        throw redirect(303, `/${uuid}`);
    }
}
