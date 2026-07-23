'use client';

import { useState } from 'react';
import { Download, Upload, Database, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { storage } from '../lib/storage';
import toast from 'react-hot-toast';

interface DataManagerProps {
  onDataImported?: () => void;
}

export default function DataManager({ onDataImported }: DataManagerProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportData = () => {
    setIsExporting(true);
    
    try {
      const data = storage.exportData();
      if (!data) {
        toast.error('No data to export');
        return;
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `algorithmics-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        if (await storage.importData(data)) {
          toast.success('Data imported and saved to Supabase!');
          onDataImported?.();
        } else {
          toast.error('Failed to import data');
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Invalid file format';
        toast.error(message);
        console.error('Import error:', error);
      } finally {
        setIsImporting(false);
      }
    };

    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      storage.clearAll();
      toast.success('All data cleared');
      onDataImported?.();
    }
  };

  const handleLoadSampleData = () => {
    if (hasData && !confirm('This will overwrite existing data. Continue?')) {
      return;
    }

    if (storage.loadSampleData()) {
      toast.success('Sample data loaded successfully!');
      onDataImported?.();
    } else {
      toast.error('Failed to load sample data');
    }
  };

  const hasData = storage.hasData();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <Database className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold">Data Management</h2>
      </div>

      <div className="space-y-4">
        {/* Data Status */}
        <div className={`p-4 rounded-lg ${hasData ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'}`}>
          <div className="flex items-center gap-2">
            {hasData ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-800 dark:text-green-300 font-medium">
                  Data Found: {storage.getEvent().teams.length} teams, {storage.getEvent().categories.length} categories
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="text-yellow-800 dark:text-yellow-300 font-medium">
                  No data found - Import your backup or create new data
                </span>
              </>
            )}
          </div>
        </div>

        {/* Export Data */}
        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Export Data</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Download your teams, categories, and scenes as a backup file
            </p>
          </div>
          <button
            onClick={handleExportData}
            disabled={isExporting || !hasData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isExporting ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Export
          </button>
        </div>

        {/* Import Data */}
        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Import Data</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Restore your data from a previously exported backup file
            </p>
          </div>
          <label className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition-colors">
            {isImporting ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              disabled={isImporting}
              className="hidden"
            />
          </label>
        </div>

        {/* Load Sample Data */}
        <div className="flex items-center justify-between p-4 border border-purple-200 dark:border-purple-600 rounded-lg bg-purple-50 dark:bg-purple-900/20">
          <div>
            <h3 className="font-medium text-purple-900 dark:text-purple-300">Load Sample Data</h3>
            <p className="text-sm text-purple-600 dark:text-purple-400">
              Quick start with 5 sample teams, categories, and scenes
            </p>
          </div>
          <button
            onClick={handleLoadSampleData}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Database className="h-4 w-4" />
            Load Sample
          </button>
        </div>

        {/* Clear Data */}
        <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-600 rounded-lg bg-red-50 dark:bg-red-900/20">
          <div>
            <h3 className="font-medium text-red-900 dark:text-red-300">Clear All Data</h3>
            <p className="text-sm text-red-600 dark:text-red-400">
              Permanently delete all teams, categories, and scenes
            </p>
          </div>
          <button
            onClick={handleClearData}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <AlertTriangle className="h-4 w-4" />
            Clear All
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Data Recovery Instructions:</h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• If you had data on port 3000, it&apos;s stored separately from port 3001</li>
          <li>• Export your data regularly to avoid losing it during development</li>
          <li>• Import files must be valid JSON exports from this application</li>
          <li>• Importing will overwrite existing data</li>
        </ul>
      </div>
    </div>
  );
}
