const database = {
    notes: new Map(),
    symbols: new Map(),
    unlink(uuid) {
        const entry = this.notes.get(uuid);
        if(!entry) return;
        for(const key of Object.keys(entry.symbols)) {
            const links = this.symbols.get(key);
            if(!links) return;
            links.delete(uuid);
            if(links.length === 0) {
                this.symbols.delete(key);
            }
        }
    },
};

function Uuid() {
    return self.crypto.randomUUID().replace(/-/g, '').slice(0, 12);
}

export function fromUuid(uuid) {
    return database.notes.get(uuid);
}

export function save(uuid, content, symbols) {
    if(!uuid) {
        uuid = Uuid();
    }

    database.unlink(uuid);

    database.notes.set(uuid, { content, symbols });
    Object.keys(symbols).forEach(k => database.symbols
        .getOrInsert(k, new Set())
        .add(uuid)
    );

    return uuid;
}

export function remove(uuid) {
    database.unlink(uuid);
    database.notes.delete(uuid);
}

export function filter(filters) {
    const keys = Object.keys(filters);
    if(keys.length === 0) {
        return database.notes;
    }
    const firstKey = keys[0];
    const firstPredicate = filters[firstKey];
    let notes = [...database.symbols.get(firstKey)].filter(
        uuid => firstPredicate(database.notes.get(uuid).symbols[firstKey])
    );
    for(const k of keys.slice(1)) {
        notes = notes.filter(uuid => {
            const symbols = database.notes.get(uuid).symbols;
            const predicate = filters[k];
            return Object.hasOwn(symbols, k) && predicate(symbols[k]);
        });
    }
    return notes.map(uuid => [uuid, database.notes.get(uuid)]);
}
