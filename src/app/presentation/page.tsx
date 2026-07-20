'use client';

import { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Play, Pause, RotateCcw, Timer, Maximize, Users, FileText, ChevronLeft, ChevronRight, SkipBack, SkipForward } from 'lucide-react';

function PresentationContent() {
  const { state } = useApp();
  const searchParams = useSearchParams();
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedScene, setSelectedScene] = useState<string>('');
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize from URL parameters
  useEffect(() => {
    const teamParam = searchParams.get('team');
    const sceneParam = searchParams.get('scene');

    if (teamParam) {
      setSelectedTeam(teamParam);
    }
    if (sceneParam) {
      setSelectedScene(sceneParam);
    }
  }, [searchParams]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetTimer = useCallback(() => {
    setTimeElapsed(0);
    setIsTimerActive(false);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Navigation helpers - moved before early return to avoid conditional hook calls
  const selectedTeamData = state.event?.teams?.find(team => team.id === selectedTeam);
  const selectedSceneData = selectedTeamData?.scenes.find(scene => scene.id === selectedScene);
  const sortedScenes = useMemo(
    () => [...(selectedTeamData?.scenes ?? [])].sort((a, b) => a.order - b.order),
    [selectedTeamData?.scenes]
  );
  const currentSceneIndex = sortedScenes.findIndex(scene => scene.id === selectedScene);
  const hasPreviousScene = currentSceneIndex > 0;
  const hasNextScene = currentSceneIndex < sortedScenes.length - 1;

  const goToPreviousScene = useCallback(() => {
    if (hasPreviousScene) {
      const previousScene = sortedScenes[currentSceneIndex - 1];
      setSelectedScene(previousScene.id);
      resetTimer();
    }
  }, [hasPreviousScene, sortedScenes, currentSceneIndex, resetTimer]);

  const goToNextScene = useCallback(() => {
    if (hasNextScene) {
      const nextScene = sortedScenes[currentSceneIndex + 1];
      setSelectedScene(nextScene.id);
      resetTimer();
    }
  }, [hasNextScene, sortedScenes, currentSceneIndex, resetTimer]);

  const goToFirstScene = useCallback(() => {
    if (sortedScenes.length > 0) {
      setSelectedScene(sortedScenes[0].id);
      resetTimer();
    }
  }, [sortedScenes, resetTimer]);

  const goToLastScene = useCallback(() => {
    if (sortedScenes.length > 0) {
      setSelectedScene(sortedScenes[sortedScenes.length - 1].id);
      resetTimer();
    }
  }, [sortedScenes, resetTimer]);

  // Keyboard navigation
  useEffect(() => {
    if (!selectedSceneData) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goToPreviousScene();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNextScene();
          break;
        case ' ':
          e.preventDefault();
          setIsTimerActive(!isTimerActive);
          break;
        case 'r':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            resetTimer();
          }
          break;
        case 'f':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            toggleFullscreen();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [selectedSceneData, isTimerActive, goToPreviousScene, goToNextScene, resetTimer, toggleFullscreen]);

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors ${state.settings.darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} ${isFullscreen ? 'bg-black text-white' : ''}`}>
      {!isFullscreen && (
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
                    Presentation Mode
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Practice and present scenes with timer
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className={`${isFullscreen ? 'p-8' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
        {!selectedSceneData ? (
          <div className="space-y-8">
            {/* Team Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Select Team</h2>
              {state.event.teams.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">No teams available</p>
                  <Link
                    href="/teams"
                    className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Teams
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {state.event.teams.map(team => (
                    <button
                      key={team.id}
                      onClick={() => {
                        setSelectedTeam(team.id);
                        setSelectedScene('');
                      }}
                      className={`p-4 rounded-lg border-2 transition-colors text-left ${
                        selectedTeam === team.id
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                      }`}
                    >
                      <h3 className="font-semibold">{team.name}</h3>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-1">
                        Project: {team.projectName}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        {(team.scenes || []).length} scenes
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Scene Selection */}
            {selectedTeamData && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold">
                    Select Scene from {selectedTeamData.name}
                  </h2>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-1">
                    Project: {selectedTeamData.projectName}
                  </p>
                </div>
                {(selectedTeamData.scenes || []).length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">No scenes available</p>
                    <Link
                      href={`/teams/${selectedTeamData.id}/scenes`}
                      className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Scenes
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(selectedTeamData.scenes || [])
                      .sort((a, b) => a.order - b.order)
                      .map(scene => (
                        <button
                          key={scene.id}
                          onClick={() => setSelectedScene(scene.id)}
                          className={`w-full p-4 rounded-lg border-2 transition-colors text-left ${
                            selectedScene === scene.id
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">{scene.title}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                Status: {scene.status.replace('-', ' ')}
                                {scene.duration && ` • ${scene.duration} min`}
                              </p>
                            </div>
                            <Play className="h-5 w-5 text-blue-600" />
                          </div>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Presentation View */
          <div className={`${isFullscreen ? 'h-screen flex flex-col' : ''}`}>
            {/* Timer Controls */}
            <div className={`${isFullscreen ? 'mb-8' : 'mb-6'} flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm`}>
              <div className="flex items-center gap-4">
                {!isFullscreen && (
                  <button
                    onClick={() => {
                      setSelectedScene('');
                      resetTimer();
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Back to scene selection"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                )}

                {/* Scene Navigation */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToFirstScene}
                    disabled={currentSceneIndex <= 0}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="First scene"
                  >
                    <SkipBack className="h-4 w-4" />
                  </button>

                  <button
                    onClick={goToPreviousScene}
                    disabled={!hasPreviousScene}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Previous scene (←)"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <span className="text-sm text-gray-600 dark:text-gray-300 px-2">
                    {currentSceneIndex + 1} / {sortedScenes.length}
                  </span>

                  <button
                    onClick={goToNextScene}
                    disabled={!hasNextScene}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Next scene (→)"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  <button
                    onClick={goToLastScene}
                    disabled={currentSceneIndex >= sortedScenes.length - 1}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Last scene"
                  >
                    <SkipForward className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <Timer className="h-5 w-5 text-blue-600" />
                  <span className={`font-mono font-bold ${isFullscreen ? 'text-2xl' : 'text-xl'}`}>
                    {formatTime(timeElapsed)}
                  </span>
                  {selectedSceneData.duration && (
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      / {selectedSceneData.duration} min
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTimerActive(!isTimerActive)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isTimerActive
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isTimerActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isTimerActive ? 'Pause' : 'Start'}
                </button>
                
                <button
                  onClick={resetTimer}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
                
                <button
                  onClick={toggleFullscreen}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Maximize className="h-4 w-4" />
                  {isFullscreen ? 'Exit' : 'Fullscreen'}
                </button>
              </div>
            </div>

            {/* Scene Content */}
            <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 ${isFullscreen ? 'flex-1 overflow-y-auto' : ''}`}>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h1 className={`font-bold text-blue-600 dark:text-blue-400 ${isFullscreen ? 'text-4xl' : 'text-3xl'}`}>
                    {selectedSceneData.title}
                  </h1>
                  {!isFullscreen && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Scene {currentSceneIndex + 1} of {sortedScenes.length}
                    </div>
                  )}
                </div>
                <div className={`mt-2 ${isFullscreen ? 'text-xl' : ''}`}>
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">{selectedTeamData?.name}</span>
                  </p>
                  <p className="text-blue-600 dark:text-blue-400 font-medium">
                    Project: {selectedTeamData?.projectName}
                  </p>
                </div>

                {/* Scene Progress Indicator */}
                {sortedScenes.length > 1 && (
                  <div className="mt-4">
                    <div className="flex items-center gap-1">
                      {sortedScenes.map((scene, index) => (
                        <button
                          key={scene.id}
                          onClick={() => {
                            setSelectedScene(scene.id);
                            resetTimer();
                          }}
                          className={`h-2 rounded-full transition-all duration-200 ${
                            index === currentSceneIndex
                              ? 'bg-blue-600 dark:bg-blue-400 w-8'
                              : index < currentSceneIndex
                              ? 'bg-green-500 dark:bg-green-400 w-4'
                              : 'bg-gray-300 dark:bg-gray-600 w-4'
                          } hover:scale-110`}
                          title={`${scene.title} ${index < currentSceneIndex ? '(completed)' : index === currentSceneIndex ? '(current)' : '(upcoming)'}`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>Scene Progress</span>
                      <span>{currentSceneIndex + 1} / {sortedScenes.length}</span>
                    </div>
                  </div>
                )}

                {/* Keyboard shortcuts hint */}
                {!isFullscreen && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <strong>Keyboard shortcuts:</strong> ← → Navigate scenes • Space Play/Pause • Ctrl+R Reset • Ctrl+F Fullscreen
                    </p>
                  </div>
                )}
              </div>
              
              {selectedSceneData.content ? (
                <div className={`prose dark:prose-invert max-w-none ${isFullscreen ? 'prose-lg' : ''}`}>
                  <div className="whitespace-pre-wrap">
                    {selectedSceneData.content}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">
                    No script content available for this scene.
                  </p>
                </div>
              )}
              
              {selectedSceneData.notes && (
                <div className={`mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg ${isFullscreen ? 'text-lg' : ''}`}>
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                    Notes:
                  </h3>
                  <p className="text-yellow-700 dark:text-yellow-200">
                    {selectedSceneData.notes}
                  </p>
                </div>
              )}

              {/* Bottom Navigation */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <button
                    onClick={goToPreviousScene}
                    disabled={!hasPreviousScene}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      hasPreviousScene
                        ? 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    } ${isFullscreen ? 'text-lg px-6 py-3' : ''}`}
                  >
                    <ChevronLeft className={`${isFullscreen ? 'h-6 w-6' : 'h-4 w-4'}`} />
                    {hasPreviousScene ? (
                      <div>
                        <div className="font-medium">Previous: {sortedScenes[currentSceneIndex - 1]?.title}</div>
                        <div className="text-xs opacity-75">{selectedTeamData?.name} - {selectedTeamData?.projectName}</div>
                      </div>
                    ) : (
                      <span>No previous scene</span>
                    )}
                  </button>

                  <div className={`text-center ${isFullscreen ? 'text-lg' : 'text-sm'} text-gray-600 dark:text-gray-400`}>
                    Scene {currentSceneIndex + 1} of {sortedScenes.length}
                  </div>

                  <button
                    onClick={goToNextScene}
                    disabled={!hasNextScene}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      hasNextScene
                        ? 'bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    } ${isFullscreen ? 'text-lg px-6 py-3' : ''}`}
                  >
                    {hasNextScene ? (
                      <div>
                        <div className="font-medium">Next: {sortedScenes[currentSceneIndex + 1]?.title}</div>
                        <div className="text-xs opacity-75">{selectedTeamData?.name} - {selectedTeamData?.projectName}</div>
                      </div>
                    ) : (
                      <span>No next scene</span>
                    )}
                    <ChevronRight className={`${isFullscreen ? 'h-6 w-6' : 'h-4 w-4'}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function PresentationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    }>
      <PresentationContent />
    </Suspense>
  );
}
