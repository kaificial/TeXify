
import React, { useRef, useState } from 'react';
import { useTranscriptionHistory } from '../hooks/useTranscriptionHistory';
import { useOcrWorker } from '../hooks/useOcrWorker';
import { useCanvasHistory } from '../hooks/useCanvasHistory';
import { useImageInput } from '../hooks/useImageInput';
import { useWebGPU } from '../hooks/useWebGPU';
import { DrawingToolbar } from './canvas/DrawingToolbar';
import { DrawingCanvas } from './canvas/DrawingCanvas';
import { ResultView } from './result/ResultView';
import { HistoryGallery } from './history/HistoryGallery';
import { ConfirmationModal } from './ui/ConfirmationModal';
import { AppState, type HistoryItem, type ProcessingMode } from '../types';

const FormulaTool: React.FC = () => {
    const [state, setState] = useState<AppState>(AppState.IDLE);
    const [latex, setLatex] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    // mode selection — default depends on webgpu support
    const webgpu = useWebGPU();
    const defaultMode: ProcessingMode = webgpu.loading ? 'local' : (webgpu.supported ? 'local' : 'cloud');
    const [mode, setMode] = useState<ProcessingMode>(defaultMode);

    // sync default mode once webgpu detection finishes
    React.useEffect(() => {
        if (!webgpu.loading && !webgpu.supported) {
            setMode('cloud');
        }
    }, [webgpu.loading, webgpu.supported]);

    const ocr = useOcrWorker(mode);
    const [strokeSize, setStrokeSize] = useState<number>(4);
    const [isEraser, setIsEraser] = useState<boolean>(false);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasHistory = useCanvasHistory(canvasRef);

    // Downscale helper to reduce token usage and payload size
    const resizeImage = (dataUrl: string, maxDim: number = 512): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                let { width, height } = img;
                if (width <= maxDim && height <= maxDim) {
                    resolve(dataUrl);
                    return;
                }
                const ratio = Math.min(maxDim / width, maxDim / height);
                width = Math.floor(width * ratio);
                height = Math.floor(height * ratio);
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, width, height);
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/png'));
                } else {
                    resolve(dataUrl); // fallback
                }
            };
            img.src = dataUrl;
        });
    };

    const imageInput = useImageInput(async (dataUrl) => { 
        const resized = await resizeImage(dataUrl);
        setPendingImageData(resized); 
        setShowConfirmation(true); 
    });
    const history_ = useTranscriptionHistory();
    const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
    const [pendingImageData, setPendingImageData] = useState<string | null>(null);

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d', { willReadFrequently: true });
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvasHistory.save();
        }
        setLatex('');
    };

    const preprocessImage = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return canvas;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            const v = luminance < 180 ? 0 : 255;
            data[i] = v; data[i + 1] = v; data[i + 2] = v;
        }
        ctx.putImageData(imageData, 0, 0);
        return canvas;
    };

    const getCroppedCanvas = (canvas: HTMLCanvasElement): HTMLCanvasElement | null => {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return canvas;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { data, width, height } = imageData;
        let minX = width, minY = height, maxX = 0, maxY = 0, found = false;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (data[(y * width + x) * 4 + 3] > 0) {
                    if (x < minX) minX = x; if (x > maxX) maxX = x;
                    if (y < minY) minY = y; if (y > maxY) maxY = y;
                    found = true;
                }
            }
        }
        if (!found) return null;
        const p = 40;
        minX = Math.max(0, minX - p); minY = Math.max(0, minY - p);
        maxX = Math.min(width, maxX + p); maxY = Math.min(height, maxY + p);
        const cw = maxX - minX, ch = maxY - minY;
        
        // Resize if too large to save tokens
        const MAX_DIM = 512;
        let finalWidth = cw;
        let finalHeight = ch;
        if (cw > MAX_DIM || ch > MAX_DIM) {
            const ratio = Math.min(MAX_DIM / cw, MAX_DIM / ch);
            finalWidth = Math.floor(cw * ratio);
            finalHeight = Math.floor(ch * ratio);
        }

        const cropped = document.createElement('canvas');
        cropped.width = finalWidth; cropped.height = finalHeight;
        const cCtx = cropped.getContext('2d', { willReadFrequently: true });
        if (cCtx) {
            cCtx.fillStyle = '#FFFFFF';
            cCtx.fillRect(0, 0, finalWidth, finalHeight);
            cCtx.drawImage(canvas, minX, minY, cw, ch, 0, 0, finalWidth, finalHeight);
        }
        return preprocessImage(cropped);
    };

    const handleProcess = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const cropped = getCroppedCanvas(canvas);
        if (!cropped) { setError('Please draw something first'); return; }
        setPendingImageData(cropped.toDataURL('image/png'));
        setShowConfirmation(true);
    };

    const handleProcessWithImage = async (dataUrl: string) => {
        setState(AppState.PROCESSING);
        setError(null);
        setProcessedImage(dataUrl);
        try {
            const result = await ocr.convert(dataUrl);
            setLatex(result);
            setState(AppState.RESULT);
            if (result && !result.includes('failed') && !result.includes('unclear')) {
                const newItem: HistoryItem = {
                    id: crypto.randomUUID(),
                    latex: result,
                    timestamp: Date.now(),
                    image: dataUrl,
                };
                history_.add(newItem);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : String(err));
            setState(AppState.IDLE);
        }
    };

    const handleConfirmProcess = () => {
        setShowConfirmation(false);
        // only init the local model for local mode
        if (mode === 'local') ocr.init();
        if (pendingImageData) {
            handleProcessWithImage(pendingImageData);
            setPendingImageData(null);
        }
    };

    const handleCancelProcess = () => {
        setShowConfirmation(false);
        setPendingImageData(null);
    };

    // processing state text varies by mode
    const processingLabel = mode === 'cloud'
        ? 'sending to claude...'
        : (ocr.progress > 0 && ocr.progress < 100 ? 'downloading...' : (ocr.status || 'running-inference...'));
    const processingSubLabel = mode === 'cloud'
        ? 'Cloud AI Processing'
        : (ocr.progress > 0 && ocr.progress < 100 ? 'Initializing AI Model' : 'Transformer Layer Processing');

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-12 relative z-10">
            <div className="bg-white/70 backdrop-blur-xl border border-black/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-500">

                {/* mode toggle — always visible at top */}
                <div className="px-8 pt-6 pb-2 flex items-center justify-between">
                    <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1">
                        <button
                            onClick={() => webgpu.supported !== false && setMode('local')}
                            disabled={webgpu.supported === false}
                            className={`px-4 py-2 text-[10px] uppercase tracking-widest rounded-lg transition-all ${
                                mode === 'local'
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : webgpu.supported === false
                                        ? 'text-slate-300 cursor-not-allowed'
                                        : 'text-slate-500 hover:text-slate-900'
                            }`}
                            title={webgpu.supported === false ? 'WebGPU not supported in this browser' : 'Process locally using WebGPU'}
                        >
                            Local AI
                        </button>
                        <button
                            onClick={() => setMode('cloud')}
                            className={`px-4 py-2 text-[10px] uppercase tracking-widest rounded-lg transition-all ${
                                mode === 'cloud'
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-900'
                            }`}
                            title="Process using Claude AI (cloud)"
                        >
                            Cloud AI
                        </button>
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-slate-400">
                        {mode === 'local' ? 'WebGPU · On-Device' : 'Claude · Secure Cloud'}
                    </span>
                </div>

                {state === AppState.IDLE && (
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <button
                                onClick={() => setState(AppState.DRAWING)}
                                className="group relative p-8 bg-gradient-to-b from-slate-50 to-white border border-slate-100 rounded-2xl hover:border-slate-200 transition-all text-left"
                            >
                                <div className="absolute top-8 right-8 opacity-10">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor" className="w-24 h-24 text-slate-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                                    </svg>
                                </div>
                                <div className="w-14 h-14 flex items-center justify-center bg-slate-900 text-white rounded-2xl shadow-sm mb-6">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-light text-slate-900 mb-2">Draw Formula</h3>
                                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                                    Sketch equations directly on the canvas with your mouse or touchscreen.
                                </p>
                                <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">
                                    Open Canvas
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                                    </svg>
                                </div>
                            </button>

                            <label className="group relative p-8 bg-gradient-to-b from-slate-50 to-white border border-slate-100 rounded-2xl hover:border-slate-200 transition-all text-left cursor-pointer">
                                <input ref={imageInput.fileInputRef} type="file" className="hidden" accept="image/*" onChange={imageInput.onFileChange} />
                                <div className="absolute top-8 right-8 opacity-10">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor" className="w-24 h-24 text-slate-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                    </svg>
                                </div>
                                <div className="w-14 h-14 flex items-center justify-center bg-slate-900 text-white rounded-2xl shadow-sm mb-6">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-light text-slate-900 mb-2">Upload or Paste</h3>
                                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                                    Upload photos or paste (Ctrl+V) directly from your clipboard.
                                </p>
                                <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">
                                    Choose File
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                                    </svg>
                                </div>
                            </label>
                        </div>
                    </div>
                )}

                {state === AppState.DRAWING && (
                    <div className="p-8">
                        <DrawingToolbar
                            isEraser={isEraser}
                            strokeSize={strokeSize}
                            canUndo={canvasHistory.canUndo}
                            canRedo={canvasHistory.canRedo}
                            onSetEraser={setIsEraser}
                            onStrokeSizeChange={setStrokeSize}
                            onUndo={canvasHistory.undo}
                            onRedo={canvasHistory.redo}
                            onClear={clearCanvas}
                            onProcess={handleProcess}
                            onBack={() => { canvasHistory.reset(); setState(AppState.IDLE); }}
                        />
                        <DrawingCanvas
                            canvasRef={canvasRef}
                            isEraser={isEraser}
                            strokeSize={strokeSize}
                            onStrokeEnd={canvasHistory.save}
                        />
                    </div>
                )}

                {state === AppState.PROCESSING && (
                    <div className="p-24 flex flex-col items-center justify-center gap-8">
                        <div className="w-12 h-12 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                        <div className="text-center space-y-1">
                            <p className="font-light text-slate-900 tracking-tight lowercase">
                                {processingLabel}
                            </p>
                            <p className="text-[10px] uppercase tracking-widest text-slate-400">
                                {processingSubLabel}
                            </p>
                        </div>
                    </div>
                )}

                {state === AppState.RESULT && (
                    <ResultView
                        latex={latex}
                        processedImage={processedImage}
                        onLatexChange={setLatex}
                        onBack={() => setState(AppState.IDLE)}
                    />
                )}

                {error && (
                    <div className="px-6 pb-6">
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                            {error}
                        </div>
                    </div>
                )}
            </div>

            <HistoryGallery
                items={history_.items}
                onCopy={(text) => navigator.clipboard.writeText(text)}
                onDelete={history_.remove}
                onClearAll={history_.clear}
            />

            <ConfirmationModal
                open={showConfirmation}
                mode={mode}
                onConfirm={handleConfirmProcess}
                onCancel={handleCancelProcess}
            />
        </div>
    );
};

export default FormulaTool;
