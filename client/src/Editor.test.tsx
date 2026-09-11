import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PresentationEditor } from './components/editor/PresentationEditor.js';
import { AuthProvider } from './context/AuthContext.js';

// Mock Socket hook
vi.mock('./hooks/useSocket.js', () => ({
  useSocket: () => ({
    isConnected: true,
    socketId: 'mock-socket-id',
    latencyMs: 10,
    sendPing: vi.fn(),
  }),
}));

const mockPresentation = {
  id: 'pres-123',
  title: 'Quantum Computing Fundamentals',
  description: 'Introductory talk on quantum mechanics and qubits',
};

const mockQuestions = [
  {
    id: 'q-1',
    presentationId: 'pres-123',
    type: 'MULTIPLE_CHOICE',
    questionText: 'What is a quantum bit called?',
    position: 0,
    settings: '{"allowMultiple":false}',
    options: [
      { id: 'opt-1', text: 'Byte', isCorrect: false, orderIndex: 0 },
      { id: 'opt-2', text: 'Qubit', isCorrect: true, orderIndex: 1 },
    ],
    createdAt: '2026-09-11T12:00:00Z',
    updatedAt: '2026-09-11T12:00:00Z',
  },
  {
    id: 'q-2',
    presentationId: 'pres-123',
    type: 'RATING',
    questionText: 'Rate your familiarity with linear algebra',
    position: 1,
    settings: '{"scaleMax":5,"lowLabel":"None","highLabel":"Advanced"}',
    options: [],
    createdAt: '2026-09-11T12:00:00Z',
    updatedAt: '2026-09-11T12:00:00Z',
  },
];

describe('PulseVote Presentation Editor Tests (v0.2)', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('pulsevote_token', 'mock_jwt_token');

    globalThis.fetch = vi.fn().mockImplementation((url: string, options?: RequestInit) => {
      // List questions
      if (url.endsWith('/questions') && (!options || !options.method || options.method === 'GET')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ questions: mockQuestions, total: 2 }),
        });
      }

      // Create question
      if (url.endsWith('/questions') && options?.method === 'POST') {
        const body = JSON.parse(options.body as string);
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              message: 'Question created successfully',
              question: {
                id: 'q-new-3',
                presentationId: 'pres-123',
                type: body.type,
                questionText: body.questionText,
                position: 2,
                settings: body.settings,
                options: body.options || [],
              },
            }),
        });
      }

      // Duplicate question
      if (url.includes('/duplicate') && options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              message: 'Question duplicated successfully',
              question: {
                id: 'q-dup-4',
                presentationId: 'pres-123',
                type: 'MULTIPLE_CHOICE',
                questionText: 'What is a quantum bit called? (Copy)',
                position: 1,
                settings: {},
                options: [],
              },
            }),
        });
      }

      // Update question
      if (url.includes('/questions/') && options?.method === 'PUT') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Question updated successfully' }),
        });
      }

      // Delete question
      if (url.includes('/questions/') && options?.method === 'DELETE') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Question deleted successfully', id: 'q-1' }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    }) as unknown as typeof fetch;
  });

  it('renders top bar with title, back button, and save status', async () => {
    render(
      <AuthProvider>
        <PresentationEditor presentation={mockPresentation} onBack={vi.fn()} />
      </AuthProvider>
    );

    expect(await screen.findByText('Quantum Computing Fundamentals')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
  });

  it('renders the 3 panels: Slide list (LEFT), Canvas (CENTER), Settings (RIGHT)', async () => {
    render(
      <AuthProvider>
        <PresentationEditor presentation={mockPresentation} onBack={vi.fn()} />
      </AuthProvider>
    );

    // Wait for questions to load
    expect(await screen.findByDisplayValue('What is a quantum bit called?')).toBeInTheDocument();

    // Left Panel: Questions list header and slides
    expect(screen.getByText('Slides')).toBeInTheDocument();
    expect(screen.getByText('Rate your familiarity with linear algebra')).toBeInTheDocument();

    // Center Panel: Canvas question prompt input & options
    expect(screen.getByDisplayValue('What is a quantum bit called?')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Byte')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Qubit')).toBeInTheDocument();

    // Right Panel: Slide settings and type selector
    expect(screen.getByText('Slide Settings')).toBeInTheDocument();
    expect(screen.getByText('Question Type')).toBeInTheDocument();
  });

  it('toggles to Participant Preview mode and back to Editor mode', async () => {
    render(
      <AuthProvider>
        <PresentationEditor presentation={mockPresentation} onBack={vi.fn()} />
      </AuthProvider>
    );

    expect(await screen.findByDisplayValue('What is a quantum bit called?')).toBeInTheDocument();

    const previewBtn = screen.getByRole('button', { name: /Participant Preview/i });
    fireEvent.click(previewBtn);

    // Should show the mobile participant phone preview header
    expect(await screen.findByText('PulseVote Live')).toBeInTheDocument();

    // Toggle back to Editor
    const editorBtn = screen.getByRole('button', { name: /Editor/i });
    fireEvent.click(editorBtn);

    expect(screen.getByText('Question Prompt')).toBeInTheDocument();
  });

  it('adds a new option to a selectable question', async () => {
    render(
      <AuthProvider>
        <PresentationEditor presentation={mockPresentation} onBack={vi.fn()} />
      </AuthProvider>
    );

    expect(await screen.findByDisplayValue('What is a quantum bit called?')).toBeInTheDocument();

    const addOptionBtn = screen.getByRole('button', { name: /Add Option/i });
    fireEvent.click(addOptionBtn);

    expect(screen.getByDisplayValue('Option 3')).toBeInTheDocument();
  });

  it('changes question type when clicking a type button in Settings', async () => {
    render(
      <AuthProvider>
        <PresentationEditor presentation={mockPresentation} onBack={vi.fn()} />
      </AuthProvider>
    );

    expect(await screen.findByDisplayValue('What is a quantum bit called?')).toBeInTheDocument();
    expect(screen.getByText('Slide Settings')).toBeInTheDocument();

    // Click "True / False" type
    const tfTypeBtn = screen.getByRole('button', { name: /True \/ False/i });
    fireEvent.click(tfTypeBtn);

    // Should update canvas to have True and False options
    await waitFor(() => {
      expect(screen.getByDisplayValue('True')).toBeInTheDocument();
      expect(screen.getByDisplayValue('False')).toBeInTheDocument();
    });
  });

  it('adds a new question via the Add Question button', async () => {
    render(
      <AuthProvider>
        <PresentationEditor presentation={mockPresentation} onBack={vi.fn()} />
      </AuthProvider>
    );

    expect(await screen.findByDisplayValue('What is a quantum bit called?')).toBeInTheDocument();

    const addQuestionBtn = screen.getByRole('button', { name: /Add Question/i });
    fireEvent.click(addQuestionBtn);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/presentations/pres-123/questions',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });
});
