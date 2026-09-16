const notes = new Map();
const symbols = new Map();

function uuid() {
    return self.crypto.randomUUID().replace(/-/g, '').slice(0, 12);
}

export function save(value, uuid) {
    if(!uuid) {
        uuid = uuid();
    }
    // todo
}
