import { useState, useEffect } from 'react';
import { historyStorage } from '../services/storage';
import type { HistoryItem } from '../types';

export function useTranscriptionHistory() {
    const [items, setItems] = useState<HistoryItem[]>([]);

    useEffect(() => {
        historyStorage.getAll().then(setItems).catch(console.error);
    }, []);

    function add(item: HistoryItem) {
        historyStorage.add(item).catch(console.error);
        setItems(prev => [item, ...prev].slice(0, 20));
    }

    function remove(id: string) {
        historyStorage.remove(id).catch(console.error);
        setItems(prev => prev.filter(i => i.id !== id));
    }

    function clear() {
        historyStorage.clear().catch(console.error);
        setItems([]);
    }

    return { items, add, remove, clear };
}
