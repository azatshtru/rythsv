import { redirect } from '@sveltejs/kit';
import { save } from '$lib/database/database.ts';

export const actions = {
    default: async({ request }) => {
        const data = await request.formData();
        const uuid = save(null, data.get('content'), {});
        throw redirect(303, `/${uuid}`);
    }
}
