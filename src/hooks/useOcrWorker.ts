import { useState, useCallback } from 'react';
import { initLocalAI, convertImageLocally } from '../services/localAI';

interface OcrWorkerState {
    status: string;
    progress: number;
    isReady: boolean;
}

export function useOcrWorker() {
    const [state, setState] = useState<OcrWorkerState>({
        status: '',
        progress: 0,
        isReady: false,
    });

    const init = useCallback(() => {
        initLocalAI(
            (message) => setState(prev => ({ ...prev, status: message, isReady: message === 'ai ready' })),
            (progress) => setState(prev => ({ ...prev, progress })),
        );
    }, []);

    const convert = useCallback((dataUrl: string): Promise<string> => {
        return convertImageLocally(dataUrl);
    }, []);

    return { convert, init, status: state.status, progress: state.progress, isReady: state.isReady };
}
