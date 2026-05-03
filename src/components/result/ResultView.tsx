import React, { useRef, useEffect } from 'react';
import katex from 'katex';

interface Props {
    latex: string;
    processedImage: string | null;
    onLatexChange: (value: string) => void;
    onBack: () => void;
}

export function ResultView({ latex, processedImage, onLatexChange, onBack }: Props) {
    const previewRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!previewRef.current) return;
        const sanitized = latex
            .replace(/^(\$|\\\[|\\\(|\$\$)/g, '')
            .replace(/(\$|\\\]|\\\)| \$\$)$/g, '')
            .trim();
        try {
            if (sanitized) {
                katex.render(sanitized, previewRef.current, { throwOnError: false, displayMode: true });
            } else {
                previewRef.current.innerHTML = '<span class="text-gray-300">Preview area</span>';
            }
        } catch (e) {
            console.error('KaTeX error', e);
        }
    }, [latex]);

    return (
        <>
            <div className="p-8 flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-6">
                    <div className="flex justify-between items-baseline px-1">
                        <h3 className="text-[10px] uppercase tracking-widest text-slate-400">Generated LaTeX</h3>
                        <button
                            onClick={() => navigator.clipboard.writeText(latex)}
                            className="px-4 py-1.5 bg-slate-900 text-white text-[10px] uppercase tracking-widest rounded-lg hover:bg-slate-800 transition-all"
                        >
                            Copy LaTeX
                        </button>
                    </div>
                    <textarea
                        value={latex}
                        onChange={(e) => onLatexChange(e.target.value)}
                        className="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-xl font-mono text-xs resize-none focus:outline-none focus:ring-1 focus:ring-slate-200 transition-all text-slate-600"
                        placeholder="No data available..."
                    />
                    <button
                        onClick={onBack}
                        className="w-full py-3 text-[10px] uppercase tracking-[0.2em] border border-slate-100 text-slate-400 rounded-xl hover:bg-slate-50 transition-all"
                    >
                        New Trial
                    </button>
                </div>

                <div className="flex-1 flex flex-col">
                    <h3 className="text-[10px] uppercase tracking-widest text-slate-400 mb-6 px-1">Compiled Output</h3>
                    <div className="flex-1 min-h-[220px] border border-slate-100 rounded-xl bg-white shadow-sm flex items-center justify-center p-8 overflow-auto">
                        <div ref={previewRef} className="text-2xl text-slate-900" />
                    </div>
                </div>
            </div>

            {processedImage && (
                <div className="px-8 pb-8">
                    <h3 className="text-[10px] uppercase tracking-widest text-slate-400 mb-4 px-1">Original Input</h3>
                    <div className="border border-slate-100 rounded-xl bg-slate-50 p-4 flex items-center justify-center">
                        <img src={processedImage} alt="Original input" className="max-h-48 rounded-lg object-contain" />
                    </div>
                </div>
            )}
        </>
    );
}
