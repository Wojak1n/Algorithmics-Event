'use client';

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TeamCategory } from '../types';
import { Plus, Trash2, Palette, X, Edit2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const PRESET_COLORS = [
  { color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  { color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  { color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  { color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30' },
  { color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
  { color: 'text-pink-600', bgColor: 'bg-pink-100 dark:bg-pink-900/30' },
  { color: 'text-indigo-600', bgColor: 'bg-indigo-100 dark:bg-indigo-900/30' },
  { color: 'text-teal-600', bgColor: 'bg-teal-100 dark:bg-teal-900/30' },
  { color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
  { color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-700' },
];

const PRESET_ICONS = ['👨‍💻', '🎨', '🚀', '✨', '🌐', '📊', '📱', '🎮', '🔒', '🤖', '⚡', '🎯', '🔥', '💡', '🏆'];

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CategoryManager({ isOpen, onClose }: CategoryManagerProps) {
  const { state, addCategory, deleteCategory, updateCategory } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    icon: '👨‍💻',
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    icon: '👨‍💻',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    // Check for duplicate names
    if (state.event.categories.some(cat => cat.name.toLowerCase() === formData.name.toLowerCase())) {
      toast.error('Category name already exists');
      return;
    }

    addCategory(
      formData.name.trim(),
      formData.description.trim(),
      formData.color,
      formData.bgColor,
      formData.icon
    );

    setFormData({
      name: '',
      description: '',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      icon: '👨‍💻',
    });
    setShowAddForm(false);
    toast.success('Category created successfully!');
  };

  const handleEditStart = (category: TeamCategory) => {
    setEditingCategory(category.id);
    setEditFormData({
      name: category.name,
      description: category.description,
      color: category.color,
      bgColor: category.bgColor,
      icon: category.icon,
    });
  };

  const handleEditCancel = () => {
    setEditingCategory(null);
    setEditFormData({
      name: '',
      description: '',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      icon: '👨‍💻',
    });
  };

  const handleEditSubmit = (categoryId: string) => {
    if (!editFormData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    // Check for duplicate names (excluding current category)
    const existingCategory = state.event.categories.find(
      cat => cat.name.toLowerCase() === editFormData.name.trim().toLowerCase() && cat.id !== categoryId
    );
    if (existingCategory) {
      toast.error('A category with this name already exists');
      return;
    }

    updateCategory(categoryId, {
      name: editFormData.name.trim(),
      description: editFormData.description.trim(),
      color: editFormData.color,
      bgColor: editFormData.bgColor,
      icon: editFormData.icon,
    });

    setEditingCategory(null);
    toast.success('Category updated successfully!');
  };

  const handleDelete = (category: TeamCategory) => {
    // Check if any teams use this category
    const teamsUsingCategory = state.event.teams.filter(team => team.categoryId === category.id);
    
    if (teamsUsingCategory.length > 0) {
      toast.error(`Cannot delete category "${category.name}" - it's being used by ${teamsUsingCategory.length} team(s)`);
      return;
    }

    if (confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
      deleteCategory(category.id);
      toast.success('Category deleted successfully!');
    }
  };

  const selectColor = (color: string, bgColor: string) => {
    setFormData(prev => ({ ...prev, color, bgColor }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Manage Categories</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Add Category Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add New Category
            </button>
          </div>

          {/* Add Category Form */}
          {showAddForm && (
            <form onSubmit={handleSubmit} className="mb-8 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                    placeholder="e.g., Senior Programmers"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                    placeholder="e.g., Advanced programming projects"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Color Theme</label>
                  <div className="grid grid-cols-5 gap-2">
                    {PRESET_COLORS.map((preset, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectColor(preset.color, preset.bgColor)}
                        className={`w-8 h-8 rounded-full border-2 ${preset.bgColor} ${
                          formData.color === preset.color ? 'border-gray-800 dark:border-white' : 'border-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Icon</label>
                  <div className="grid grid-cols-5 gap-2">
                    {PRESET_ICONS.map((icon, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, icon }))}
                        className={`w-8 h-8 text-lg flex items-center justify-center rounded border-2 ${
                          formData.icon === icon ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Preview</label>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${formData.bgColor} ${formData.color}`}>
                  {formData.icon} {formData.name || 'Category Name'}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create Category
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Categories List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Existing Categories ({state.event.categories.length})</h3>
            
            {state.event.categories.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No categories created yet.</p>
                <p className="text-sm">Create your first category to organize teams!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {state.event.categories.map((category) => {
                  const teamsCount = state.event.teams.filter(team => team.categoryId === category.id).length;
                  const isEditing = editingCategory === category.id;

                  return (
                    <div key={category.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      {isEditing ? (
                        // Simple Edit Form
                        <div className="space-y-4 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                          <div>
                            <label className="block text-sm font-medium mb-1">Category Name *</label>
                            <input
                              type="text"
                              value={editFormData.name}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800"
                              placeholder="Enter category name"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                              value={editFormData.description}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800"
                              rows={2}
                              placeholder="Enter category description"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Colors</label>
                            <div className="grid grid-cols-3 gap-2">
                              {PRESET_COLORS.map((preset, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => setEditFormData(prev => ({
                                    ...prev,
                                    color: preset.color,
                                    bgColor: preset.bgColor
                                  }))}
                                  className={`p-2 rounded-lg border-2 transition-colors ${
                                    editFormData.color === preset.color && editFormData.bgColor === preset.bgColor
                                      ? 'border-blue-500'
                                      : 'border-gray-200 dark:border-gray-600'
                                  }`}
                                >
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${preset.bgColor} ${preset.color}`}>
                                    Sample
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Icon</label>
                            <div className="grid grid-cols-6 gap-2">
                              {PRESET_ICONS.map((icon, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => setEditFormData(prev => ({ ...prev, icon }))}
                                  className={`p-2 rounded-lg border-2 transition-colors ${
                                    editFormData.icon === icon
                                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                                  }`}
                                >
                                  <span className="text-lg">{icon}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Preview</label>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${editFormData.bgColor} ${editFormData.color}`}>
                              {editFormData.icon} {editFormData.name || 'Category Name'}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditSubmit(category.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <Save className="h-4 w-4" />
                              Save Changes
                            </button>
                            <button
                              type="button"
                              onClick={handleEditCancel}
                              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                              <X className="h-4 w-4" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Display Mode
                        <>
                          <div className="flex items-start justify-between mb-2">
                            <span className={`px-2 py-1 rounded-full text-sm font-medium ${category.bgColor} ${category.color}`}>
                              {category.icon} {category.name}
                            </span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEditStart(category)}
                                className="text-blue-500 hover:text-blue-700 p-1"
                                title="Edit category"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(category)}
                                className="text-red-500 hover:text-red-700 p-1"
                                title="Delete category"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {category.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                              {category.description}
                            </p>
                          )}

                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {teamsCount} team{teamsCount !== 1 ? 's' : ''} using this category
                          </p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
