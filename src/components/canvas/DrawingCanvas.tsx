import React, { useRef } from 'react';
import { useResponsiveCanvas } from '../../hooks/useResponsiveCanvas';

interface Props {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    isEraser: boolean;
    strokeSize: number;
    onStrokeEnd: () => void;
}

export function DrawingCanvas({ canvasRef, isEraser, strokeSize, onStrokeEnd }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const isDrawing = useRef(false);

    useResponsiveCanvas(containerRef, canvasRef);

    function getPos(e: React.MouseEvent | React.TouchEvent) {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
    }

    function startDrawing(e: React.MouseEvent | React.TouchEvent) {
        isDrawing.current = true;
        const pos = getPos(e);
        const ctx = canvasRef.current?.getContext('2d', { willReadFrequently: true });
        if (ctx) {
            ctx.strokeStyle = isEraser ? '#FFFFFF' : '#000';
            ctx.lineWidth = strokeSize;
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
        }
    }

    function draw(e: React.MouseEvent | React.TouchEvent) {
        if (!isDrawing.current) return;
        const pos = getPos(e);
        const ctx = canvasRef.current?.getContext('2d', { willReadFrequently: true });
        ctx?.lineTo(pos.x, pos.y);
        ctx?.stroke();
    }

    function endDrawing() {
        if (isDrawing.current) {
            isDrawing.current = false;
            onStrokeEnd();
        }
    }

    return (
        <div ref={containerRef} className="relative w-full h-[500px]">
            <canvas
                ref={canvasRef}
                className="w-full h-full border border-slate-100 bg-white rounded-xl cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={endDrawing}
                onMouseLeave={endDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={endDrawing}
            />
            <div className="absolute bottom-4 right-4 text-[10px] uppercase tracking-widest text-slate-200 pointer-events-none italic">Canvas</div>
        </div>
    );
}
