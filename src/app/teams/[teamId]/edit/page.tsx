'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '../../../context/AppContext';
import { ArrowLeft, Save, Trash2, Plus } from 'lucide-react';
import ImageUpload from '../../../components/ImageUpload';
import toast from 'react-hot-toast';

export default function EditTeamPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.teamId as string;
  const { state, updateTeam } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    slogan: '',
    projectName: '',
    categoryId: '',
    members: [''],
    logoUrl: undefined as string | undefined,
  });

  const teams = state?.event?.teams ?? [];
  const categories = state?.event?.categories ?? [];
  const team = teams.find(t => t.id === teamId);

  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name,
        slogan: team.slogan,
        projectName: team.projectName,
        categoryId: team.categoryId,
        members: (team.members && team.members.length > 0) ? team.members : [''],
        logoUrl: team.logoUrl,
      });
    }
  }, [team]);

  // Safety check for state. This must come after hooks to preserve hook order.
  if (!state?.event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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

    const members = formData.members.filter(member => member.trim() !== '');
    if (members.length === 0) {
      toast.error('At least one team member is required');
      return;
    }

    updateTeam(teamId, {
      name: formData.name.trim(),
      slogan: formData.slogan.trim(),
      projectName: formData.projectName.trim(),
      categoryId: formData.categoryId,
      members,
      logoUrl: formData.logoUrl,
    });
    
    toast.success('Team updated successfully!');
    router.push('/teams');
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
                  Edit Team: {team?.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Project: {team?.projectName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Team Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                placeholder="e.g., 404 Killers"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Team Slogan</label>
              <input
                type="text"
                value={formData.slogan}
                onChange={(e) => setFormData(prev => ({ ...prev, slogan: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                placeholder="e.g., Debugging the future"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Project Name *</label>
              <input
                type="text"
                value={formData.projectName}
                onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                placeholder="e.g., Smart City Management System"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
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
              teamName={formData.name || 'Team'}
            />

            <div>
              <label className="block text-sm font-medium mb-2">Team Members *</label>
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
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                <Plus className="h-4 w-4" />
                Add Member
              </button>
            </div>
            
            <div className="flex gap-3 pt-6">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
              <Link
                href="/teams"
                className="flex-1 flex items-center justify-center gap-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Team Stats */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Team Statistics</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Total Scenes:</span>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{(team.scenes || []).length}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Completed Scenes:</span>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {(team.scenes || []).filter(scene => scene.status === 'complete').length}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Created:</span>
              <p className="text-gray-600 dark:text-gray-400">
                {team.createdAt.toLocaleDateString()}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Last Updated:</span>
              <p className="text-gray-600 dark:text-gray-400">
                {team.updatedAt.toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
