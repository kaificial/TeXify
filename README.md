# Scribe

> Hand-drawn math, instantly turned into LaTeX.

![Scribe App](/assets/image.png)

I got tired of hand typing LaTeX for my notes, so I built this. Draw an equation (or paste a photo of one from a textbook, lecture notes, etc.), and Scribe gives you back clean, copy pasteable LaTeX with a live-rendered preview. No LaTeX packages to install, just a canvas and AI.

## How it works

You get to pick where the actual math recognition happens:

- **Local AI** -> runs entirely on-device using [`Xenova/texify`](https://huggingface.co/Xenova/texify) via [Transformers.js](https://huggingface.co/docs/transformers.js) and WebGPU. Nothing ever leaves your browser. But.. the trade-off is a one-time model download (a few hundred MB) the first time you use it.
- **Cloud AI** -> sends the image to a small Vercel serverless function that asks Claude to transcribe it. Faster and no download, but the image does leave your device 

Scribe defaults to Local if your browser supports WebGPU, and falls back to Cloud automatically if it doesn't. You can switch between the two anytime. 

## Features

- **Draw or upload** — sketch equations freehand on the canvas, upload an image, or paste (`Ctrl+V`) straight from your clipboard
- **Two processing modes** — on-device (private, free, slower first run) or cloud (fast, powered by Claude)
- **Auto-crop & cleanup** — your drawing is automatically cropped, thresholded, and resized before it's sent off for recognition, which noticeably improves accuracy
- **Live LaTeX preview** — renders the output with KaTeX so you can see the compiled math immediately, and hand-edit it if the model got something slightly wrong
- **History** — past transcriptions are saved locally in IndexedDB so you can revisit or copy them later
- **Undo/redo & eraser** on the drawing canvas, because nobody draws a perfect integral sign on the first try

## Tech stack

| Layer            | Choice                                          |
| ---------------- | ------------------------------------------------ |
| Frontend         | React 19, TypeScript, Vite                       |
| Styling          | Tailwind CSS                                     |
| On-device AI     | Transformers.js (`Xenova/texify`), WebGPU        |
| Cloud AI         | Anthropic Claude API (via a Vercel function)     |
| Math rendering   | KaTeX                                            |
| Local storage    | IndexedDB (via `idb`)                            |
| Hosting          | Vercel                                           |

## Getting started

### Prerequisites

- Node.js 18+
- npm
- An [Anthropic API key](https://console.anthropic.com/settings/keys) if you want to use Cloud mode locally (Local mode works with no key at all)

### Setup

```bash
git clone https://github.com/kaificial/Scribe.git
cd Scribe
npm install
```

Copy `.env.example` to `.env.local` and drop in your key if you want Cloud mode to work in dev:

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

### Run it

```bash
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

> First time using Local AI mode, the browser needs to download the model so give it a minute depending on your internet speed. After that it's cached and starts instantly.

### Build

```bash
npm run build      # production build
npm run preview    # preview the production build locally
```

## Note on privacy

Local mode never touches a network, the model runs in your browser via WebGPU. Cloud mode sends the image over HTTPS to Claude for transcription and nothing is logged or retained; there's also basic per-IP rate limiting on the endpoint to keep it from being abused. If you rather not send anything anywhere, stick with Local.

## License

MIT - do whatever you want with it. If you make it better, I'd love to see it :D
