import React, { useState } from 'react';
import { EditorQuestion } from './types.js';
import { Button } from '../ui/Button.js';
import {
  Plus,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  ListOrdered,
  BarChart2,
  CheckCircle2,
  Star,
  MessageSquare,
  Cloud,
  HelpCircle,
} from 'lucide-react';
import { QuestionType } from '@pulsevote/shared';

interface SlideListProps {
  questions: EditorQuestion[];
  selectedQuestionId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (newOrderIds: string[]) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

export function getQuestionTypeIcon(type: QuestionType, className = 'w-4 h-4') {
  switch (type) {
    case 'MULTIPLE_CHOICE':
      return <ListOrdered className={className} />;
    case 'POLL':
      return <BarChart2 className={className} />;
    case 'TRUE_FALSE':
      return <CheckCircle2 className={className} />;
    case 'RATING':
      return <Star className={className} />;
    case 'OPEN_TEXT':
      return <MessageSquare className={className} />;
    case 'WORD_CLOUD':
      return <Cloud className={className} />;
    case 'Q_AND_A':
      return <HelpCircle className={className} />;
    default:
      return <ListOrdered className={className} />;
  }
}

export function formatQuestionTypeLabel(type: QuestionType): string {
  switch (type) {
    case 'MULTIPLE_CHOICE':
      return 'Multiple Choice';
    case 'POLL':
      return 'Audience Poll';
    case 'TRUE_FALSE':
      return 'True / False';
    case 'RATING':
      return 'Rating Scale';
    case 'OPEN_TEXT':
      return 'Open Text';
    case 'WORD_CLOUD':
      return 'Word Cloud';
    case 'Q_AND_A':
      return 'Audience Q&A';
    default:
      return type;
  }
}

export function SlideList({
  questions,
  selectedQuestionId,
  onSelect,
  onAdd,
  onDuplicate,
  onDelete,
  onReorder,
  onMoveUp,
  onMoveDown,
}: SlideListProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = draggedId || e.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === targetId) return;

    const sourceIndex = questions.findIndex((q) => q.id === sourceId);
    const targetIndex = questions.findIndex((q) => q.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const newQuestions = [...questions];
    const [moved] = newQuestions.splice(sourceIndex, 1);
    newQuestions.splice(targetIndex, 0, moved);

    onReorder(newQuestions.map((q) => q.id));
    setDraggedId(null);
  };

  return (
    <div className="w-full lg:w-72 xl:w-80 flex flex-col h-full border-r border-slate-800 bg-slate-950/60 select-none">
      {/* Header with Add Button */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Slides</h3>
          <span className="text-[11px] text-slate-500 font-mono">
            {questions.length} {questions.length === 1 ? 'question' : 'questions'}
          </span>
        </div>
        <Button
          size="sm"
          variant="primary"
          onClick={onAdd}
          className="text-xs gap-1.5 shadow-sm shadow-brand-500/20"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Question
        </Button>
      </div>

      {/* Slide Thumbnails Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {questions.length === 0 ? (
          <div className="text-center py-10 px-4 text-slate-500">
            <p className="text-xs mb-3">No slides yet in this presentation.</p>
            <Button size="sm" variant="outline" onClick={onAdd} className="text-xs gap-1">
              <Plus className="w-3 h-3" /> Add First Question
            </Button>
          </div>
        ) : (
          questions.map((question, index) => {
            const isSelected = question.id === selectedQuestionId;
            return (
              <div
                key={question.id}
                draggable
                onDragStart={(e) => handleDragStart(e, question.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, question.id)}
                onClick={() => onSelect(question.id)}
                className={`group relative rounded-xl border transition-all p-3 cursor-pointer flex flex-col gap-2 ${
                  isSelected
                    ? 'border-brand-500 bg-brand-950/40 shadow-md ring-1 ring-brand-500/30'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                {/* Top Row: Index Badge, Type Icon, Drag Handle */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center font-mono text-[11px] font-semibold text-slate-300">
                      {index + 1}
                    </span>
                    <span className="flex items-center gap-1.5 text-brand-400 font-medium text-[11px]">
                      {getQuestionTypeIcon(question.type, 'w-3.5 h-3.5')}
                      {formatQuestionTypeLabel(question.type)}
                    </span>
                  </div>

                  <div className="flex items-center text-slate-500 opacity-60 group-hover:opacity-100">
                    <GripVertical className="w-3.5 h-3.5 cursor-grab active:cursor-grabbing" />
                  </div>
                </div>

                {/* Prompt Preview */}
                <p className="text-xs text-slate-200 line-clamp-2 min-h-[32px] leading-relaxed font-medium">
                  {question.questionText || <span className="text-slate-500 italic">Untitled question</span>}
                </p>

                {/* Action Buttons (Hover or Selected) */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-slate-400">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveUp(index);
                      }}
                      className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Move Up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === questions.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveDown(index);
                      }}
                      className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Move Down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicate(question.id);
                      }}
                      className="p-1 rounded hover:bg-slate-800 hover:text-white"
                      title="Duplicate Slide"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(question.id);
                      }}
                      className="p-1 rounded hover:bg-slate-800 hover:text-rose-400"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
