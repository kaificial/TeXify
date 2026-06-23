import React from 'react';
import type { ProcessingMode } from '../../types';

interface Props {
    open: boolean;
    mode: ProcessingMode;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmationModal({ open, mode, onConfirm, onCancel }: Props) {
    if (!open) return null;

    const isCloud = mode === 'cloud';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 border border-slate-100 transform transition-all scale-100">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 mb-2">
                        {isCloud ? (
                            // cloud icon
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
                            </svg>
                        ) : (
                            // download icon
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                        )}
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">
                        {isCloud ? 'Send to Cloud AI' : 'Download Required'}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed px-2">
                        {isCloud
                            ? 'Your image will be sent securely to Claude AI for processing. No images are stored.'
                            : 'To process images locally on your device, we need to download AI models. This may take a moment but only needs to happen once.'
                        }
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
                            {isCloud ? 'Send' : 'Proceed'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
