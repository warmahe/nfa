import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, Info, X, Trash2, ShieldAlert } from 'lucide-react';

export type DialogType = 'danger' | 'warning' | 'info';
export type ToastType = 'success' | 'error' | 'info';

export interface ConfirmOptions {
  title?: string;
  message: string;
  type?: DialogType;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface AdminDialogContextType {
  confirm: (options: ConfirmOptions) => void;
  toast: (message: string, type?: ToastType) => void;
}

const AdminDialogContext = createContext<AdminDialogContextType | undefined>(undefined);

export const AdminDialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [confirmConfig, setConfirmConfig] = useState<ConfirmOptions | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const confirm = (options: ConfirmOptions) => {
    setConfirmConfig(options);
  };

  const toast = (message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const handleConfirm = async () => {
    if (!confirmConfig) return;
    try {
      setIsSubmitting(true);
      await confirmConfig.onConfirm();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
      setConfirmConfig(null);
    }
  };

  const handleCancel = () => {
    if (isSubmitting) return;
    setConfirmConfig(null);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <AdminDialogContext.Provider value={{ confirm, toast }}>
      {children}

      {/* Sleek Enterprise Confirmation Modal */}
      {confirmConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header Icon Bar */}
            <div className="p-6 pb-4">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  confirmConfig.type === 'danger'
                    ? 'bg-rose-100 text-rose-600 border border-rose-200'
                    : confirmConfig.type === 'warning'
                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                    : 'bg-blue-100 text-blue-600 border border-blue-200'
                }`}>
                  {confirmConfig.type === 'danger' ? (
                    <Trash2 size={20} />
                  ) : confirmConfig.type === 'warning' ? (
                    <AlertTriangle size={20} />
                  ) : (
                    <Info size={20} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-sans font-bold text-base text-slate-900 leading-tight">
                    {confirmConfig.title || (confirmConfig.type === 'danger' ? 'Confirm Deletion' : 'Confirm Action')}
                  </h3>
                  <p className="text-xs text-slate-600 font-normal mt-1.5 leading-relaxed">
                    {confirmConfig.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                {confirmConfig.cancelText || 'Cancel'}
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2 disabled:opacity-50 ${
                  confirmConfig.type === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : confirmConfig.type === 'warning'
                    ? 'bg-[#121212] hover:bg-slate-800 text-[#F4BF4B]'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {isSubmitting ? 'Processing...' : (confirmConfig.confirmText || (confirmConfig.type === 'danger' ? 'Delete' : 'Confirm'))}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Stream */}
      <div className="fixed bottom-5 right-5 z-50 space-y-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-lg flex items-center gap-3 transition-all animate-in slide-in-from-bottom-3 duration-200 ${
              t.type === 'success'
                ? 'bg-slate-900 text-white border-slate-800'
                : t.type === 'error'
                ? 'bg-rose-900 text-white border-rose-800'
                : 'bg-slate-800 text-white border-slate-700'
            }`}
          >
            <div className="shrink-0">
              {t.type === 'success' ? (
                <CheckCircle2 size={18} className="text-emerald-400" />
              ) : t.type === 'error' ? (
                <XCircle size={18} className="text-rose-400" />
              ) : (
                <Info size={18} className="text-blue-400" />
              )}
            </div>

            <p className="text-xs font-medium flex-1 min-w-0 leading-tight">
              {t.message}
            </p>

            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-white shrink-0 p-1"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </AdminDialogContext.Provider>
  );
};

export const useAdminDialog = () => {
  const context = useContext(AdminDialogContext);
  if (!context) {
    throw new Error('useAdminDialog must be used within an AdminDialogProvider');
  }
  return context;
};
