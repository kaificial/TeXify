import { useState, type RefObject } from 'react';

export function useCanvasHistory(canvasRef: RefObject<HTMLCanvasElement | null>) {
    const [snapshots, setSnapshots] = useState<ImageData[]>([]);
    const [index, setIndex] = useState(-1);

    function getCtx() {
        return canvasRef.current?.getContext('2d', { willReadFrequently: true }) ?? null;
    }

    function save() {
        const canvas = canvasRef.current;
        const ctx = getCtx();
        if (!canvas || !ctx) return;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setSnapshots(prev => {
            const next = prev.slice(0, index + 1);
            next.push(imageData);
            setIndex(next.length - 1);
            return next;
        });
    }

    function undo() {
        const ctx = getCtx();
        if (!ctx || index <= 0) return;
        const newIndex = index - 1;
        ctx.putImageData(snapshots[newIndex], 0, 0);
        setIndex(newIndex);
    }

    function redo() {
        const ctx = getCtx();
        if (!ctx || index >= snapshots.length - 1) return;
        const newIndex = index + 1;
        ctx.putImageData(snapshots[newIndex], 0, 0);
        setIndex(newIndex);
    }

    function reset() {
        setSnapshots([]);
        setIndex(-1);
    }

    return {
        save,
        undo,
        redo,
        reset,
        canUndo: index > 0,
        canRedo: index < snapshots.length - 1,
        isEmpty: snapshots.length === 0,
    };
}
