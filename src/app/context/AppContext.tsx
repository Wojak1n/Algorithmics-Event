'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Team, Scene, CompetitionEvent, AppSettings, SceneStatus, TeamCategory } from '../types';
import { storage, createNewTeam, createNewScene, createNewCategory } from '../lib/storage';

interface AppState {
  event: CompetitionEvent;
  settings: AppSettings;
  loading: boolean;
}

type AppAction =
  | { type: 'LOAD_DATA'; payload: { event: CompetitionEvent; settings: AppSettings } }
  | { type: 'ADD_TEAM'; payload: Team }
  | { type: 'UPDATE_TEAM'; payload: { id: string; updates: Partial<Team> } }
  | { type: 'DELETE_TEAM'; payload: string }
  | { type: 'ADD_SCENE'; payload: { teamId: string; scene: Scene } }
  | { type: 'UPDATE_SCENE'; payload: { teamId: string; sceneId: string; updates: Partial<Scene> } }
  | { type: 'DELETE_SCENE'; payload: { teamId: string; sceneId: string } }
  | { type: 'UPDATE_SCENE_STATUS'; payload: { teamId: string; sceneId: string; status: SceneStatus } }
  | { type: 'ADD_CATEGORY'; payload: TeamCategory }
  | { type: 'UPDATE_CATEGORY'; payload: { id: string; updates: Partial<TeamCategory> } }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AppState = {
  event: {
    id: '',
    name: '',
    year: 2025,
    description: '',
    teams: [],
    categories: [],
  },
  settings: {
    darkMode: false,
    autoSave: true,
    defaultSceneDuration: 5,
  },
  loading: true,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOAD_DATA':
      return {
        ...state,
        event: action.payload.event,
        settings: action.payload.settings,
        loading: false,
      };

    case 'ADD_TEAM':
      const newEvent = {
        ...state.event,
        teams: [...state.event.teams, action.payload],
      };
      storage.saveEvent(newEvent);
      return { ...state, event: newEvent };

    case 'UPDATE_TEAM':
      const updatedTeams = state.event.teams.map(team =>
        team.id === action.payload.id
          ? { ...team, ...action.payload.updates, updatedAt: new Date() }
          : team
      );
      const updatedEvent = { ...state.event, teams: updatedTeams };
      storage.saveEvent(updatedEvent);
      return { ...state, event: updatedEvent };

    case 'DELETE_TEAM':
      const filteredTeams = state.event.teams.filter(team => team.id !== action.payload);
      const eventAfterDelete = { ...state.event, teams: filteredTeams };
      storage.saveEvent(eventAfterDelete);
      return { ...state, event: eventAfterDelete };

    case 'ADD_SCENE':
      const teamsWithNewScene = state.event.teams.map(team =>
        team.id === action.payload.teamId
          ? { ...team, scenes: [...team.scenes, action.payload.scene], updatedAt: new Date() }
          : team
      );
      const eventWithNewScene = { ...state.event, teams: teamsWithNewScene };
      storage.saveEvent(eventWithNewScene);
      return { ...state, event: eventWithNewScene };

    case 'UPDATE_SCENE':
      const teamsWithUpdatedScene = state.event.teams.map(team =>
        team.id === action.payload.teamId
          ? {
              ...team,
              scenes: team.scenes.map(scene =>
                scene.id === action.payload.sceneId
                  ? { ...scene, ...action.payload.updates, updatedAt: new Date() }
                  : scene
              ),
              updatedAt: new Date(),
            }
          : team
      );
      const eventWithUpdatedScene = { ...state.event, teams: teamsWithUpdatedScene };
      storage.saveEvent(eventWithUpdatedScene);
      return { ...state, event: eventWithUpdatedScene };

    case 'DELETE_SCENE':
      const teamsWithoutScene = state.event.teams.map(team =>
        team.id === action.payload.teamId
          ? {
              ...team,
              scenes: team.scenes.filter(scene => scene.id !== action.payload.sceneId),
              updatedAt: new Date(),
            }
          : team
      );
      const eventWithoutScene = { ...state.event, teams: teamsWithoutScene };
      storage.saveEvent(eventWithoutScene);
      return { ...state, event: eventWithoutScene };

    case 'UPDATE_SCENE_STATUS':
      const teamsWithStatusUpdate = state.event.teams.map(team =>
        team.id === action.payload.teamId
          ? {
              ...team,
              scenes: team.scenes.map(scene =>
                scene.id === action.payload.sceneId
                  ? { ...scene, status: action.payload.status, updatedAt: new Date() }
                  : scene
              ),
              updatedAt: new Date(),
            }
          : team
      );
      const eventWithStatusUpdate = { ...state.event, teams: teamsWithStatusUpdate };
      storage.saveEvent(eventWithStatusUpdate);
      return { ...state, event: eventWithStatusUpdate };

    case 'ADD_CATEGORY':
      const eventWithNewCategory = {
        ...state.event,
        categories: [...state.event.categories, action.payload]
      };
      storage.saveEvent(eventWithNewCategory);
      return {
        ...state,
        event: eventWithNewCategory,
      };

    case 'UPDATE_CATEGORY':
      const eventWithUpdatedCategory = {
        ...state.event,
        categories: state.event.categories.map(category =>
          category.id === action.payload.id
            ? { ...category, ...action.payload.updates }
            : category
        )
      };
      storage.saveEvent(eventWithUpdatedCategory);
      return {
        ...state,
        event: eventWithUpdatedCategory,
      };

    case 'DELETE_CATEGORY':
      const eventWithoutCategory = {
        ...state.event,
        categories: state.event.categories.filter(cat => cat.id !== action.payload)
      };
      storage.saveEvent(eventWithoutCategory);
      return {
        ...state,
        event: eventWithoutCategory,
      };

    case 'UPDATE_SETTINGS':
      const newSettings = { ...state.settings, ...action.payload };
      storage.saveSettings(newSettings);
      return { ...state, settings: newSettings };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Helper functions
  addTeam: (name: string, slogan: string, projectName: string, categoryId: string, members: string[], logoUrl?: string) => void;
  addCategory: (name: string, description: string, color: string, bgColor: string, icon: string) => void;
  updateCategory: (id: string, updates: Partial<TeamCategory>) => void;
  deleteCategory: (id: string) => void;
  updateTeam: (id: string, updates: Partial<Team>) => void;
  deleteTeam: (id: string) => void;
  addScene: (teamId: string, title: string, content?: string) => void;
  updateScene: (teamId: string, sceneId: string, updates: Partial<Scene>) => void;
  deleteScene: (teamId: string, sceneId: string) => void;
  updateSceneStatus: (teamId: string, sceneId: string, status: SceneStatus) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    // Load data from localStorage on mount
    const event = storage.getEvent();
    const settings = storage.getSettings();

    // Ensure event has required properties
    const safeEvent = {
      ...event,
      teams: event.teams || [],
      categories: event.categories || [],
    };

    dispatch({ type: 'LOAD_DATA', payload: { event: safeEvent, settings } });
  }, []);

  // Helper functions
  const addTeam = (name: string, slogan: string, projectName: string, categoryId: string, members: string[], logoUrl?: string) => {
    const newTeam = createNewTeam(name, slogan, projectName, categoryId, members, logoUrl);
    dispatch({ type: 'ADD_TEAM', payload: newTeam });
  };

  const addCategory = (name: string, description: string, color: string, bgColor: string, icon: string) => {
    const newCategory = createNewCategory(name, description, color, bgColor, icon);
    dispatch({ type: 'ADD_CATEGORY', payload: newCategory });
  };

  const updateCategory = (id: string, updates: Partial<TeamCategory>) => {
    dispatch({ type: 'UPDATE_CATEGORY', payload: { id, updates } });
  };

  const deleteCategory = (id: string) => {
    dispatch({ type: 'DELETE_CATEGORY', payload: id });
  };

  const updateTeam = (id: string, updates: Partial<Team>) => {
    dispatch({ type: 'UPDATE_TEAM', payload: { id, updates } });
  };

  const deleteTeam = (id: string) => {
    dispatch({ type: 'DELETE_TEAM', payload: id });
  };

  const addScene = (teamId: string, title: string, content: string = '') => {
    const team = state.event.teams.find(t => t.id === teamId);
    const order = team ? team.scenes.length : 0;
    const newScene = createNewScene(teamId, title, content, order);
    dispatch({ type: 'ADD_SCENE', payload: { teamId, scene: newScene } });
  };

  const updateScene = (teamId: string, sceneId: string, updates: Partial<Scene>) => {
    dispatch({ type: 'UPDATE_SCENE', payload: { teamId, sceneId, updates } });
  };

  const deleteScene = (teamId: string, sceneId: string) => {
    dispatch({ type: 'DELETE_SCENE', payload: { teamId, sceneId } });
  };

  const updateSceneStatus = (teamId: string, sceneId: string, status: SceneStatus) => {
    dispatch({ type: 'UPDATE_SCENE_STATUS', payload: { teamId, sceneId, status } });
  };

  const updateSettings = (updates: Partial<AppSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: updates });
  };

  const contextValue: AppContextType = {
    state,
    dispatch,
    addTeam,
    updateTeam,
    deleteTeam,
    addScene,
    updateScene,
    deleteScene,
    updateSceneStatus,
    addCategory,
    updateCategory,
    deleteCategory,
    updateSettings,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
