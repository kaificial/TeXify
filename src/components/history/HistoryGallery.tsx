import React from 'react';
import type { HistoryItem } from '../../types';

interface Props {
    items: HistoryItem[];
    onCopy: (latex: string) => void;
    onDelete: (id: string) => void;
    onClearAll: () => void;
}

export function HistoryGallery({ items, onCopy, onDelete, onClearAll }: Props) {
    if (items.length === 0) return null;

    return (
        <div className="mt-16 space-y-6">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Recent Formulas</h3>
                <button
                    onClick={onClearAll}
                    className="text-[10px] uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
                >
                    Clear All
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                    <div key={item.id} className="group relative bg-white border border-slate-100 rounded-xl p-5 hover:border-slate-300 hover:shadow-xl transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div className="text-[10px] text-slate-300 font-mono">
                                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onCopy(item.latex)}
                                    className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors"
                                    title="Copy LaTeX"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => onDelete(item.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                                    title="Remove"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3 flex items-center justify-center min-h-[80px] mb-3 group-hover:bg-white transition-colors duration-300">
                            <div className="text-slate-600 font-mono text-[10px] truncate max-w-full leading-relaxed px-2">
                                {item.latex}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
