import { Button } from '../ui/Button.js';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  presentationTitle: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  presentationTitle,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl border border-rose-900/60 bg-slate-900 p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4 mb-5">
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Delete Presentation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to delete <span className="text-slate-200 font-semibold">"{presentationTitle}"</span>? This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            size="md"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Yes, Delete Presentation'}
          </Button>
        </div>
      </div>
    </div>
  );
}
