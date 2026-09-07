import React from 'react';
import { ShieldAlert, RefreshCw, RotateCcw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[RoleWise AI] Uncaught component render error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('rolewise_audit_logs');
    } catch (e) {}
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-2xl mx-auto my-12 rounded-3xl bg-slate-950 border border-rose-500/40 p-8 shadow-2xl text-slate-200 space-y-5 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Institutional Ledger View Error</h2>
              <p className="text-xs text-slate-400">
                A rendering anomaly occurred while processing log telemetry.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-xs text-rose-300 overflow-x-auto">
            {this.state.error?.message || 'Unknown runtime error'}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Component</span>
            </button>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Cached Ledger Data</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
