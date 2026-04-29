import { useEffect, type RefObject } from 'react';

export function useResponsiveCanvas(
    containerRef: RefObject<HTMLDivElement | null>,
    canvasRef: RefObject<HTMLCanvasElement | null>,
) {
    useEffect(() => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                const dpr = window.devicePixelRatio || 1;

                // Save the current drawing before resizing
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                const imageData = ctx && canvas.width > 0
                    ? ctx.getImageData(0, 0, canvas.width, canvas.height)
                    : null;

                canvas.width = Math.floor(width * dpr);
                canvas.height = Math.floor(height * dpr);

                if (ctx) {
                    ctx.scale(dpr, dpr);
                    ctx.strokeStyle = '#000';
                    ctx.lineJoin = 'round';
                    ctx.lineCap = 'round';
                    // Restore the drawing at the new size
                    if (imageData) ctx.putImageData(imageData, 0, 0);
                }
            }
        });

        observer.observe(container);
        return () => observer.disconnect();
    }, [containerRef, canvasRef]);
}
