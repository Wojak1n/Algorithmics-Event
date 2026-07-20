export interface TeamCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  bgColor: string;
  icon: string;
  createdAt: Date;
}

export interface Team {
  id: string;
  name: string;
  slogan: string;
  projectName: string;
  categoryId: string;
  members: string[];
  scenes: Scene[];
  logoUrl?: string; // Base64 encoded image or URL
  createdAt: Date;
  updatedAt: Date;
}

export interface Scene {
  id: string;
  teamId: string;
  title: string;
  content: string;
  order: number;
  status: SceneStatus;
  duration?: number; // in minutes
  notes?: string;
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SceneStatus = 'not-started' | 'in-progress' | 'rehearsed' | 'complete';

export interface CompetitionEvent {
  id: string;
  name: string;
  year: number;
  description: string;
  teams: Team[];
  categories: TeamCategory[];
}

export interface SearchResult {
  type: 'team' | 'scene';
  item: Team | Scene;
  teamName?: string; // for scene results
}

export interface TimerSession {
  sceneId: string;
  startTime: Date;
  duration: number; // in seconds
  isActive: boolean;
}

export interface AppSettings {
  darkMode: boolean;
  autoSave: boolean;
  defaultSceneDuration: number;
}
