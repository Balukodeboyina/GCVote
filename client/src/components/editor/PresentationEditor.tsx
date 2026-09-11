import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { EditorQuestion, PresentationMetadata, EditorOption } from './types.js';
import { SlideList } from './SlideList.js';
import { SlideCanvas } from './SlideCanvas.js';
import { SlideSettings } from './SlideSettings.js';
import { DeleteConfirmModal } from '../dashboard/DeleteConfirmModal.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { ArrowLeft, Check, Save, AlertCircle } from 'lucide-react';
import { QuestionType, QuestionSettings } from '@pulsevote/shared';

interface PresentationEditorProps {
  presentation: PresentationMetadata;
  onBack: () => void;
}

export function PresentationEditor({ presentation, onBack }: PresentationEditorProps) {
  const { token } = useAuth();
  const [questions, setQuestions] = useState<EditorQuestion[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('saved');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [canvasMode, setCanvasMode] = useState<'editor' | 'preview'>('editor');

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reference to debounce auto-saving
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/presentations/${presentation.id}/questions`, {
        headers,
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to load presentation questions.');

      const data = await res.json();
      const loaded: EditorQuestion[] = (data.questions || []).map((q: any) => ({
        id: q.id,
        presentationId: q.presentationId,
        type: q.type as QuestionType,
        questionText: q.questionText,
        position: q.position,
        settings: typeof q.settings === 'string' ? JSON.parse(q.settings || '{}') : q.settings || {},
        options: q.options || [],
        createdAt: q.createdAt,
        updatedAt: q.updatedAt,
      }));

      setQuestions(loaded);
      setSelectedQuestionId((prev) => (prev && loaded.some((q) => q.id === prev) ? prev : loaded[0]?.id || null));
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error fetching questions.');
    } finally {
      setLoading(false);
    }
  }, [presentation.id, token]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId) || null;

  // Persist a single question update to backend
  const saveQuestionToBackend = useCallback(
    async (q: EditorQuestion) => {
      setSaveStatus('saving');
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`/api/presentations/${presentation.id}/questions/${q.id}`, {
          method: 'PUT',
          headers,
          credentials: 'include',
          body: JSON.stringify({
            type: q.type,
            questionText: q.questionText,
            position: q.position,
            settings: q.settings,
            options: q.options,
          }),
        });

        if (!res.ok) throw new Error('Failed to save changes.');
        setSaveStatus('saved');
      } catch (err) {
        setSaveStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Failed to save question.');
      }
    },
    [presentation.id, token]
  );

  // Trigger auto-save on state change
  const triggerAutoSave = useCallback(
    (updatedQuestion: EditorQuestion) => {
      setSaveStatus('unsaved');
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(() => {
        saveQuestionToBackend(updatedQuestion);
      }, 600);
    },
    [saveQuestionToBackend]
  );

  // 1. Add Question
  const handleAddQuestion = async () => {
    setSaveStatus('saving');
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/presentations/${presentation.id}/questions`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          type: 'MULTIPLE_CHOICE',
          questionText: 'Ask a question...',
          settings: { allowMultiple: false },
          options: [
            { text: 'Option 1', isCorrect: false },
            { text: 'Option 2', isCorrect: false },
          ],
        }),
      });

      if (!res.ok) throw new Error('Failed to create question.');
      const data = await res.json();
      const newQ: EditorQuestion = {
        id: data.question.id,
        presentationId: data.question.presentationId,
        type: data.question.type,
        questionText: data.question.questionText,
        position: data.question.position,
        settings:
          typeof data.question.settings === 'string'
            ? JSON.parse(data.question.settings || '{}')
            : data.question.settings || {},
        options: data.question.options || [],
      };

      setQuestions((prev) => [...prev, newQ]);
      setSelectedQuestionId(newQ.id);
      setSaveStatus('saved');
    } catch (err) {
      setSaveStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to create question.');
    }
  };

  // 2. Duplicate Question
  const handleDuplicateQuestion = async (questionId: string) => {
    setSaveStatus('saving');
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(
        `/api/presentations/${presentation.id}/questions/${questionId}/duplicate`,
        {
          method: 'POST',
          headers,
          credentials: 'include',
        }
      );

      if (!res.ok) throw new Error('Failed to duplicate question.');
      const data = await res.json();
      await fetchQuestions();
      setSelectedQuestionId(data.question.id);
      setSaveStatus('saved');
    } catch (err) {
      setSaveStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to duplicate question.');
    }
  };

  // 3. Delete Question
  const handleDeleteConfirm = async () => {
    if (!selectedQuestionId) return;
    setIsDeleting(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(
        `/api/presentations/${presentation.id}/questions/${selectedQuestionId}`,
        {
          method: 'DELETE',
          headers,
          credentials: 'include',
        }
      );

      if (!res.ok) throw new Error('Failed to delete question.');

      setIsDeleteModalOpen(false);
      const remaining = questions.filter((q) => q.id !== selectedQuestionId);
      setQuestions(remaining);
      setSelectedQuestionId(remaining.length > 0 ? remaining[0].id : null);
      setSaveStatus('saved');
      await fetchQuestions();
    } catch (err) {
      setSaveStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to delete question.');
    } finally {
      setIsDeleting(false);
    }
  };

  // 4. Reorder Questions
  const handleReorder = async (newOrderIds: string[]) => {
    // Optimistically update local array
    const idMap = new Map(questions.map((q) => [q.id, q]));
    const reordered: EditorQuestion[] = newOrderIds
      .map((id, index) => {
        const item = idMap.get(id);
        return item ? { ...item, position: index } : null;
      })
      .filter((q): q is EditorQuestion => q !== null);

    setQuestions(reordered);
    setSaveStatus('saving');

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/presentations/${presentation.id}/questions/reorder`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify({ questionIds: newOrderIds }),
      });

      if (!res.ok) throw new Error('Failed to reorder questions.');
      setSaveStatus('saved');
    } catch (err) {
      setSaveStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to reorder questions.');
      await fetchQuestions(); // rollback
    }
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const newOrder = [...questions];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(index - 1, 0, moved);
    handleReorder(newOrder.map((q) => q.id));
  };

  const handleMoveDown = (index: number) => {
    if (index >= questions.length - 1) return;
    const newOrder = [...questions];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(index + 1, 0, moved);
    handleReorder(newOrder.map((q) => q.id));
  };

  // 5. Update Question Text
  const handleUpdateQuestionText = (text: string) => {
    if (!selectedQuestion) return;
    const updated: EditorQuestion = { ...selectedQuestion, questionText: text };
    setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
    triggerAutoSave(updated);
  };

  // 6. Change Question Type
  const handleChangeType = (newType: QuestionType) => {
    if (!selectedQuestion || selectedQuestion.type === newType) return;

    let updatedOptions = [...selectedQuestion.options];
    let updatedSettings: QuestionSettings = { ...selectedQuestion.settings };

    // Smart default options configuration when switching types
    if (newType === 'TRUE_FALSE') {
      updatedOptions = [
        { text: 'True', isCorrect: false, orderIndex: 0 },
        { text: 'False', isCorrect: false, orderIndex: 1 },
      ];
    } else if (newType === 'MULTIPLE_CHOICE' || newType === 'POLL') {
      if (updatedOptions.length === 0) {
        updatedOptions = [
          { text: 'Option 1', isCorrect: false, orderIndex: 0 },
          { text: 'Option 2', isCorrect: false, orderIndex: 1 },
        ];
      }
    } else if (newType === 'RATING') {
      updatedOptions = [];
      updatedSettings = { ...updatedSettings, scaleMax: 5, lowLabel: 'Poor', highLabel: 'Excellent' };
    } else {
      updatedOptions = [];
    }

    const updated: EditorQuestion = {
      ...selectedQuestion,
      type: newType,
      options: updatedOptions,
      settings: updatedSettings,
    };

    setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
    saveQuestionToBackend(updated);
  };

  // 7. Update Options
  const handleUpdateOption = (index: number, text: string) => {
    if (!selectedQuestion) return;
    const newOptions: EditorOption[] = selectedQuestion.options.map((opt, i) =>
      i === index ? { ...opt, text } : opt
    );
    const updated: EditorQuestion = { ...selectedQuestion, options: newOptions };
    setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
    triggerAutoSave(updated);
  };

  const handleToggleCorrect = (index: number) => {
    if (!selectedQuestion) return;
    const newOptions: EditorOption[] = selectedQuestion.options.map((opt, i) =>
      i === index ? { ...opt, isCorrect: !opt.isCorrect } : opt
    );
    const updated: EditorQuestion = { ...selectedQuestion, options: newOptions };
    setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
    saveQuestionToBackend(updated);
  };

  const handleAddOption = () => {
    if (!selectedQuestion) return;
    const newOption: EditorOption = {
      text: `Option ${selectedQuestion.options.length + 1}`,
      isCorrect: false,
      orderIndex: selectedQuestion.options.length,
    };
    const updated: EditorQuestion = {
      ...selectedQuestion,
      options: [...selectedQuestion.options, newOption],
    };
    setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
    saveQuestionToBackend(updated);
  };

  const handleRemoveOption = (index: number) => {
    if (!selectedQuestion || selectedQuestion.options.length <= 2) return;
    const newOptions = selectedQuestion.options.filter((_, i) => i !== index);
    const updated: EditorQuestion = { ...selectedQuestion, options: newOptions };
    setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
    saveQuestionToBackend(updated);
  };

  // 8. Update Settings
  const handleUpdateSettings = (newSettings: Partial<QuestionSettings>) => {
    if (!selectedQuestion) return;
    const updated: EditorQuestion = {
      ...selectedQuestion,
      settings: { ...selectedQuestion.settings, ...newSettings },
    };
    setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
    saveQuestionToBackend(updated);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Bar Navigation & Header */}
      <div className="h-14 border-b border-slate-800 bg-slate-950 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={onBack}
            className="text-slate-400 hover:text-white px-2 text-xs gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Button>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-sm text-white max-w-xs sm:max-w-md truncate">
              {presentation.title}
            </h2>
            <Badge variant="info">
              {questions.length} {questions.length === 1 ? 'Slide' : 'Slides'}
            </Badge>
          </div>
        </div>

        {/* Save Status & Action */}
        <div className="flex items-center gap-3">
          {saveStatus === 'saving' && (
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-400 animate-ping" />
              Saving changes...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              All changes saved
            </span>
          )}
          {saveStatus === 'unsaved' && (
            <span className="text-xs text-amber-400 flex items-center gap-1">
              Unsaved changes
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-xs text-rose-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Save error
            </span>
          )}

          <Button
            size="sm"
            variant="primary"
            onClick={() => selectedQuestion && saveQuestionToBackend(selectedQuestion)}
            disabled={saveStatus === 'saving'}
            className="text-xs gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Error banner if present */}
      {errorMessage && (
        <div className="px-4 py-2 bg-rose-950/80 border-b border-rose-800/80 text-rose-300 text-xs flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-white font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main 3-Panel Content Area */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
          <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-400 rounded-full animate-spin mb-3" />
          <p className="text-xs">Loading presentation slides...</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* LEFT PANEL: Slide / Question List */}
          <SlideList
            questions={questions}
            selectedQuestionId={selectedQuestionId}
            onSelect={setSelectedQuestionId}
            onAdd={handleAddQuestion}
            onDuplicate={handleDuplicateQuestion}
            onDelete={() => setIsDeleteModalOpen(true)}
            onReorder={handleReorder}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
          />

          {/* CENTER PANEL: Question Canvas & Live Preview */}
          <SlideCanvas
            question={selectedQuestion}
            mode={canvasMode}
            onModeChange={setCanvasMode}
            onUpdateQuestionText={handleUpdateQuestionText}
            onUpdateOption={handleUpdateOption}
            onToggleCorrect={handleToggleCorrect}
            onAddOption={handleAddOption}
            onRemoveOption={handleRemoveOption}
          />

          {/* RIGHT PANEL: Question Settings */}
          <SlideSettings
            question={selectedQuestion}
            onChangeType={handleChangeType}
            onUpdateSettings={handleUpdateSettings}
            onDelete={() => setIsDeleteModalOpen(true)}
          />
        </div>
      )}

      {/* Delete Slide Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        presentationTitle={selectedQuestion?.questionText || 'this slide'}
        isDeleting={isDeleting}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
