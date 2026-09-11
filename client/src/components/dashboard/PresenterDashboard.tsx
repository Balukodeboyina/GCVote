import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { Card } from '../ui/Card.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { PresentationModal, PresentationData } from './PresentationModal.js';
import { DeleteConfirmModal } from './DeleteConfirmModal.js';
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  LogOut,
  FolderOpen,
  User,
} from 'lucide-react';

export interface Presentation {
  id: string;
  title: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export function PresenterDashboard() {
  const { user, token, logout } = useAuth();
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [activePresentation, setActivePresentation] = useState<PresentationData | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [presentationToDelete, setPresentationToDelete] = useState<Presentation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPresentations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/presentations', {
        headers,
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to load presentations.');
      }

      const data = await res.json();
      setPresentations(data.presentations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching presentations.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPresentations();
  }, [fetchPresentations]);

  const handleCreateOpen = () => {
    setModalMode('create');
    setActivePresentation(null);
    setIsModalOpen(true);
  };

  const handleEditOpen = (pres: Presentation) => {
    setModalMode('edit');
    setActivePresentation({
      id: pres.id,
      title: pres.title,
      description: pres.description,
    });
    setIsModalOpen(true);
  };

  const handleDeleteOpen = (pres: Presentation) => {
    setPresentationToDelete(pres);
    setIsDeleteOpen(true);
  };

  const handleSave = async (title: string, description: string) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (modalMode === 'create') {
      const res = await fetch('/api/presentations', {
        method: 'POST',
        headers,
        body: JSON.stringify({ title, description }),
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create presentation.');
      }
    } else if (modalMode === 'edit' && activePresentation?.id) {
      const res = await fetch(`/api/presentations/${activePresentation.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ title, description }),
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update presentation.');
      }
    }

    await fetchPresentations();
  };

  const handleConfirmDelete = async () => {
    if (!presentationToDelete) return;
    setIsDeleting(true);
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/presentations/${presentationToDelete.id}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to delete presentation.');
      }

      setIsDeleteOpen(false);
      setPresentationToDelete(null);
      await fetchPresentations();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error deleting presentation.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Banner: Presenter Info & Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-brand-500/20">
            {user?.name ? user.name[0].toUpperCase() : <User className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{user?.name}</h2>
              <Badge variant="info">Presenter</Badge>
            </div>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchPresentations}
            disabled={loading}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={logout}
            className="text-xs text-slate-300 hover:text-rose-400 hover:bg-rose-950/40"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Stats and Quick Actions Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="flex items-center justify-between p-5 border-slate-800 bg-slate-900/60">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Total Presentations
            </p>
            <h3 className="text-3xl font-extrabold text-white">
              {loading ? '—' : presentations.length}
            </h3>
          </div>
          <div className="p-3 rounded-xl bg-brand-950/80 border border-brand-800/60 text-brand-400">
            <Layers className="w-6 h-6" />
          </div>
        </Card>

        <Card className="flex items-center justify-between p-5 border-slate-800 bg-slate-900/60">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Presenter Role
            </p>
            <h3 className="text-sm font-semibold text-slate-200">
              Verified Presenter Account
            </h3>
            <span className="text-[11px] text-emerald-400 font-medium">● Active Session</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-400">
            <Sparkles className="w-6 h-6" />
          </div>
        </Card>

        <div className="flex items-center justify-center md:justify-end">
          <Button
            variant="primary"
            size="lg"
            onClick={handleCreateOpen}
            className="w-full h-full min-h-[72px] text-base font-semibold shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Presentation
          </Button>
        </div>
      </div>

      {/* Recent Presentations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Recent Presentations</h3>
            <p className="text-xs text-slate-400">
              Manage and organize your interactive presentation sessions
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs flex items-center justify-between">
            <span>{error}</span>
            <Button size="sm" variant="outline" onClick={fetchPresentations}>
              Retry
            </Button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 animate-pulse border-slate-800 bg-slate-900/40">
                <div className="h-5 bg-slate-800 rounded w-2/3 mb-3" />
                <div className="h-3 bg-slate-800 rounded w-full mb-2" />
                <div className="h-3 bg-slate-800 rounded w-1/2 mb-6" />
                <div className="h-8 bg-slate-800 rounded w-full" />
              </Card>
            ))}
          </div>
        ) : presentations.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-slate-800 bg-slate-900/30 flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mb-4">
              <FolderOpen className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-white mb-1">No presentations yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mb-5 leading-relaxed">
              You haven't created any presentations. Click the button below to build your first interactive session.
            </p>
            <Button variant="primary" size="md" onClick={handleCreateOpen} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Presentation
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {presentations.map((pres) => (
              <Card
                key={pres.id}
                className="flex flex-col justify-between p-6 border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-all hover:shadow-xl group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-bold text-base text-white group-hover:text-brand-300 transition-colors line-clamp-1">
                      {pres.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 min-h-[32px] mb-4">
                    {pres.description || 'No description provided.'}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-4 pt-3 border-t border-slate-800/60">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Updated {formatDate(pres.updatedAt)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditOpen(pres)}
                      className="flex-1 text-xs gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteOpen(pres)}
                      className="text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 px-2.5"
                      title="Delete Presentation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Presentation Create/Edit Modal */}
      <PresentationModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={activePresentation}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        presentationTitle={presentationToDelete?.title || ''}
        isDeleting={isDeleting}
        onClose={() => {
          setIsDeleteOpen(false);
          setPresentationToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
