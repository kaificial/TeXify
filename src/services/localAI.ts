
let worker: Worker | null = null;
let statusCallback: (status: string) => void = () => {};
let progressCallback: (progress: number) => void = () => {};

const pendingRequests = new Map<string, {
    resolve: (value: string) => void;
    reject: (reason: Error) => void;
}>();

export const initLocalAI = (onStatusChange?: (status: string) => void, onProgress?: (progress: number) => void) => {
    if (onStatusChange) statusCallback = onStatusChange;
    if (onProgress) progressCallback = onProgress;

    if (worker) return;

    worker = new Worker(new URL('./ocr-worker.ts', import.meta.url), {
        type: 'module'
    });

    worker.onmessage = (event) => {
        const { status, message, result, progress, id } = event.data;

        if (status === 'download_progress') {
            progressCallback(progress);
        }

        statusCallback(message || status);

        if (id && pendingRequests.has(id)) {
            const pending = pendingRequests.get(id)!;
            pendingRequests.delete(id);
            if (status === 'success') {
                pending.resolve(result);
            } else if (status === 'error') {
                pending.reject(new Error(message));
            }
        }
    };

    worker.postMessage({ type: 'init' });
};

export const convertImageLocally = (imageDataUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!worker) {
            initLocalAI();
        }

        const id = crypto.randomUUID();
        pendingRequests.set(id, { resolve, reject });
        worker?.postMessage({ type: 'process', id, image: imageDataUrl });
    });
};
