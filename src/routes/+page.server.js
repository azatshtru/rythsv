import { remove, filter, preview } from '$lib/database/database.ts';

export function load({ params }) {
    const all = filter({}).map(uuid => [uuid, preview(uuid)]);
    return {
        all,
    }
}
