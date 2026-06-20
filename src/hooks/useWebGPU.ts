import { useState, useEffect } from 'react';
import { isWebGPUAvailable } from '../services/webgpu';

interface WebGPUState {
  supported: boolean | null; // null = still checking
  loading: boolean;
}

// runs webgpu check once on mount
export function useWebGPU(): WebGPUState {
  const [state, setState] = useState<WebGPUState>({
    supported: null,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    isWebGPUAvailable().then((result) => {
      if (!cancelled) {
        setState({ supported: result, loading: false });
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
