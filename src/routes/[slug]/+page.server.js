import { fromUuid, save, remove, filter } from '$lib/database/database.ts';

export function load({ params }) {
    const uuid = params.slug;
    const content = fromUuid(uuid).content;
    return {
        uuid,
        content,
    };
}
