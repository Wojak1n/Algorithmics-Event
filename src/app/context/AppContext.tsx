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
      return { ...state, event: newEvent };

    case 'UPDATE_TEAM':
      const updatedTeams = state.event.teams.map(team =>
        team.id === action.payload.id
          ? { ...team, ...action.payload.updates, updatedAt: new Date() }
          : team
      );
      const updatedEvent = { ...state.event, teams: updatedTeams };
      return { ...state, event: updatedEvent };

    case 'DELETE_TEAM':
      const filteredTeams = state.event.teams.filter(team => team.id !== action.payload);
      const eventAfterDelete = { ...state.event, teams: filteredTeams };
      return { ...state, event: eventAfterDelete };

    case 'ADD_SCENE':
      const teamsWithNewScene = state.event.teams.map(team =>
        team.id === action.payload.teamId
          ? { ...team, scenes: [...team.scenes, action.payload.scene], updatedAt: new Date() }
          : team
      );
      const eventWithNewScene = { ...state.event, teams: teamsWithNewScene };
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
      return { ...state, event: eventWithStatusUpdate };

    case 'ADD_CATEGORY':
      const eventWithNewCategory = {
        ...state.event,
        categories: [...state.event.categories, action.payload]
      };
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
      return {
        ...state,
        event: eventWithUpdatedCategory,
      };

    case 'DELETE_CATEGORY':
      const eventWithoutCategory = {
        ...state.event,
        categories: state.event.categories.filter(cat => cat.id !== action.payload)
      };
      return {
        ...state,
        event: eventWithoutCategory,
      };

    case 'UPDATE_SETTINGS':
      const newSettings = { ...state.settings, ...action.payload };
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
  addTeam: (name: string, slogan: string, projectName: string, categoryId: string, members: string[], logoUrl?: string) => Promise<void>;
  addCategory: (name: string, description: string, color: string, bgColor: string, icon: string) => Promise<void>;
  updateCategory: (id: string, updates: Partial<TeamCategory>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  updateTeam: (id: string, updates: Partial<Team>) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
  addScene: (teamId: string, title: string, content?: string) => Promise<void>;
  updateScene: (teamId: string, sceneId: string, updates: Partial<Scene>) => Promise<void>;
  deleteScene: (teamId: string, sceneId: string) => Promise<void>;
  updateSceneStatus: (teamId: string, sceneId: string, status: SceneStatus) => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const commitEvent = async (event: CompetitionEvent) => {
    await storage.saveEventToDatabase(event);
    dispatch({ type: 'LOAD_DATA', payload: { event, settings: state.settings } });
  };

  const commitSettings = async (settings: AppSettings) => {
    await storage.saveSettingsToDatabase(settings, state.event);
    dispatch({ type: 'LOAD_DATA', payload: { event: state.event, settings } });
  };

  useEffect(() => {
    const loadData = async () => {
      const remote = await storage.hydrateFromRemote();
      const event = remote.event;
      const settings = remote.settings;

      const safeEvent = {
        ...event,
        teams: event.teams || [],
        categories: event.categories || [],
      };

      dispatch({ type: 'LOAD_DATA', payload: { event: safeEvent, settings } });
    };

    void loadData();
  }, []);

  // Helper functions
  const addTeam = async (name: string, slogan: string, projectName: string, categoryId: string, members: string[], logoUrl?: string) => {
    const newTeam = createNewTeam(name, slogan, projectName, categoryId, members, logoUrl);
    await commitEvent({ ...state.event, teams: [...state.event.teams, newTeam] });
  };

  const addCategory = async (name: string, description: string, color: string, bgColor: string, icon: string) => {
    const newCategory = createNewCategory(name, description, color, bgColor, icon);
    await commitEvent({ ...state.event, categories: [...state.event.categories, newCategory] });
  };

  const updateCategory = async (id: string, updates: Partial<TeamCategory>) => {
    await commitEvent({
      ...state.event,
      categories: state.event.categories.map(category => category.id === id ? { ...category, ...updates } : category),
    });
  };

  const deleteCategory = async (id: string) => {
    await commitEvent({ ...state.event, categories: state.event.categories.filter(category => category.id !== id) });
  };

  const updateTeam = async (id: string, updates: Partial<Team>) => {
    await commitEvent({
      ...state.event,
      teams: state.event.teams.map(team => team.id === id ? { ...team, ...updates, updatedAt: new Date() } : team),
    });
  };

  const deleteTeam = async (id: string) => {
    await commitEvent({ ...state.event, teams: state.event.teams.filter(team => team.id !== id) });
  };

  const addScene = async (teamId: string, title: string, content: string = '') => {
    const team = state.event.teams.find(t => t.id === teamId);
    const order = team ? (team.scenes ? team.scenes.length : 0) : 0;
    const newScene = createNewScene(teamId, title, content, order);
    await commitEvent({
      ...state.event,
      teams: state.event.teams.map(item => item.id === teamId
        ? { ...item, scenes: [...item.scenes, newScene], updatedAt: new Date() }
        : item),
    });
  };

  const updateScene = async (teamId: string, sceneId: string, updates: Partial<Scene>) => {
    await commitEvent({
      ...state.event,
      teams: state.event.teams.map(team => team.id === teamId ? {
        ...team,
        updatedAt: new Date(),
        scenes: team.scenes.map(scene => scene.id === sceneId ? { ...scene, ...updates, updatedAt: new Date() } : scene),
      } : team),
    });
  };

  const deleteScene = async (teamId: string, sceneId: string) => {
    await commitEvent({
      ...state.event,
      teams: state.event.teams.map(team => team.id === teamId ? {
        ...team,
        updatedAt: new Date(),
        scenes: team.scenes.filter(scene => scene.id !== sceneId),
      } : team),
    });
  };

  const updateSceneStatus = async (teamId: string, sceneId: string, status: SceneStatus) => {
    const now = new Date();
    const updatedEvent: CompetitionEvent = {
      ...state.event,
      teams: state.event.teams.map(team =>
        team.id === teamId
          ? {
              ...team,
              updatedAt: now,
              scenes: team.scenes.map(scene =>
                scene.id === sceneId
                  ? { ...scene, status, updatedAt: now }
                  : scene
              ),
            }
          : team
      ),
    };

    await commitEvent(updatedEvent);
  };

  const updateSettings = async (updates: Partial<AppSettings>) => {
    await commitSettings({ ...state.settings, ...updates });
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
