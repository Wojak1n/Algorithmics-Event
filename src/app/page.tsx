'use client';

import Link from "next/link";
import { useApp } from "./context/AppContext";
import { Users, FileText, Search, Timer, Moon, Sun } from "lucide-react";
import DataManager from "./components/DataManager";

export default function Home() {
  const { state, updateSettings } = useApp();

  const handleDataImported = () => {
    // Reload the app state after data import
    window.location.reload();
  };

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Safety check for state
  if (!state?.event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const teams = state.event.teams || [];
  const categories = state.event.categories || [];

  const toggleDarkMode = () => {
    updateSettings({ darkMode: !state.settings.darkMode });
  };



  return (
    <div className={`min-h-screen transition-colors ${state.settings.darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                Algorithmics Script Manager
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {state.event.name}
              </p>
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {state.settings.darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Welcome to the Competition Script Manager
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Organize, manage, and present your team scripts with ease. Track progress,
            rehearse scenes, and ensure every presentation is perfectly prepared for the
            Algorithmics IT Competition 2025.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{teams.length}</p>
                <p className="text-gray-600 dark:text-gray-300">Teams Registered</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-600 dark:text-green-400" />
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {state.event.teams.reduce((total, team) => total + team.scenes.length, 0)}
                </p>
                <p className="text-gray-600 dark:text-gray-300">Total Scenes</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <Timer className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {state.event.teams.reduce((total, team) =>
                    total + team.scenes.filter(scene => scene.status === 'complete').length, 0
                  )}
                </p>
                <p className="text-gray-600 dark:text-gray-300">Completed Scenes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        {teams.length > 0 && categories.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-center mb-8">Teams by Category</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.map(category => {
                const count = teams.filter(team => team.categoryId === category.id).length;
                if (count === 0) return null;

                return (
                  <div key={category.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm text-center">
                    <div className="text-2xl mb-2">{category.icon}</div>
                    <div className={`text-2xl font-bold mb-1 ${category.color}`}>{count}</div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{category.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/teams" className="group">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group-hover:scale-105 transform transition-transform">
              <Users className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Team Directory</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Manage teams, add members, and organize project information.
              </p>
            </div>
          </Link>

          <Link href="/scenes" className="group">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group-hover:scale-105 transform transition-transform">
              <FileText className="h-12 w-12 text-green-600 dark:text-green-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Scene Viewer</h3>
              <p className="text-gray-600 dark:text-gray-300">
                View and edit scripts, track rehearsal progress, and manage scenes.
              </p>
            </div>
          </Link>

          <Link href="/search" className="group">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group-hover:scale-105 transform transition-transform">
              <Search className="h-12 w-12 text-purple-600 dark:text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Search & Filter</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Quickly find specific teams or scenes across all projects.
              </p>
            </div>
          </Link>

          <Link href="/presentation" className="group">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group-hover:scale-105 transform transition-transform">
              <Timer className="h-12 w-12 text-orange-600 dark:text-orange-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Presentation Mode</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Practice with timers and present scenes in full-screen mode.
              </p>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        {teams.length === 0 && (
          <div className="mt-16 text-center">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-8">
              <h3 className="text-2xl font-semibold mb-4">Get Started</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                No teams have been added yet. Start by creating your first team or load sample data to explore the features.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/teams"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Add Your First Team
                </Link>

              </div>
            </div>
          </div>
        )}

        {/* Data Management Section */}
        <div className="mt-16">
          <DataManager onDataImported={handleDataImported} />
        </div>
      </main>
    </div>
  );
}
