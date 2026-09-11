import React from 'react';
import { AlertTriangle, Save, Trash2, X } from 'lucide-react';

export default function UnsavedModal({ isOpen, onSaveAndProceed, onDiscardAndProceed, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 w-full max-w-md space-y-4">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-100 text-amber-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Unsaved Changes Warning
            </h3>
            <p className="text-xs text-slate-500">
              You have modified your subject marks/credits.
            </p>
          </div>
        </div>

        {/* Content Body */}
        <p className="text-xs text-slate-600 font-medium">
          Would you like to save your changes to your marksheet before continuing?
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          
          <button
            onClick={onDiscardAndProceed}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200"
          >
            Discard
          </button>

          <button
            onClick={onSaveAndProceed}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center justify-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save & Proceed</span>
          </button>
        </div>

      </div>
    </div>
  );
}
