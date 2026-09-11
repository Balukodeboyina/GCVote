import { EditorQuestion, EditorOption } from './types.js';
import { Button } from '../ui/Button.js';
import {
  Plus,
  Trash2,
  CheckCircle,
  Circle,
  Eye,
  Edit3,
  Star,
  Send,
  ThumbsUp,
  Cloud,
} from 'lucide-react';
import { formatQuestionTypeLabel, getQuestionTypeIcon } from './SlideList.js';

interface SlideCanvasProps {
  question: EditorQuestion | null;
  mode: 'editor' | 'preview';
  onModeChange: (mode: 'editor' | 'preview') => void;
  onUpdateQuestionText: (text: string) => void;
  onUpdateOption: (index: number, text: string) => void;
  onToggleCorrect: (index: number) => void;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
}

export function SlideCanvas({
  question,
  mode,
  onModeChange,
  onUpdateQuestionText,
  onUpdateOption,
  onToggleCorrect,
  onAddOption,
  onRemoveOption,
}: SlideCanvasProps) {
  if (!question) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
        <p className="text-sm">Select a slide from the left or create a new one to begin editing.</p>
      </div>
    );
  }

  const isSelectableType =
    question.type === 'MULTIPLE_CHOICE' ||
    question.type === 'POLL' ||
    question.type === 'TRUE_FALSE';

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900/40 overflow-y-auto">
      {/* Canvas Header Controls */}
      <div className="px-6 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
        <div className="flex items-center gap-2">
          <span className="text-brand-400">{getQuestionTypeIcon(question.type, 'w-4 h-4')}</span>
          <span className="text-xs font-semibold text-slate-300">
            Slide {question.position + 1}: {formatQuestionTypeLabel(question.type)}
          </span>
        </div>

        {/* Editor vs Preview Mode Switcher */}
        <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => onModeChange('editor')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              mode === 'editor'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            Editor
          </button>
          <button
            type="button"
            onClick={() => onModeChange('preview')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              mode === 'preview'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Participant Preview
          </button>
        </div>
      </div>

      {/* Canvas Main Body */}
      <div className="flex-1 p-6 flex flex-col items-center justify-start max-w-4xl mx-auto w-full">
        {mode === 'editor' ? (
          /* ==================== EDITOR MODE ==================== */
          <div className="w-full space-y-6 animate-fadeIn">
            {/* Question Textarea */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg focus-within:border-brand-500/80 transition-all">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Question Prompt
              </label>
              <textarea
                rows={2}
                value={question.questionText}
                onChange={(e) => onUpdateQuestionText(e.target.value)}
                placeholder="Type your question or prompt here..."
                className="w-full bg-transparent text-xl sm:text-2xl font-bold text-white placeholder-slate-600 focus:outline-none resize-none leading-snug"
              />
            </div>

            {/* Options Editor for Selectable Types */}
            {isSelectableType && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Options ({question.options.length})
                  </h4>
                  {question.type !== 'TRUE_FALSE' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onAddOption}
                      className="text-xs gap-1 py-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Option
                    </Button>
                  )}
                </div>

                <div className="space-y-2.5">
                  {question.options.map((option: EditorOption, index: number) => {
                    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                    const letter = letters[index] || `${index + 1}`;
                    return (
                      <div
                        key={index}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          option.isCorrect
                            ? 'border-emerald-700/60 bg-emerald-950/20'
                            : 'border-slate-800 bg-slate-900/60 focus-within:border-brand-500/60'
                        }`}
                      >
                        <span className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
                          {letter}
                        </span>

                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) => onUpdateOption(index, e.target.value)}
                          placeholder={`Option ${letter}`}
                          className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-600 focus:outline-none"
                        />

                        {/* Correct Answer Toggle */}
                        <button
                          type="button"
                          onClick={() => onToggleCorrect(index)}
                          className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs ${
                            option.isCorrect
                              ? 'text-emerald-400 bg-emerald-950/80 font-semibold'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                          title="Mark as correct answer"
                        >
                          {option.isCorrect ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-emerald-400" />
                              <span className="hidden sm:inline">Correct</span>
                            </>
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>

                        {/* Delete option (not allowed for True/False) */}
                        {question.type !== 'TRUE_FALSE' && question.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => onRemoveOption(index)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                            title="Remove Option"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Type-Specific Interactive Previews in Editor */}
            {question.type === 'RATING' && (
              <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/60 text-center space-y-4">
                <div className="flex justify-center gap-3">
                  {Array.from({ length: question.settings.scaleMax || 5 }, (_, i) => (
                    <div
                      key={i}
                      className="w-12 h-12 rounded-xl border border-slate-700 bg-slate-800/80 flex flex-col items-center justify-center text-amber-400 font-bold hover:border-amber-400 transition-colors cursor-pointer"
                    >
                      <Star className="w-5 h-5 mb-0.5 fill-amber-400/20" />
                      <span className="text-xs text-slate-200">{i + 1}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-slate-400 max-w-sm mx-auto px-2">
                  <span>{question.settings.lowLabel || 'Poor'}</span>
                  <span>{question.settings.highLabel || 'Excellent'}</span>
                </div>
              </div>
            )}

            {question.type === 'OPEN_TEXT' && (
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-500 text-sm">
                  {question.settings.placeholder || 'Participants will type their open responses here...'}
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Free-form text</span>
                  <span>Max {question.settings.maxChars || 250} characters</span>
                </div>
              </div>
            )}

            {question.type === 'WORD_CLOUD' && (
              <div className="p-10 rounded-2xl border border-slate-800 bg-slate-900/60 text-center space-y-4">
                <Cloud className="w-10 h-10 text-brand-400 mx-auto opacity-70" />
                <div className="flex flex-wrap items-center justify-center gap-2 max-w-md mx-auto">
                  <span className="px-3 py-1 rounded-full bg-brand-950/80 text-brand-300 font-bold text-lg border border-brand-800/60">
                    Innovative
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-950/80 text-purple-300 font-semibold text-sm border border-purple-800/60">
                    Dynamic
                  </span>
                  <span className="px-4 py-1.5 rounded-full bg-sky-950/80 text-sky-200 font-extrabold text-xl border border-sky-800/60">
                    Engaging
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs border border-slate-700">
                    Fast
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Live word cloud will aggregate common participant words in real time.
                </p>
              </div>
            )}

            {question.type === 'Q_AND_A' && (
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Audience question inbox</span>
                    <p className="text-sm font-semibold text-white">Can you explain slide 4 in more detail?</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-brand-400 bg-brand-950 px-2.5 py-1 rounded-lg border border-brand-800">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>14 upvotes</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 text-center">
                  Audience members can post questions and vote for the most relevant ones.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* ==================== PARTICIPANT PREVIEW MODE ==================== */
          <div className="w-full max-w-sm mx-auto animate-fadeIn">
            <div className="rounded-[36px] border-4 border-slate-700 bg-slate-950 p-4 shadow-2xl relative overflow-hidden">
              {/* Phone Speaker Notch */}
              <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-5" />

              <div className="space-y-4 pb-4">
                {/* Header in mobile */}
                <div className="text-center border-b border-slate-800 pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-400">
                    PulseVote Live
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1 leading-snug">
                    {question.questionText || 'Question prompt'}
                  </h3>
                </div>

                {/* Question Input in mobile */}
                {isSelectableType && (
                  <div className="space-y-2">
                    {question.options.map((option, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="w-full text-left p-3 rounded-xl border border-slate-800 bg-slate-900 hover:border-brand-500 hover:bg-brand-950/20 text-xs font-medium text-slate-200 transition-all flex items-center justify-between active:scale-[0.99]"
                      >
                        <span>{option.text || `Option ${idx + 1}`}</span>
                        <Circle className="w-3.5 h-3.5 text-slate-600" />
                      </button>
                    ))}
                    <Button variant="primary" size="sm" className="w-full mt-3 text-xs">
                      Submit Response
                    </Button>
                  </div>
                )}

                {question.type === 'RATING' && (
                  <div className="space-y-4 py-3">
                    <div className="flex justify-center gap-2">
                      {Array.from({ length: question.settings.scaleMax || 5 }, (_, i) => (
                        <button
                          key={i}
                          className="w-9 h-9 rounded-lg border border-slate-700 bg-slate-900 flex items-center justify-center text-xs font-bold text-amber-400 hover:bg-amber-950/40"
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 px-1">
                      <span>{question.settings.lowLabel || 'Poor'}</span>
                      <span>{question.settings.highLabel || 'Excellent'}</span>
                    </div>
                    <Button variant="primary" size="sm" className="w-full text-xs">
                      Submit Rating
                    </Button>
                  </div>
                )}

                {question.type === 'OPEN_TEXT' && (
                  <div className="space-y-3">
                    <textarea
                      rows={3}
                      placeholder={question.settings.placeholder || 'Type your reply here...'}
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none resize-none"
                    />
                    <Button variant="primary" size="sm" className="w-full text-xs gap-1.5">
                      <Send className="w-3.5 h-3.5" />
                      Send Reply
                    </Button>
                  </div>
                )}

                {question.type === 'WORD_CLOUD' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Enter a word..."
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                    />
                    <Button variant="primary" size="sm" className="w-full text-xs">
                      Submit Word
                    </Button>
                  </div>
                )}

                {question.type === 'Q_AND_A' && (
                  <div className="space-y-3">
                    <textarea
                      rows={2}
                      placeholder="Ask a question for the presenter..."
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none resize-none"
                    />
                    <Button variant="primary" size="sm" className="w-full text-xs">
                      Post Question
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
