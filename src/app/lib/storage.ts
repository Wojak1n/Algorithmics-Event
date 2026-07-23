import { Team, Scene, CompetitionEvent, AppSettings, TeamCategory } from '../types';
import { isSupabaseConfigured, supabase } from './supabase';

const STORAGE_KEYS = {
  COMPETITION_EVENT: 'algorithmics_competition_event',
  APP_SETTINGS: 'algorithmics_app_settings',
} as const;

const TABLE_NAME = 'competition_event';

const normalizeEvent = (event: Partial<CompetitionEvent> | null | undefined): CompetitionEvent => {
  const baseEvent: CompetitionEvent = {
    id: 'algorithmics-2025',
    name: 'Algorithmics IT Competition 2025',
    year: 2025,
    description: 'Annual programming competition showcasing innovative projects and presentations',
    teams: [],
    categories: [],
    ...event,
  };

  return {
    ...baseEvent,
    teams: Array.isArray(baseEvent.teams) ? baseEvent.teams : [],
    categories: Array.isArray(baseEvent.categories) ? baseEvent.categories : [],
  };
};

const cloneEvent = (event: CompetitionEvent): CompetitionEvent => JSON.parse(JSON.stringify(event));

async function saveToSupabase(event: CompetitionEvent, settings: AppSettings) {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase is not configured. Check your .env.local file.');
  }

  const payload = {
    id: 'default',
    event: cloneEvent(event),
    settings,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from(TABLE_NAME)
    .upsert(payload, { onConflict: 'id' });

  if (error) {
    throw new Error(`Supabase save failed: ${error.message}`);
  }
}

async function syncToSupabase(event: CompetitionEvent, settings: AppSettings) {
  if (!isSupabaseConfigured() || !supabase) {
    return;
  }

  try {
    await saveToSupabase(event, settings);
  } catch (error) {
    console.error('Error syncing data to Supabase:', error);
  }
}

async function loadFromSupabase(): Promise<{ event: CompetitionEvent; settings: AppSettings } | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase.from(TABLE_NAME).select('*').eq('id', 'default').maybeSingle();

    if (error) {
      console.error('Error loading from Supabase:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      event: normalizeEvent(data.event as Partial<CompetitionEvent>),
      settings: data.settings as AppSettings,
    };
  } catch (error) {
    console.error('Error loading from Supabase:', error);
    return null;
  }
}

// Default data
const DEFAULT_EVENT: CompetitionEvent = {
  id: 'algorithmics-2025',
  name: 'Algorithmics IT Competition 2025',
  year: 2025,
  description: 'Annual programming competition showcasing innovative projects and presentations',
  teams: [],
  categories: [],
};

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false,
  autoSave: true,
  defaultSceneDuration: 5,
};

