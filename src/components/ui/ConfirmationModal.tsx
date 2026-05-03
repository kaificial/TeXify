import React from 'react';

interface Props {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmationModal({ open, onConfirm, onCancel }: Props) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 border border-slate-100 transform transition-all scale-100">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">Download Required</h3>
                    <p className="text-sm text-slate-500 leading-relaxed px-2">
                        To process images locally on your device, we need to download AI models. This may take a moment but only needs to happen once.
                    </p>
                    <div className="flex w-full gap-3 pt-4">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-3 text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-3 bg-slate-900 text-white text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                        >
                            Proceed
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
