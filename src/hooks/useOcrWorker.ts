import { useState, useCallback } from 'react';
import { initLocalAI, convertImageLocally } from '../services/localAI';
import { convertImageViaCloud } from '../services/cloudAI';
import type { ProcessingMode } from '../types';

interface OcrWorkerState {
    status: string;
    progress: number;
    isReady: boolean;
}

export function useOcrWorker(mode: ProcessingMode = 'local') {
    const [state, setState] = useState<OcrWorkerState>({
        status: '',
        progress: 0,
        isReady: false,
    });

    // only needed for local mode (downloads the model)
    const init = useCallback(() => {
        if (mode === 'cloud') return;

        initLocalAI(
            (message) => setState(prev => ({ ...prev, status: message, isReady: message === 'ai ready' })),
            (progress) => setState(prev => ({ ...prev, progress })),
        );
    }, [mode]);

    // routes to local or cloud based on current mode
    const convert = useCallback((dataUrl: string): Promise<string> => {
        if (mode === 'cloud') {
            return convertImageViaCloud(dataUrl);
        }
        return convertImageLocally(dataUrl);
    }, [mode]);

    // cloud is always "ready" (no model to download)
    const isReady = mode === 'cloud' ? true : state.isReady;
    const status = mode === 'cloud' ? 'Cloud AI ready' : state.status;

    return {
        convert,
        init,
        status,
        progress: state.progress,
        isReady,
        mode,
    };
}
