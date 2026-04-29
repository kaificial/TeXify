import React, { useRef, useEffect, type RefObject } from 'react';

export function useImageInput(onImage: (dataUrl: string) => void): {
    fileInputRef: RefObject<HTMLInputElement | null>;
    onFileChange: React.ChangeEventHandler<HTMLInputElement>;
} {
    const fileInputRef = useRef<HTMLInputElement>(null);

    function readFileAsDataUrl(blob: Blob): void {
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            if (dataUrl) onImage(dataUrl);
        };
        reader.readAsDataURL(blob);
    }

    const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) readFileAsDataUrl(file);
    };

    useEffect(() => {
        const onPaste = (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) return;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const blob = items[i].getAsFile();
                    if (blob) { readFileAsDataUrl(blob); break; }
                }
            }
        };
        window.addEventListener('paste', onPaste);
        return () => window.removeEventListener('paste', onPaste);
    }, [onImage]);

    return { fileInputRef, onFileChange };
}
