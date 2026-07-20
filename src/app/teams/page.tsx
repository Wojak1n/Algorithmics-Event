'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useApp } from '../context/AppContext';
import { Plus, Users, Edit, Trash2, FileText, ArrowLeft, Filter, Settings, Palette, CheckCircle, Circle } from 'lucide-react';
import CategoryManager from '../components/CategoryManager';
import ImageUpload from '../components/ImageUpload';
import { getTeamDisplayImage } from '../lib/imageUtils';
import { storage } from '../lib/storage';
import toast from 'react-hot-toast';

// LocalStorage keys
const MEMBER_COLORS_STORAGE_KEY = 'algorithmics_member_colors';
const PRESENTATION_STATUS_STORAGE_KEY = 'algorithmics_presentation_status';

// Color options for individual members (matching category color system)
const memberColorOptions = [
  {
    name: 'Blue',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    color: 'text-blue-800 dark:text-blue-300',
    preview: 'bg-blue-500'
  },
  {
    name: 'Green',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    color: 'text-green-800 dark:text-green-300',
    preview: 'bg-green-500'
  },
  {
    name: 'Purple',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    color: 'text-purple-800 dark:text-purple-300',
    preview: 'bg-purple-500'
  },
  {
    name: 'Red',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    color: 'text-red-800 dark:text-red-300',
    preview: 'bg-red-500'
  },
  {
    name: 'Orange',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    color: 'text-orange-800 dark:text-orange-300',
    preview: 'bg-orange-500'
  },
  {
    name: 'Pink',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30',
    color: 'text-pink-800 dark:text-pink-300',
    preview: 'bg-pink-500'
  },
  {
    name: 'Indigo',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
    color: 'text-indigo-800 dark:text-indigo-300',
    preview: 'bg-indigo-500'
  },
  {
    name: 'Teal',
    bgColor: 'bg-teal-100 dark:bg-teal-900/30',
    color: 'text-teal-800 dark:text-teal-300',
    preview: 'bg-teal-500'
  },
];

