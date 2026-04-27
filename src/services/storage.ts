import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { HistoryItem } from '../types';

interface TexifyDB extends DBSchema {
    history: {
        key: string;
        value: HistoryItem;
        indexes: { by_timestamp: number };
    };
}

const DB_NAME = 'texify';
const DB_VERSION = 1;
const STORE = 'history' as const;

let dbPromise: Promise<IDBPDatabase<TexifyDB>> | null = null;

function getDB(): Promise<IDBPDatabase<TexifyDB>> {
    if (!dbPromise) {
        dbPromise = openDB<TexifyDB>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                const store = db.createObjectStore(STORE, { keyPath: 'id' });
                store.createIndex('by_timestamp', 'timestamp');
            },
        });
    }
    return dbPromise;
}

export const historyStorage = {
    async getAll(): Promise<HistoryItem[]> {
        const db = await getDB();
        const items = await db.getAllFromIndex(STORE, 'by_timestamp');
        return items.reverse();
    },

    async add(item: HistoryItem): Promise<void> {
        const db = await getDB();
        await db.put(STORE, item);
    },

    async remove(id: string): Promise<void> {
        const db = await getDB();
        await db.delete(STORE, id);
    },

    async clear(): Promise<void> {
        const db = await getDB();
        await db.clear(STORE);
    },
};

// One time migration
// then remove the localStorage key
export async function migrateFromLocalStorage(): Promise<void> {
    const LEGACY_KEY = 'texify_history';
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return;

    try {
        const items: HistoryItem[] = JSON.parse(raw);
        if (Array.isArray(items) && items.length > 0) {
            const db = await getDB();
            const tx = db.transaction(STORE, 'readwrite');
            await Promise.all(items.map(item => tx.store.put(item)));
            await tx.done;
        }
    } catch {
        // Corrupted localStorage data 
    } finally {
        localStorage.removeItem(LEGACY_KEY);
    }
}
