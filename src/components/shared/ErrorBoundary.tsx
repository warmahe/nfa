import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FCFBF7] flex items-center justify-center p-6 text-left selection:bg-[#F4BF4B]">
          <div className="w-full max-w-xl bg-white border-4 border-[#121212] p-8 md:p-10 shadow-[12px_12px_0px_0px_#121212] space-y-6">
            <div className="flex items-center gap-4 text-rose-700 pb-4 border-b-2 border-slate-200">
              <div className="p-3 bg-rose-100 rounded-xl border border-rose-300">
                <AlertCircle size={28} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#9E1B1D] block">
                  Service Notice
                </span>
                <h2 className="font-brand font-black text-2xl uppercase tracking-tight text-[#121212]">
                  {this.props.fallbackTitle || 'Something went wrong.'}
                </h2>
              </div>
            </div>

            <p className="text-xs font-semibold text-slate-700">
              We encountered an issue loading this section. Please try refreshing the page.
            </p>

            {this.state.error && (
              <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs space-y-2 overflow-x-auto">
                <span className="text-rose-400 font-bold block text-[11px]">Notice:</span>
                <div>{this.state.error.message || this.state.error.toString()}</div>
                {this.state.error.stack && (
                  <details className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                    <summary className="cursor-pointer font-sans font-bold hover:text-white">View Details</summary>
                    <pre className="mt-2 whitespace-pre-wrap">{this.state.error.stack}</pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                  window.location.reload();
                }}
                className="px-6 py-3 bg-[#121212] text-[#F4BF4B] font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RefreshCw size={14} /> TRY AGAIN
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
