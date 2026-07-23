'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useApp } from '../../../../context/AppContext';
import { ArrowLeft, Save, Clock, FileText } from 'lucide-react';
import { Scene, SceneStatus } from '../../../../types';
import toast from 'react-hot-toast';

const statusOptions: { value: SceneStatus; label: string }[] = [
  { value: 'not-started', label: 'Not Started' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'rehearsed', label: 'Rehearsed' },
  { value: 'complete', label: 'Complete' },
];

export default function SceneEditPage() {
  const params = useParams();
  const teamId = params.teamId as string;
  const sceneId = params.sceneId as string;
  const { state, updateScene } = useApp();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: 'not-started' as SceneStatus,
    duration: '',
    notes: '',
  });

  const [hasChanges, setHasChanges] = useState(false);

  const team = state.event.teams.find(t => t.id === teamId);
  const scene = team?.scenes.find(s => s.id === sceneId);

  useEffect(() => {
    if (scene) {
      setFormData({
        title: scene.title,
        content: scene.content,
        status: scene.status,
        duration: scene.duration?.toString() || '',
        notes: scene.notes || '',
      });
    }
  }, [scene]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Scene title is required');
      return;
    }

    const updates: Partial<Scene> = {
      title: formData.title.trim(),
      content: formData.content,
      status: formData.status,
      notes: formData.notes || undefined,
    };

    if (formData.duration) {
      const duration = parseInt(formData.duration);
      if (!isNaN(duration) && duration > 0) {
        updates.duration = duration;
      }
    }

    try {
      await updateScene(teamId, sceneId, updates);
      setHasChanges(false);
      toast.success('Scene saved to database!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save scene');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!team || !scene) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Scene not found</h2>
          <Link
            href="/teams"
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Teams
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors ${state.settings.darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`} onKeyDown={handleKeyDown}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Link
                href={`/teams/${teamId}/scenes`}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  Edit Scene
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  {team.name} - Project: {team.projectName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {hasChanges && (
                <span className="text-sm text-yellow-600 dark:text-yellow-400">
                  Unsaved changes
                </span>
              )}
              <button
                onClick={handleSave}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="h-5 w-5 mr-2" />
                Save (Ctrl+S)
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium mb-2">Scene Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                placeholder="Enter scene title"
              />
            </div>

            {/* Script Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium">Script Content</label>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <FileText className="h-4 w-4" />
                  {formData.content.length} characters
                </div>
              </div>
              <textarea
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                className="w-full h-96 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 font-mono text-sm resize-none"
                placeholder="Enter your script content here..."
              />
            </div>

            {/* Notes */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                placeholder="Add any notes or reminders for this scene..."
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                Duration (minutes)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                placeholder="5"
                min="1"
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href={`/presentation?team=${teamId}&scene=${sceneId}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  Present Scene
                </Link>
                
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(formData.content);
                    toast.success('Script copied to clipboard!');
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Copy Script
                </button>
              </div>
            </div>

            {/* Scene Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Scene Info</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Created:</span>
                  <br />
                  <span className="text-gray-600 dark:text-gray-400">
                    {scene.createdAt.toLocaleDateString()} {scene.createdAt.toLocaleTimeString()}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Last Updated:</span>
                  <br />
                  <span className="text-gray-600 dark:text-gray-400">
                    {scene.updatedAt.toLocaleDateString()} {scene.updatedAt.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
