import React from 'react';

interface Props {
    isEraser: boolean;
    strokeSize: number;
    canUndo: boolean;
    canRedo: boolean;
    onSetEraser: (eraser: boolean) => void;
    onStrokeSizeChange: (size: number) => void;
    onUndo: () => void;
    onRedo: () => void;
    onClear: () => void;
    onProcess: () => void;
    onBack: () => void;
}

export function DrawingToolbar({
    isEraser, strokeSize, canUndo, canRedo,
    onSetEraser, onStrokeSizeChange, onUndo, onRedo, onClear, onProcess, onBack,
}: Props) {
    return (
        <>
            <div className="flex justify-between items-center mb-4 px-2">
                <button
                    onClick={onBack}
                    className="text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Back to Methods
                </button>
                <div className="flex gap-4">
                    <button onClick={onClear} className="text-[10px] uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors">Reset</button>
                    <button onClick={onProcess} className="px-6 py-2 bg-slate-900 text-white text-[10px] font-medium uppercase tracking-widest rounded-lg hover:bg-slate-800 transition-all shadow-sm">Process Frame</button>
                </div>
            </div>

            <div className="flex items-center gap-6 mb-4 px-2 py-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex gap-2">
                    <button onClick={onUndo} disabled={!canUndo} className="p-2 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed" title="Undo">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                        </svg>
                    </button>
                    <button onClick={onRedo} disabled={!canRedo} className="p-2 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed" title="Redo">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
                        </svg>
                    </button>
                </div>

                <div className="w-px h-6 bg-slate-200" />

                <div className="flex gap-2">
                    <button onClick={() => onSetEraser(false)} className={`p-2 rounded-lg transition-colors ${!isEraser ? 'bg-slate-900 text-white' : 'hover:bg-slate-200 text-slate-600'}`} title="Brush">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                        </svg>
                    </button>
                    <button onClick={() => onSetEraser(true)} className={`p-2 rounded-lg transition-colors ${isEraser ? 'bg-slate-900 text-white' : 'hover:bg-slate-200 text-slate-600'}`} title="Eraser">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83a1.125 1.125 0 011.59 0l6.375 6.375a1.125 1.125 0 010 1.59L11.01 19.17a1.125 1.125 0 01-1.59 0z" />
                        </svg>
                    </button>
                </div>

                <div className="w-px h-6 bg-slate-200" />

                <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase tracking-widest text-slate-400">Size</span>
                    <input
                        type="range" min="1" max="20" value={strokeSize}
                        onChange={(e) => onStrokeSizeChange(parseInt(e.target.value))}
                        className="w-24 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                    />
                    <span className="text-xs text-slate-500 w-6">{strokeSize}</span>
                </div>
            </div>
        </>
    );
}