// Storage utilities
export const storage = {
  // Competition Event
  getEvent: (): CompetitionEvent => {
    if (typeof window === 'undefined') return DEFAULT_EVENT;

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COMPETITION_EVENT);
      if (stored) {
        const parsed = JSON.parse(stored);
        const safeTeams = Array.isArray(parsed.teams) ? parsed.teams : [];
        parsed.teams = safeTeams.map((team: Team & { createdAt?: string | Date; updatedAt?: string | Date; scenes?: (Scene & { createdAt?: string | Date; updatedAt?: string | Date })[] }) => {
          const scenesArr = Array.isArray(team.scenes) ? team.scenes : [];
          return {
            ...team,
            createdAt: team.createdAt ? new Date(team.createdAt as string) : new Date(),
            updatedAt: team.updatedAt ? new Date(team.updatedAt as string) : new Date(),
            scenes: scenesArr.map((scene: Scene & { createdAt?: string | Date; updatedAt?: string | Date }) => ({
              ...scene,
              createdAt: scene.createdAt ? new Date(scene.createdAt as string) : new Date(),
              updatedAt: scene.updatedAt ? new Date(scene.updatedAt as string) : new Date(),
            })),
          } as Team;
        });
        parsed.categories = Array.isArray(parsed.categories) ? parsed.categories : [];
        return normalizeEvent(parsed);
      }
    } catch (error) {
      console.error('Error loading event data:', error);
    }

    return DEFAULT_EVENT;
  },

  saveEvent: (event: CompetitionEvent): void => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEYS.COMPETITION_EVENT, JSON.stringify(event));
      void syncToSupabase(event, storage.getSettings());
    } catch (error) {
      console.error('Error saving event data:', error);
    }
  },

  // App Settings
  getSettings: (): AppSettings => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }

    return DEFAULT_SETTINGS;
  },

  saveSettings: (settings: AppSettings): void => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
      const event = storage.getEvent();
      void syncToSupabase(event, settings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  },

  // Clear all data
  clearAll: (): void => {
    if (typeof window === 'undefined') return;

    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });

    if (isSupabaseConfigured() && supabase) {
      void supabase.from(TABLE_NAME).delete().eq('id', 'default');
    }
  },

  // Data export/import for backup and recovery
  exportData: () => {
    if (typeof window === 'undefined') return null;

    const event = storage.getEvent();
    const settings = storage.getSettings();

    return {
      event,
      settings,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
  },

  importData: async (data: { event?: CompetitionEvent; settings?: AppSettings }): Promise<boolean> => {
    if (typeof window === 'undefined') return false;

    if (!data.event || typeof data.event !== 'object') {
      throw new Error('The backup file does not contain valid event data.');
    }

    const event = normalizeEvent(data.event);
    const settings = { ...DEFAULT_SETTINGS, ...(data.settings || {}) };

    // Confirm the remote write before replacing the browser's local copy.
    await saveToSupabase(event, settings);

    localStorage.setItem(STORAGE_KEYS.COMPETITION_EVENT, JSON.stringify(event));
    localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
    return true;
  },

  hydrateFromRemote: async () => {
    if (typeof window === 'undefined') return false;

    try {
      const remoteData = await loadFromSupabase();
      if (!remoteData) {
        return false;
      }

      const event = normalizeEvent(remoteData.event);
      const settings = remoteData.settings || DEFAULT_SETTINGS;

      localStorage.setItem(STORAGE_KEYS.COMPETITION_EVENT, JSON.stringify(event));
      localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Error hydrating remote data:', error);
      return false;
    }
  },

  // Check if data exists
  hasData: () => {
    if (typeof window === 'undefined') return false;
    const event = storage.getEvent();
    return event.teams.length > 0 || event.categories.length > 0;
  },

  // Load sample data for quick start
  loadSampleData: () => {
    if (typeof window === 'undefined') return false;

    try {
      const event = storage.getEvent();

      // Create sample categories
      const categories = [
        createNewCategory('Web Development', 'Modern web applications and websites', 'text-blue-800', 'bg-blue-100', '🌐'),
        createNewCategory('Mobile Apps', 'iOS and Android applications', 'text-green-800', 'bg-green-100', '📱'),
        createNewCategory('AI & Machine Learning', 'Artificial intelligence and ML projects', 'text-purple-800', 'bg-purple-100', '🤖'),
        createNewCategory('Game Development', 'Video games and interactive experiences', 'text-red-800', 'bg-red-100', '🎮'),
        createNewCategory('Data Science', 'Data analysis and visualization projects', 'text-yellow-800', 'bg-yellow-100', '📊'),
      ];

      // Create sample teams
      const teams = [
        createNewTeam('Code Warriors', 'Coding the future, one line at a time', 'E-Commerce Platform', categories[0].id, ['Alice Johnson', 'Bob Smith', 'Carol Davis']),
        createNewTeam('Tech Innovators', 'Innovation through technology', 'Fitness Tracking App', categories[1].id, ['David Wilson', 'Emma Brown', 'Frank Miller']),
        createNewTeam('AI Pioneers', 'Pioneering the AI revolution', 'Smart Chatbot Assistant', categories[2].id, ['Grace Lee', 'Henry Taylor', 'Ivy Chen']),
        createNewTeam('Game Masters', 'Creating immersive gaming experiences', '2D Puzzle Adventure', categories[3].id, ['Jack Anderson', 'Kate Thompson', 'Leo Garcia']),
        createNewTeam('Data Wizards', 'Turning data into insights', 'Sales Analytics Dashboard', categories[4].id, ['Maya Patel', 'Noah Rodriguez', 'Olivia Kim']),
      ];

      // Add sample scenes to each team
      teams.forEach((team) => {
        const scenes = [
          createNewScene(team.id, 'Project Introduction', 'Welcome and overview of our project goals and objectives.', 1, 3),
          createNewScene(team.id, 'Problem Statement', 'Detailed explanation of the problem we are solving.', 2, 4),
          createNewScene(team.id, 'Solution Overview', 'Our innovative approach and solution architecture.', 3, 5),
          createNewScene(team.id, 'Technical Implementation', 'Deep dive into the technical aspects and code.', 4, 6),
          createNewScene(team.id, 'Demo & Results', 'Live demonstration and results showcase.', 5, 7),
          createNewScene(team.id, 'Future Plans', 'Next steps and future development roadmap.', 6, 3),
        ];
        team.scenes = scenes;
      });

      const updatedEvent = {
        ...event,
        teams,
        categories,
      };

      storage.saveEvent(updatedEvent);
      return true;
    } catch (error) {
      console.error('Error loading sample data:', error);
      return false;
    }
  },
};

// Utility functions for data manipulation
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const createNewTeam = (
  name: string,
  slogan: string,
  projectName: string,
  categoryId: string,
  members: string[],
  logoUrl?: string
): Team => {
  const now = new Date();
  return {
    id: generateId(),
    name,
    slogan,
    projectName,
    categoryId,
    members,
    scenes: [],
    logoUrl,
    createdAt: now,
    updatedAt: now,
  };
};

export const createNewScene = (
  teamId: string,
  title: string,
  content: string = '',
  order: number = 0,
  duration?: number
): Scene => {
  const now = new Date();
  return {
    id: generateId(),
    teamId,
    title,
    content,
    order,
    duration,
    status: 'not-started',
    createdAt: now,
    updatedAt: now,
  };
};

export const createNewCategory = (
  name: string,
  description: string,
  color: string,
  bgColor: string,
  icon: string
): TeamCategory => {
  const now = new Date();
  return {
    id: generateId(),
    name,
    description,
    color,
    bgColor,
    icon,
    createdAt: now,
  };
};
