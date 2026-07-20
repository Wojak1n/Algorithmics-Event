'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { processImageFile, getTeamDisplayImage } from '../lib/imageUtils';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string | undefined) => void;
  teamName?: string;
  className?: string;
}

export default function ImageUpload({ 
  currentImage, 
  onImageChange, 
  teamName = 'Team',
  className = '' 
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setIsUploading(true);
    
    try {
      const result = await processImageFile(file, 400, 400, 0.8);
      
      if (result.success && result.data) {
        onImageChange(result.data);
        toast.success('Image uploaded successfully!');
      } else {
        toast.error(result.error || 'Failed to upload image');
      }
    } catch {
      toast.error('Failed to process image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleRemoveImage = () => {
    onImageChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('Image removed');
  };

  const displayImage = getTeamDisplayImage({ name: teamName, logoUrl: currentImage });

  return (
    <div className={`space-y-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Team Logo/Photo
      </label>
      
      {/* Image Preview */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Image
            src={displayImage}
            alt={`${teamName} logo`}
            width={80}
            height={80}
            unoptimized
            className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200 dark:border-gray-600"
          />
          {currentImage && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              title="Remove image"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {currentImage ? 'Current logo' : 'Placeholder (team initials)'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Recommended: Square image, max 5MB
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
        
        <div className="space-y-2">
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Processing image...</p>
            </>
          ) : (
            <>
              <div className="flex justify-center">
                {dragOver ? (
                  <ImageIcon className="h-8 w-8 text-blue-500" />
                ) : (
                  <Upload className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                    Click to upload
                  </span>{' '}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, GIF, WebP up to 5MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Upload className="h-4 w-4" />
          Choose File
        </button>
        
        {currentImage && (
          <button
            type="button"
            onClick={handleRemoveImage}
            disabled={isUploading}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <X className="h-4 w-4" />
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
