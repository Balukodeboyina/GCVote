import { EditorQuestion } from './types.js';
import { QuestionType, QuestionSettings } from '@pulsevote/shared';
import { Button } from '../ui/Button.js';
import {
  Settings,
  Trash2,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { getQuestionTypeIcon, formatQuestionTypeLabel } from './SlideList.js';

interface SlideSettingsProps {
  question: EditorQuestion | null;
  onChangeType: (newType: QuestionType) => void;
  onUpdateSettings: (settings: Partial<QuestionSettings>) => void;
  onDelete: () => void;
}

const AVAILABLE_TYPES: QuestionType[] = [
  'MULTIPLE_CHOICE',
  'POLL',
  'TRUE_FALSE',
  'RATING',
  'OPEN_TEXT',
  'WORD_CLOUD',
  'Q_AND_A',
];

export function SlideSettings({
  question,
  onChangeType,
  onUpdateSettings,
  onDelete,
}: SlideSettingsProps) {
  if (!question) {
    return (
      <div className="w-full lg:w-72 xl:w-80 border-l border-slate-800 bg-slate-950/60 p-6 text-center text-slate-500 text-xs">
        No slide selected.
      </div>
    );
  }

  const s = question.settings || {};

  return (
    <div className="w-full lg:w-72 xl:w-80 border-l border-slate-800 bg-slate-950/60 flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-2">
        <Settings className="w-4 h-4 text-brand-400" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Slide Settings
        </h3>
      </div>

      <div className="p-4 space-y-6 flex-1">
        {/* Question Type Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-brand-400" />
            Question Type
          </label>
          <div className="space-y-1.5">
            {AVAILABLE_TYPES.map((type) => {
              const isSelected = question.type === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => onChangeType(type)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-brand-500 text-white font-semibold shadow-sm shadow-brand-500/20'
                      : 'bg-slate-900/60 border border-slate-800/80 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {getQuestionTypeIcon(type, 'w-3.5 h-3.5')}
                    {formatQuestionTypeLabel(type)}
                  </span>
                  {isSelected && <Sparkles className="w-3.5 h-3.5 text-brand-200" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Type-Specific Options & Settings */}
        <div className="pt-4 border-t border-slate-800/80 space-y-4">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Configuration
          </h4>

          {/* Multiple Choice & Poll Settings */}
          {(question.type === 'MULTIPLE_CHOICE' || question.type === 'POLL') && (
            <div className="space-y-3">
              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                <span>Allow multiple selections</span>
                <input
                  type="checkbox"
                  checked={s.allowMultiple || false}
                  onChange={(e) => onUpdateSettings({ allowMultiple: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-brand-500 focus:ring-brand-500"
                />
              </label>

              {question.type === 'MULTIPLE_CHOICE' && (
                <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                  <span>Has correct answer</span>
                  <input
                    type="checkbox"
                    checked={s.hasCorrectAnswer || false}
                    onChange={(e) => onUpdateSettings({ hasCorrectAnswer: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-brand-500 focus:ring-brand-500"
                  />
                </label>
              )}
            </div>
          )}

          {/* Rating Settings */}
          {question.type === 'RATING' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Scale Maximum</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ scaleMax: 5 })}
                    className={`py-1.5 rounded-lg border font-semibold ${
                      s.scaleMax !== 10
                        ? 'bg-brand-500 text-white border-brand-500'
                        : 'bg-slate-900 text-slate-300 border-slate-800'
                    }`}
                  >
                    1 to 5
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ scaleMax: 10 })}
                    className={`py-1.5 rounded-lg border font-semibold ${
                      s.scaleMax === 10
                        ? 'bg-brand-500 text-white border-brand-500'
                        : 'bg-slate-900 text-slate-300 border-slate-800'
                    }`}
                  >
                    1 to 10
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Low End Label</label>
                <input
                  type="text"
                  value={s.lowLabel || 'Poor'}
                  onChange={(e) => onUpdateSettings({ lowLabel: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">High End Label</label>
                <input
                  type="text"
                  value={s.highLabel || 'Excellent'}
                  onChange={(e) => onUpdateSettings({ highLabel: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200"
                />
              </div>
            </div>
          )}

          {/* Open Text Settings */}
          {question.type === 'OPEN_TEXT' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Max Character Limit</label>
                <select
                  value={s.maxChars || 250}
                  onChange={(e) => onUpdateSettings({ maxChars: parseInt(e.target.value, 10) })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200"
                >
                  <option value={100}>100 characters</option>
                  <option value={250}>250 characters</option>
                  <option value={500}>500 characters</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Placeholder Text</label>
                <input
                  type="text"
                  value={s.placeholder || ''}
                  onChange={(e) => onUpdateSettings({ placeholder: e.target.value })}
                  placeholder="Share your thoughts..."
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200"
                />
              </div>
            </div>
          )}

          {/* Word Cloud Settings */}
          {question.type === 'WORD_CLOUD' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Max Entries per Participant</label>
                <select
                  value={s.maxWordsPerParticipant || 1}
                  onChange={(e) =>
                    onUpdateSettings({ maxWordsPerParticipant: parseInt(e.target.value, 10) })
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200"
                >
                  <option value={1}>1 entry</option>
                  <option value={2}>2 entries</option>
                  <option value={3}>3 entries</option>
                </select>
              </div>
            </div>
          )}

          {/* Q&A Settings */}
          {question.type === 'Q_AND_A' && (
            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                <span>Allow anonymous questions</span>
                <input
                  type="checkbox"
                  checked={s.allowAnonymous ?? true}
                  onChange={(e) => onUpdateSettings({ allowAnonymous: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-brand-500 focus:ring-brand-500"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Danger Zone: Delete Slide */}
      <div className="p-4 border-t border-slate-800/80">
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          className="w-full text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border-rose-900/40 gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete This Slide
        </Button>
      </div>
    </div>
  );
}
