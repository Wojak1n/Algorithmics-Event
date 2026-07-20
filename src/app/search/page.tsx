'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Search, Users, FileText, X } from 'lucide-react';
import { Team, Scene } from '../types';

interface SearchResult {
  type: 'team' | 'scene';
  item: Team | Scene;
  teamName?: string;
  teamId?: string;
}

export default function SearchPage() {
  const { state } = useApp();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'teams' | 'scenes'>('all');

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const results: SearchResult[] = [];
    const searchTerm = query.toLowerCase();

    // Search teams
    if (filter === 'all' || filter === 'teams') {
      state.event.teams.forEach(team => {
        const matchesName = team.name.toLowerCase().includes(searchTerm);
        const matchesSlogan = team.slogan.toLowerCase().includes(searchTerm);
        const matchesProject = team.projectName.toLowerCase().includes(searchTerm);
        const matchesMembers = team.members.some(member => 
          member.toLowerCase().includes(searchTerm)
        );

        if (matchesName || matchesSlogan || matchesProject || matchesMembers) {
          results.push({
            type: 'team',
            item: team,
          });
        }
      });
    }

    // Search scenes
    if (filter === 'all' || filter === 'scenes') {
      state.event.teams.forEach(team => {
        team.scenes.forEach(scene => {
          const matchesTitle = scene.title.toLowerCase().includes(searchTerm);
          const matchesContent = scene.content.toLowerCase().includes(searchTerm);
          const matchesNotes = scene.notes?.toLowerCase().includes(searchTerm);

          if (matchesTitle || matchesContent || matchesNotes) {
            results.push({
              type: 'scene',
              item: scene,
              teamName: team.name,
              teamId: team.id,
            });
          }
        });
      });
    }

    return results;
  }, [query, filter, state.event.teams]);

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
                href="/"
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  Search & Filter
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Find teams and scenes quickly
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search teams, scenes, members, or content..."
                className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'teams', label: 'Teams' },
                { value: 'scenes', label: 'Scenes' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setFilter(value as typeof filter)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search Results */}
        {!query.trim() ? (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Start searching</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Enter a search term to find teams, scenes, or content across all projects.
            </p>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No results found</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Try adjusting your search terms or filters.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
            </div>
            
            {searchResults.map((result, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  {result.type === 'team' ? (
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          <div>
                            <h3 className="text-xl font-semibold">{(result.item as Team).name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Team</p>
                          </div>
                        </div>
                        <Link
                          href={`/teams/${result.item.id}/scenes`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View Team →
                        </Link>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Project: </span>
                          <span className="text-gray-900 dark:text-white">{(result.item as Team).projectName}</span>
                        </div>
                        {(result.item as Team).slogan && (
                          <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Slogan: </span>
                            <span className="text-gray-900 dark:text-white italic">&ldquo;{(result.item as Team).slogan}&rdquo;</span>
                          </div>
                        )}
                        <div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Members: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(result.item as Team).members.map((member, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full"
                              >
                                {member}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Scenes: {(result.item as Team).scenes.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                          <div>
                            <h3 className="text-xl font-semibold">{(result.item as Scene).title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Scene from {result.teamName}
                            </p>
                          </div>
                        </div>
                        <Link
                          href={`/teams/${result.teamId}/scenes/${result.item.id}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View Scene →
                        </Link>
                      </div>
                      
                      {(result.item as Scene).content && (
                        <div className="mb-4">
                          <p className="text-gray-700 dark:text-gray-300 line-clamp-3">
                            {(result.item as Scene).content.substring(0, 300)}
                            {(result.item as Scene).content.length > 300 && '...'}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          (result.item as Scene).status === 'complete' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                          (result.item as Scene).status === 'rehearsed' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                          (result.item as Scene).status === 'in-progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                          'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                        }`}>
                          {(result.item as Scene).status.replace('-', ' ')}
                        </span>
                        {(result.item as Scene).duration && (
                          <span>{(result.item as Scene).duration} min</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
