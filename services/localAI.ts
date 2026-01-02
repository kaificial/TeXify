
import { AppState } from '../types';

let worker: Worker | null = null;
let statusCallback: (status: string) => void = () => { };

export const initLocalAI = (onStatusChange?: (status: string) => void) => {
    if (worker) return;

    if (onStatusChange) statusCallback = onStatusChange;

    worker = new Worker(new URL('./ocr-worker.ts', import.meta.url), {
        type: 'module'
    });

    worker.onmessage = (event) => {
        const { status, message, result } = event.data;
        if (statusCallback) statusCallback(message || status);

        if (status === 'success' && globalResolve) {
            globalResolve(result);
        } else if (status === 'error' && globalReject) {
            globalReject(new Error(message));
        }
    };

    worker.postMessage({ type: 'init' });
};

let globalResolve: ((value: string) => void) | null = null;
let globalReject: ((reason?: any) => void) | null = null;

export const convertImageLocally = (imageDataUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!worker) {
            initLocalAI();
        }

        globalResolve = resolve;
        globalReject = reject;

        worker?.postMessage({ type: 'process', image: imageDataUrl });
    });
};
