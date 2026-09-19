import { remove, filter } from '$lib/database/database.ts';

export function load({ params }) {
    const all = filter({});
    return {
        all,
    }
}
