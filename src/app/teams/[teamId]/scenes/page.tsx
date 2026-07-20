'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useApp } from '../../../context/AppContext';
import { ArrowLeft, Plus, FileText, Edit, Trash2, Clock, CheckCircle, Circle, Play } from 'lucide-react';
import { SceneStatus } from '../../../types';
import toast from 'react-hot-toast';

const statusConfig = {
  'not-started': { icon: Circle, color: 'text-gray-400', bg: 'bg-gray-100 dark:bg-gray-700', label: 'Not Started' },
  'in-progress': { icon: Play, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'In Progress' },
  'rehearsed': { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30', label: 'Rehearsed' },
  'complete': { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30', label: 'Complete' },
};

export default function TeamScenesPage() {
  const params = useParams();
  const teamId = params.teamId as string;
  const { state, addScene, deleteScene, updateSceneStatus } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSceneTitle, setNewSceneTitle] = useState('');

  const team = state.event.teams.find(t => t.id === teamId);

  const handleAddScene = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSceneTitle.trim()) {
      toast.error('Scene title is required');
      return;
    }

    addScene(teamId, newSceneTitle.trim());
    setNewSceneTitle('');
    setShowAddForm(false);
    toast.success('Scene added successfully!');
  };

  const handleDeleteScene = (sceneId: string, sceneTitle: string) => {
    if (confirm(`Are you sure you want to delete scene "${sceneTitle}"?`)) {
      deleteScene(teamId, sceneId);
      toast.success('Scene deleted successfully');
    }
  };

  const handleStatusChange = (sceneId: string, status: SceneStatus) => {
    updateSceneStatus(teamId, sceneId, status);
    toast.success(`Scene status updated to ${status.replace('-', ' ')}`);
  };

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Team not found</h2>
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
    <div className={`min-h-screen transition-colors ${state.settings.darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Link
                href="/teams"
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {team.name} - Scenes
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Project: {team.projectName}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Scene
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Scene Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Add New Scene</h2>
              <form onSubmit={handleAddScene} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Scene Title *</label>
                  <input
                    type="text"
                    value={newSceneTitle}
                    onChange={(e) => setNewSceneTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                    placeholder="e.g., Opening Scene, Scene 1 - Introduction"
                    autoFocus
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Scene
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewSceneTitle('');
                    }}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Scenes List */}
        {team.scenes.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No scenes yet</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Start by adding your first scene for this team.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add First Scene
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {team.scenes
              .sort((a, b) => a.order - b.order)
              .map((scene, index) => {
                const StatusIcon = statusConfig[scene.status].icon;
                return (
                  <div key={scene.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              #{index + 1}
                            </span>
                            <h3 className="text-xl font-semibold">{scene.title}</h3>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusConfig[scene.status].bg}`}>
                              <StatusIcon className={`h-4 w-4 ${statusConfig[scene.status].color}`} />
                              <span className={`text-sm font-medium ${statusConfig[scene.status].color}`}>
                                {statusConfig[scene.status].label}
                              </span>
                            </div>
                            {scene.duration && (
                              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                                <Clock className="h-4 w-4" />
                                {scene.duration} min
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/teams/${teamId}/scenes/${scene.id}`}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteScene(scene.id, scene.title)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {scene.content && (
                        <div className="mb-4">
                          <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
                            {scene.content.substring(0, 150)}
                            {scene.content.length > 150 && '...'}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex gap-2">
                          {Object.entries(statusConfig).map(([status, config]) => {
                            const Icon = config.icon;
                            return (
                              <button
                                key={status}
                                onClick={() => handleStatusChange(scene.id, status as SceneStatus)}
                                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-colors ${
                                  scene.status === status
                                    ? `${config.bg} ${config.color}`
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                                }`}
                              >
                                <Icon className="h-4 w-4" />
                                {config.label}
                              </button>
                            );
                          })}
                        </div>
                        <div className="flex gap-3">
                          <Link
                            href={`/presentation?team=${teamId}&scene=${scene.id}`}
                            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                          >
                            Present →
                          </Link>
                          <Link
                            href={`/teams/${teamId}/scenes/${scene.id}`}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Edit →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </main>
    </div>
  );
}
