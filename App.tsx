
import React from 'react';
import InteractiveBackground from './components/InteractiveBackground';
import FormulaTool from './components/FormulaTool';

const App: React.FC = () => {
    return (
        <div className="min-h-screen relative selection:bg-blue-500 selection:text-white font-sans antialiased text-slate-900">
            <InteractiveBackground />

            {/* nav */}
            <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-6">
                <nav className="flex items-center justify-between px-8 py-3 bg-white/80 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-2xl transition-all">
                    <div className="flex items-center gap-3 pr-4 border-r border-slate-100">
                        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-sm ring-4 ring-slate-50">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                <path d="M18 6H6l6 6-6 6h12" />
                            </svg>
                        </div>
                        <span className="font-medium tracking-tight text-base text-slate-900">TeXify</span>
                    </div>

                    <div className="flex items-center gap-5">
                        <a href="https://github.com" target="_blank" className="text-slate-900 hover:scale-110 transition-transform" title="View Source">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                                <path d="M9 18c-4.51 2-5-2-7-2"></path>
                            </svg>
                        </a>

                        <a href="https://kaificial.vercel.app" target="_blank" className="flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-white text-[11px] uppercase tracking-widest rounded-full hover:bg-slate-800 transition-all hover:shadow-lg">
                            View More
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                            </svg>
                        </a>
                    </div>
                </nav>
            </div>

            {/* main content */}
            <main className="pt-40 pb-24 flex flex-col items-center">
                <div className="max-w-6xl text-center px-6 mb-8 relative z-10">
                    <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-black leading-tight mb-6">
                        Hand-drawn math <br />
                        <span className="font-serif italic">instantly to LaTeX.</span>
                    </h1>
                    <p className="text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
                        Convert handwriting and photos into clean, production ready LaTeX. Powered by Local AI, focus on the math, we'll handle the code.
                    </p>
                </div>

                <FormulaTool />

                {/* info section */}
                <div className="w-full max-w-4xl mx-auto px-6 mt-24 grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                    <div className="space-y-2">
                        <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Under the hood</h3>
                        <p className="text-slate-500 text-xs leading-relaxed">
                            Powered by <span className="text-slate-700">Xenova/texify</span> + Transformers.js. Runs in a Web Worker for smooth performance.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Privacy first</h3>
                        <p className="text-slate-500 text-xs leading-relaxed">
                            All processing in your browser — images never leave your device. No servers, just local AI.
                        </p>
                    </div>
                </div>
            </main>

            {/* page footer */}
            <footer className="w-full py-12 px-10 flex flex-col items-center text-[10px] text-slate-400 uppercase tracking-[0.2em] gap-4">
                <div className="opacity-50 flex items-center gap-1.5">
                    Made w/
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-slate-400">
                        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                </div>
            </footer>
        </div>
    );
};

export default App;
