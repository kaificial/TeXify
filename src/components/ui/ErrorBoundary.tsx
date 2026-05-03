import React from 'react';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('ErrorBoundary caught:', error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="w-full max-w-4xl mx-auto px-4 py-12 relative z-10">
                    <div className="bg-white/70 backdrop-blur-xl border border-black/10 rounded-2xl shadow-2xl p-16 flex flex-col items-center gap-6 text-center">
                        <p className="text-slate-500 text-sm">Something went wrong.</p>
                        <button
                            onClick={() => this.setState({ hasError: false })}
                            className="px-6 py-2 bg-slate-900 text-white text-[10px] uppercase tracking-widest rounded-lg hover:bg-slate-800 transition-all"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
