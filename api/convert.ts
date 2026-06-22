import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

// rate limit: 100 requests per IP per 15 min window
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 100;
const MAX_BODY_BYTES = 4 * 1024 * 1024; // 4 MB
const ALLOWED_MIME = ['image/png', 'image/jpeg', 'image/webp'];

// allowed origins for CORS (update with your production domain)
const ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://scribelatex.vercel.app',
];

// in-memory rate limit store (resets when serverless function cold-starts)
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();

function getClientIP(req: VercelRequest): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
    return req.socket?.remoteAddress || 'unknown';
}

function isRateLimited(ip: string): { limited: boolean; retryAfter?: number } {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now - entry.windowStart > WINDOW_MS) {
        // new window
        rateLimitMap.set(ip, { count: 1, windowStart: now });
        return { limited: false };
    }

    if (entry.count >= MAX_REQUESTS) {
        const retryAfter = Math.ceil((entry.windowStart + WINDOW_MS - now) / 1000);
        return { limited: true, retryAfter };
    }

    entry.count++;
    return { limited: false };
}

// pull mime type and raw base64 from a data url
function parseDataUrl(dataUrl: string): { mime: string; base64: string } | null {
    const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/s);
    if (!match) return null;
    return { mime: match[1], base64: match[2] };
}

function setCorsHeaders(req: VercelRequest, res: VercelResponse) {
    const origin = req.headers.origin || '';
    if (ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    setCorsHeaders(req, res);

    // preflight
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // rate limit check
    const ip = getClientIP(req);
    const rateCheck = isRateLimited(ip);
    if (rateCheck.limited) {
        res.setHeader('Retry-After', String(rateCheck.retryAfter));
        return res.status(429).json({ error: 'Too many requests. Please wait and try again.' });
    }

    // validate body
    const { image } = req.body || {};

    if (!image || typeof image !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid "image" field' });
    }

    // size check (base64 is ~1.33x the raw bytes)
    if (image.length > MAX_BODY_BYTES) {
        return res.status(413).json({ error: 'Image too large. Max 4 MB.' });
    }

    // parse and validate mime
    const parsed = parseDataUrl(image);
    if (!parsed) {
        return res.status(400).json({ error: 'Invalid image format. Expected a base64 data URL.' });
    }

    if (!ALLOWED_MIME.includes(parsed.mime)) {
        return res.status(400).json({ error: `Unsupported image type: ${parsed.mime}` });
    }

    // make sure the api key is configured
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        console.error('ANTHROPIC_API_KEY is not set');
        return res.status(500).json({ error: 'Cloud AI service is not configured.' });
    }

    try {
        const client = new Anthropic({ apiKey });

        const response = await client.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 300,
            system: `You convert images of handwritten math into clean LaTeX.
Rules:
- Return ONLY the LaTeX expression, nothing else
- No markdown, no code fences, no dollar signs, no explanations
- If the image is unclear, return your best attempt
- Use standard LaTeX math commands`,
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image',
                            source: {
                                type: 'base64',
                                media_type: parsed.mime as 'image/png' | 'image/jpeg' | 'image/webp',
                                data: parsed.base64,
                            },
                        },
                        {
                            type: 'text',
                            text: 'Convert this handwritten math to LaTeX.',
                        },
                    ],
                },
            ],
        });

        // extract text from response
        const textBlock = response.content.find((b) => b.type === 'text');
        const latex = textBlock && 'text' in textBlock ? textBlock.text.trim() : '';

        return res.status(200).json({ latex });
    } catch (err: unknown) {
        console.error('Claude API error:', err);

        // don't leak api details to the client in production
        if (err instanceof Anthropic.APIError) {
            if (err.status === 429) {
                return res.status(429).json({ error: 'AI service rate limited. Try again shortly.' });
            }
            // Temporarily return the actual error message to help debug
            return res.status(502).json({ error: `Anthropic API Error: ${err.message}` });
        }

        return res.status(500).json({ error: 'Failed to process image.' });
    }
}
