import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button.js';
import { X, Sparkles } from 'lucide-react';

export interface PresentationData {
  id?: string;
  title: string;
  description: string | null;
}

interface PresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, description: string) => Promise<void>;
  initialData?: PresentationData | null;
  mode: 'create' | 'edit';
}

export function PresentationModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode,
}: PresentationModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
    } else {
      setTitle('');
      setDescription('');
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Presentation title is required.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSave(title.trim(), description.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save presentation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl relative">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={submitting}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-brand-400" />
            <h3 className="text-lg font-bold text-white">
              {mode === 'create' ? 'Create New Presentation' : 'Edit Presentation Details'}
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            {mode === 'create'
              ? 'Start with a title and description for your upcoming audience session.'
              : 'Update the title or summary for this presentation.'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Presentation Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. All-Hands Q3 Product Keynote"
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
              disabled={submitting}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of what this presentation covers..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors resize-none"
              disabled={submitting}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : mode === 'create' ? 'Create Presentation' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