export default function TeamsPage() {
  const { state, addTeam, deleteTeam, dispatch } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showMemberColorPicker, setShowMemberColorPicker] = useState(false);
  const [selectedMember, setSelectedMember] = useState<{teamId: string, memberIndex: number, memberName: string} | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [draggedTeam, setDraggedTeam] = useState<string | null>(null);
  // Store member colors: teamId -> memberIndex -> colorIndex
  const [memberColors, setMemberColors] = useState<{[teamId: string]: {[memberIndex: number]: number}}>({});
  // Store presentation completion status: teamId -> boolean
  const [presentationStatus, setPresentationStatus] = useState<{[teamId: string]: boolean}>({});
  const [formData, setFormData] = useState({
    name: '',
    slogan: '',
    projectName: '',
    categoryId: '',
    members: [''],
    logoUrl: undefined as string | undefined,
  });

  // Load member colors and presentation status from localStorage on component mount
  useEffect(() => {
    try {
      // Load member colors
      const savedColors = localStorage.getItem(MEMBER_COLORS_STORAGE_KEY);
      if (savedColors) {
        const parsedColors = JSON.parse(savedColors);
        setMemberColors(parsedColors);
      }

      // Load presentation status
      const savedStatus = localStorage.getItem(PRESENTATION_STATUS_STORAGE_KEY);
      if (savedStatus) {
        const parsedStatus = JSON.parse(savedStatus);
        setPresentationStatus(parsedStatus);
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);

  // Safety check for state. This must come after hooks to preserve hook order.
  if (!state?.event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const teams = state.event.teams || [];
  const categories = state.event.categories || [];

  // Function to save member colors to localStorage
  const saveMemberColorsToStorage = (colors: {[teamId: string]: {[memberIndex: number]: number}}) => {
    try {
      localStorage.setItem(MEMBER_COLORS_STORAGE_KEY, JSON.stringify(colors));
    } catch (error) {
      console.error('Error saving member colors to localStorage:', error);
    }
  };

  // Function to save presentation status to localStorage
  const savePresentationStatusToStorage = (status: {[teamId: string]: boolean}) => {
    try {
      localStorage.setItem(PRESENTATION_STATUS_STORAGE_KEY, JSON.stringify(status));
    } catch (error) {
      console.error('Error saving presentation status to localStorage:', error);
    }
  };

  // Note: PPTs are stored as object URLs in component state
  // They will be available during the current session

  const handleAddMember = () => {
    setFormData(prev => ({
      ...prev,
      members: [...prev.members, ''],
    }));
  };

  const handleRemoveMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index),
    }));
  };

  const handleMemberChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.map((member, i) => i === index ? value : member),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.projectName.trim()) {
      toast.error('Team name and project name are required');
      return;
    }

    if (!formData.categoryId) {
      toast.error('Please select a category');
      return;
    }

    const members = formData.members.filter(member => member.trim() !== '');
    if (members.length === 0) {
      toast.error('At least one team member is required');
      return;
    }

    addTeam(formData.name.trim(), formData.slogan.trim(), formData.projectName.trim(), formData.categoryId, members, formData.logoUrl);

    setFormData({
      name: '',
      slogan: '',
      projectName: '',
      categoryId: '',
      members: [''],
      logoUrl: undefined,
    });
    setShowAddForm(false);
    toast.success('Team added successfully!');
  };

  const handleDeleteTeam = (teamId: string, teamName: string) => {
    if (confirm(`Are you sure you want to delete team "${teamName}"? This will also delete all their scenes.`)) {
      deleteTeam(teamId);
      toast.success('Team deleted successfully');
    }
  };

  const togglePresentationStatus = (teamId: string, teamName: string) => {
    const newStatus = {
      ...presentationStatus,
      [teamId]: !presentationStatus[teamId]
    };
    setPresentationStatus(newStatus);
    savePresentationStatusToStorage(newStatus);

    const isCompleted = newStatus[teamId];
    toast.success(`${teamName} marked as ${isCompleted ? 'completed' : 'not completed'}!`);
  };

  const handleDragStart = (e: React.DragEvent, teamId: string) => {
    setDraggedTeam(teamId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetTeamId: string) => {
    e.preventDefault();

    if (!draggedTeam || draggedTeam === targetTeamId) {
      setDraggedTeam(null);
      return;
    }

    const draggedIndex = teams.findIndex(team => team.id === draggedTeam);
    const targetIndex = teams.findIndex(team => team.id === targetTeamId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedTeam(null);
      return;
    }

    // Reorder teams
    const newTeams = [...teams];
    const [draggedTeamData] = newTeams.splice(draggedIndex, 1);
    newTeams.splice(targetIndex, 0, draggedTeamData);

    // Update the event with reordered teams and save to localStorage
    const updatedEvent = {
      ...state.event,
      teams: newTeams
    };

    // Save to localStorage using the proper storage utility
    storage.saveEvent(updatedEvent);

    // Update context state
    dispatch({ type: 'LOAD_DATA', payload: { event: updatedEvent, settings: state.settings } });

    setDraggedTeam(null);
    toast.success('Team order updated and saved!');
  };



  // No need for handlePresentPPT function anymore - using direct links!

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
                  Team Directory
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Manage teams and their information
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Team
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Filter className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Filter by Category:
              </label>
            </div>
            <button
              onClick={() => setShowCategoryManager(true)}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Settings className="h-4 w-4" />
              Manage Categories
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All Categories ({teams.length})
            </button>
            {categories.map(category => {
              const count = (teams || []).filter(team => team.categoryId === category.id).length;
              return (
                <button
                  key={category.id}
                  onClick={() => setCategoryFilter(category.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    categoryFilter === category.id
                      ? `${category.bgColor} ${category.color}`
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category.icon} {category.name} ({count})
                </button>
              );
            })}
            {categories.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                No categories created yet. Click &quot;Manage Categories&quot; to create some!
              </p>
            )}
          </div>
        </div>

        {/* Add Team Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Add New Team</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Team Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                    placeholder="e.g., 404 Killers"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Team Slogan</label>
                  <input
                    type="text"
                    value={formData.slogan}
                    onChange={(e) => setFormData(prev => ({ ...prev, slogan: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                    placeholder="e.g., Debugging the future"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Project Name *</label>
                  <input
                    type="text"
                    value={formData.projectName}
                    onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                    placeholder="e.g., Smart City Management System"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Category *</label>
                  {categories.length === 0 ? (
                    <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                      No categories available. Please create categories first.
                    </div>
                  ) : (
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                    >
                      <option value="">Select a category...</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.icon} {category.name} - {category.description}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <ImageUpload
                  currentImage={formData.logoUrl}
                  onImageChange={(imageUrl) => setFormData(prev => ({ ...prev, logoUrl: imageUrl }))}
                  teamName={formData.name || 'New Team'}
                />

                <div>
                  <label className="block text-sm font-medium mb-1">Team Members *</label>
                  {formData.members.map((member, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={member}
                        onChange={(e) => handleMemberChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                        placeholder={`Member ${index + 1} name`}
                      />
                      {formData.members.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Add Member
                  </button>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Team
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Teams Grid */}
        {teams.length === 0 ? (
          <div className="text-center py-16">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No teams yet</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Get started by adding your first team to the competition.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add First Team
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {teams
              .filter(team => categoryFilter === 'all' || team.categoryId === categoryFilter)
              .map((team) => {
                const category = categories.find(cat => cat.id === team.categoryId);
                return (
                  <div
                    key={team.id}
                    className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-move ${
                      draggedTeam === team.id ? 'opacity-50 scale-95' : ''
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, team.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, team.id)}
                  >
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Image
                      src={getTeamDisplayImage(team)}
                      alt={`${team.name} logo`}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200 dark:border-gray-600 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="mb-3">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 break-words leading-tight">
                          {team.name}
                        </h3>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 break-words">
                          Project: {team.projectName}
                        </p>
                        {category && (
                          <div className="mt-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${category.bgColor} ${category.color}`}>
                              <span className="mr-1">{category.icon}</span>
                              {category.name}
                            </span>
                          </div>
                        )}
                      </div>
                      {team.slogan && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm italic break-words mt-2">
                          &ldquo;{team.slogan}&rdquo;
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Link
                        href={`/teams/${team.id}/edit`}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteTeam(team.id, team.name)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  


                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Members ({(team.members || []).length}):
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {(team.members || []).map((member, index) => {
                        const colorIndex = memberColors[team.id]?.[index] || 0;
                        const selectedColor = memberColorOptions[colorIndex];
                        return (
                          <div key={index} className="relative group">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${selectedColor.bgColor} ${selectedColor.color} break-words`}>
                              <span className="mr-1">👤</span>
                              {member}
                            </span>
                            <button
                              onClick={() => {
                                setSelectedMember({
                                  teamId: team.id,
                                  memberIndex: index,
                                  memberName: member
                                });
                                setShowMemberColorPicker(true);
                              }}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-gray-700 hover:bg-gray-800 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg hover:scale-110"
                              title="Customize color"
                            >
                              <Palette className="h-2 w-2" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <FileText className="h-4 w-4 mr-1" />
                        {(team.scenes || []).length} scenes
                      </div>
                      <Link
                        href={`/teams/${team.id}/scenes`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View Scenes →
                      </Link>
                    </div>
                    {/* Presentation Completion Status */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 text-sm">
                        {presentationStatus[team.id] ? (
                          <span title="Presentation completed">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          </span>
                        ) : (
                          <span title="Presentation not completed">
                            <Circle className="h-5 w-5 text-gray-400" />
                          </span>
                        )}
                        <span className={presentationStatus[team.id] ? "text-green-600 dark:text-green-400 font-medium" : "text-gray-600 dark:text-gray-300"}>
                          {presentationStatus[team.id] ? "Presentation completed" : "Presentation not completed"}
                        </span>
                      </div>
                      <button
                        onClick={() => togglePresentationStatus(team.id, team.name)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          presentationStatus[team.id]
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                        type="button"
                        title="Toggle presentation completion status"
                      >
                        {presentationStatus[team.id] ? "Mark as Not Completed" : "Mark as Completed"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
                );
              })}
          </div>
        )}
      </main>

      {/* Member Color Picker Modal */}
      {showMemberColorPicker && selectedMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-xl dark:bg-gray-900/95 rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-blue-200/50 dark:border-gray-700/50">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-4 shadow-lg">
                <Palette className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Customize Member Color
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Choose a color for <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedMember.memberName}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {memberColorOptions.map((color, index) => {
                const currentColorIndex = memberColors[selectedMember.teamId]?.[selectedMember.memberIndex] || 0;
                return (
                  <button
                    key={color.name}
                    onClick={() => {
                      const newColors = {
                        ...memberColors,
                        [selectedMember.teamId]: {
                          ...memberColors[selectedMember.teamId],
                          [selectedMember.memberIndex]: index
                        }
                      };
                      setMemberColors(newColors);
                      saveMemberColorsToStorage(newColors);
                      toast.success('Member color updated and saved!');
                    }}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                      currentColorIndex === index
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg scale-105'
                        : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-gray-500 hover:shadow-md bg-white/50 dark:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-5 h-5 rounded-full ${color.preview} shadow-sm`}></div>
                      <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">{color.name}</span>
                    </div>
                    <div className="flex justify-center">
                      <span className={`px-2 py-1 ${color.bgColor} ${color.color} text-xs font-medium rounded-full`}>
                        {selectedMember.memberName}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowMemberColorPicker(false);
                  setSelectedMember(null);
                }}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              >
                Apply Color
              </button>
              <button
                onClick={() => {
                  setShowMemberColorPicker(false);
                  setSelectedMember(null);
                }}
                className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2.5 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Manager Modal */}
      <CategoryManager
        isOpen={showCategoryManager}
        onClose={() => setShowCategoryManager(false)}
      />
    </div>
  );
}
