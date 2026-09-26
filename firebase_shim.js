// Firebase Firestore Shim using LocalStorage
export function initializeApp(config) {
    return { name: '[DEFAULT]' };
}
export function getApps() {
    return [];
}
export function deleteApp(app) {
    return Promise.resolve();
}
export function getFirestore(app) {
    return { isShim: true };
}

function getLocalData() {
    try {
        const data = localStorage.getItem('firestore_shim_db');
        return data ? JSON.parse(data) : {};
    } catch (e) {
        return {};
    }
}
function saveLocalData(data) {
    localStorage.setItem('firestore_shim_db', JSON.stringify(data));
}

export function doc(dbOrCollection, pathOrId, ...pathSegments) {
    let path = "";
    if (dbOrCollection.isShim) {
        path = [pathOrId, ...pathSegments].join('/');
    } else {
        path = dbOrCollection.path + '/' + pathOrId;
        if (pathSegments.length > 0) {
            path += '/' + pathSegments.join('/');
        }
    }
    return { isDoc: true, path: path };
}

export function collection(db, path, ...pathSegments) {
    return { isCollection: true, path: [path, ...pathSegments].join('/') };
}

export async function getDoc(docRef) {
    const db = getLocalData();
    const parts = docRef.path.split('/');
    let current = db;
    for (let i = 0; i < parts.length; i++) {
        if (!current[parts[i]]) {
            return { exists: () => false, data: () => undefined, id: parts[parts.length - 1] };
        }
        current = current[parts[i]];
    }
    return { exists: () => true, data: () => current, id: parts[parts.length - 1] };
}

export async function setDoc(docRef, data, options = {}) {
    const db = getLocalData();
    const parts = docRef.path.split('/');
    let current = db;
    for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
    }
    const id = parts[parts.length - 1];
    if (options.merge && current[id]) {
        current[id] = { ...current[id], ...data };
    } else {
        current[id] = data;
    }
    saveLocalData(db);
}

export async function deleteDoc(docRef) {
    const db = getLocalData();
    const parts = docRef.path.split('/');
    let current = db;
    for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) return;
        current = current[parts[i]];
    }
    const id = parts[parts.length - 1];
    delete current[id];
    saveLocalData(db);
}

export async function getDocs(queryOrCollection) {
    const db = getLocalData();
    const parts = queryOrCollection.path.split('/');
    let current = db;
    for (let i = 0; i < parts.length; i++) {
        if (!current[parts[i]]) return { docs: [], empty: true, forEach: () => {} };
        current = current[parts[i]];
    }
    let docs = Object.keys(current).map(id => {
        return { exists: () => true, data: () => current[id], id: id };
    });
    
    // Simple sorting if it's a query
    if (queryOrCollection.isQuery) {
        if (queryOrCollection.orderByField) {
            docs.sort((a, b) => {
                let valA = a.data()[queryOrCollection.orderByField];
                let valB = b.data()[queryOrCollection.orderByField];
                if (queryOrCollection.orderDirection === 'desc') {
                    return valA < valB ? 1 : -1;
                }
                return valA > valB ? 1 : -1;
            });
        }
        if (queryOrCollection.limitCount) {
            docs = docs.slice(0, queryOrCollection.limitCount);
        }
    }
    
    return { docs: docs, empty: docs.length === 0, forEach: (cb) => docs.forEach(cb) };
}

export async function addDoc(collectionRef, data) {
    const id = Math.random().toString(36).substring(2, 15);
    const docRef = doc({isShim: true}, collectionRef.path + '/' + id);
    await setDoc(docRef, data);
    return docRef;
}

export function onSnapshot(docOrQuery, callback) {
    // Immediate callback for local
    if (docOrQuery.isDoc) {
        getDoc(docOrQuery).then(callback);
    } else {
        getDocs(docOrQuery).then(callback);
    }
    // Note: this shim won't trigger cross-tab updates automatically unless we add storage listeners.
    // For local-only, we just fire it once.
    const listener = (e) => {
        if (e.key === 'firestore_shim_db') {
            if (docOrQuery.isDoc) getDoc(docOrQuery).then(callback);
            else getDocs(docOrQuery).then(callback);
        }
    };
    window.addEventListener('storage', listener);
    return () => {
        window.removeEventListener('storage', listener);
    };
}

export function query(collectionRef, ...constraints) {
    let q = { isQuery: true, path: collectionRef.path };
    constraints.forEach(c => {
        if (c.type === 'orderBy') {
            q.orderByField = c.field;
            q.orderDirection = c.direction;
        } else if (c.type === 'limit') {
            q.limitCount = c.count;
        }
    });
    return q;
}

export function orderBy(field, direction = 'asc') {
    return { type: 'orderBy', field, direction };
}

export function limit(count) {
    return { type: 'limit', count };
}

