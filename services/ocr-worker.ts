
import { pipeline, env, RawImage } from '@huggingface/transformers';

// holds the ai model once it's loaded
let ocrPipeline: any = null;

env.allowLocalModels = false;

const init = async () => {
    if (ocrPipeline) return;

    self.postMessage({ status: 'loading', message: 'initializing texify model...' });

    try {
        // texify works better for math formulas
        ocrPipeline = await pipeline('image-to-text', 'Xenova/texify');
        self.postMessage({ status: 'ready', message: 'ai ready' });
    } catch (error: any) {
        self.postMessage({ status: 'error', message: error.message });
    }
};

// prep the image before sending to ai
const preprocessImage = async (imageSource: string): Promise<RawImage> => {
    const img = await RawImage.fromURL(imageSource);
    // texify performs best when the formula is prominent.
    // The pipeline handles resizing, but we ensure the image is clean.
    return img;
};

// clean up the latex output
const sanitizeLatex = (text: string): string => {
    let clean = text.trim();

    // strip dollar signs and other wrappers
    if (clean.startsWith('$$') && clean.endsWith('$$')) {
        clean = clean.substring(2, clean.length - 2);
    } else if (clean.startsWith('$') && clean.endsWith('$')) {
        clean = clean.substring(1, clean.length - 1);
    } else if (clean.startsWith('\\(') && clean.endsWith('\\)')) {
        clean = clean.substring(2, clean.length - 2);
    } else if (clean.startsWith('\\[') && clean.endsWith('\\]')) {
        clean = clean.substring(2, clean.length - 2);
    }

    clean = clean.replace(/^```latex/, '').replace(/```$/, '');

    // catch when the ai hallucinates garbage
    if (clean.includes('(x,y)') && clean.length > 50) {
        // too many equals signs means something went wrong
        const parts = clean.split('=');
        if (parts.length > 3) return "Recognition failed. Please try a clearer drawing.";
    }

    return clean.trim();
};

self.onmessage = async (event) => {
    const { type, image } = event.data;

    if (type === 'init') {
        await init();
        return;
    }

    if (type === 'process') {
        if (!ocrPipeline) {
            await init();
        }

        try {
            self.postMessage({ status: 'processing', message: 'analyzing formula...' });

            const processedImage = await preprocessImage(image);

            // these settings help the ai stay focused
            const result = await ocrPipeline(processedImage, {
                num_beams: 5,
                max_new_tokens: 256,
                repetition_penalty: 1.2,
            });

            let output = result[0].generated_text;
            output = sanitizeLatex(output);

            self.postMessage({ status: 'success', result: output });
        } catch (error: any) {
            self.postMessage({ status: 'error', message: error.message });
        }
    }
};
