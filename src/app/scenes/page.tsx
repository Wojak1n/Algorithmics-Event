'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '../context/AppContext';
import { ArrowLeft, FileText, Clock, CheckCircle, Circle, Play, Edit } from 'lucide-react';
import { SceneStatus } from '../types';

const statusConfig = {
  'not-started': { icon: Circle, color: 'text-gray-400', bg: 'bg-gray-100 dark:bg-gray-700', label: 'Not Started' },
  'in-progress': { icon: Play, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'In Progress' },
  'rehearsed': { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30', label: 'Rehearsed' },
  'complete': { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30', label: 'Complete' },
};

export default function ScenesPage() {
  const { state, updateSceneStatus } = useApp();
  const [selectedTeam, setSelectedTeam] = useState<string>('all');

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredScenes = selectedTeam === 'all' 
    ? state.event.teams.flatMap(team => 
        (team.scenes || []).map(scene => ({ ...scene, teamName: team.name, teamId: team.id }))
      )
    : state.event.teams
        .filter(team => team.id === selectedTeam)
        .flatMap(team => 
          (team.scenes || []).map(scene => ({ ...scene, teamName: team.name, teamId: team.id }))
        );

  const handleStatusChange = (teamId: string, sceneId: string, status: SceneStatus) => {
    updateSceneStatus(teamId, sceneId, status);
  };

  return (
    <div className={`min-h-screen transition-colors ${state.settings.darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Link
                href="/"
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  Scene Viewer
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  View and manage all scenes across teams
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Filter by Team:</label>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
          >
            <option value="all">All Teams</option>
            {state.event.teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>

        {/* Scenes List */}
        {filteredScenes.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No scenes found</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {selectedTeam === 'all' 
                ? 'No teams have added scenes yet.' 
                : 'This team hasn\'t added any scenes yet.'}
            </p>
            <Link
              href="/teams"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Teams
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredScenes
              .sort((a, b) => a.order - b.order)
              .map((scene) => {
                const StatusIcon = statusConfig[scene.status].icon;
                return (
                  <div key={scene.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold">{scene.title}</h3>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              ({scene.teamName})
                            </span>
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
                            href={`/teams/${scene.teamId}/scenes/${scene.id}`}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>

                      {scene.content && (
                        <div className="mb-4">
                          <p className="text-gray-700 dark:text-gray-300 line-clamp-3">
                            {scene.content.substring(0, 200)}
                            {scene.content.length > 200 && '...'}
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
                                onClick={() => handleStatusChange(scene.teamId, scene.id, status as SceneStatus)}
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
                        <Link
                          href={`/teams/${scene.teamId}/scenes/${scene.id}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View Details →
                        </Link>
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
