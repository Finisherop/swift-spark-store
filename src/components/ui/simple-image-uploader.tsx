import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, Link, Image as ImageIcon, AlertCircle, Check } from 'lucide-react';

interface SimpleImageUploaderProps {
  onImageUpload?: (imageData: { file?: File; url?: string; dataUrl: string }) => void;
  className?: string;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  placeholder?: string;
}

export function SimpleImageUploader({
  onImageUpload,
  className = '',
  maxSizeMB = 5,
  acceptedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  placeholder = 'Drag and drop an image here, or click to select'
}: SimpleImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate file
  const validateFile = (file: File): string | null => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !acceptedFormats.includes(fileExtension)) {
      return `Invalid file format. Accepted: ${acceptedFormats.join(', ')}`;
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return `File size must be less than ${maxSizeMB}MB`;
    }

    if (!file.type.startsWith('image/')) {
      return 'Please select a valid image file';
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = (file: File) => {
    setError('');
    setLoading(true);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);
      setImageUrl('');
      setLoading(false);
      
      if (onImageUpload) {
        onImageUpload({ file, dataUrl });
      }
    };
    reader.onerror = () => {
      setError('Failed to read file');
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  // Handle drag events
  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  // Handle file input change
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  // Handle URL input
  const handleUrlSubmit = () => {
    if (!imageUrl.trim()) return;

    setError('');
    setLoading(true);

    const img = new Image();
    img.onload = () => {
      setImagePreview(imageUrl);
      setLoading(false);
      
      if (onImageUpload) {
        onImageUpload({ url: imageUrl, dataUrl: imageUrl });
      }
    };
    img.onerror = () => {
      setError('Failed to load image from URL');
      setLoading(false);
    };
    img.src = imageUrl;
  };

  // Clear image
  const clearImage = () => {
    setImagePreview('');
    setImageUrl('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Open file dialog
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const baseClasses = `w-full max-w-md mx-auto space-y-4 ${className}`;

  return (
    <div className={baseClasses}>
      {/* Main Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer
          ${dragActive
            ? 'border-blue-500 bg-blue-50 scale-105'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }
          ${loading ? 'pointer-events-none opacity-70' : ''}
          bg-white shadow-sm
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <div className="p-8 text-center">
          {loading ? (
            <div className="space-y-4">
              <div className="w-12 h-12 mx-auto border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-600">Loading image...</p>
            </div>
          ) : imagePreview ? (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-full max-h-48 mx-auto rounded-lg shadow-md object-contain"
                />
                <button
                  type="button"
                  className="absolute -top-2 -right-2 h-8 w-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearImage();
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600">Click to change image</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <Upload className={`h-8 w-8 transition-colors ${
                  dragActive ? 'text-blue-500' : 'text-gray-400'
                }`} />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">
                  {dragActive ? "Drop image here" : placeholder}
                </p>
                <p className="text-sm text-gray-500">
                  Supports: {acceptedFormats.join(', ').toUpperCase()} (Max {maxSizeMB}MB)
                </p>
              </div>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Choose File
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={acceptedFormats.map(format => `.${format}`).join(',')}
        onChange={handleInputChange}
      />

      {/* URL Input Section */}
      <div className="space-y-2">
        <label htmlFor="image-url" className="block text-sm font-medium text-gray-700">
          Or upload from URL
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              id="image-url"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>
          <button
            type="button"
            onClick={handleUrlSubmit}
            disabled={!imageUrl.trim() || loading}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Load
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {imagePreview && !error && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-700 font-medium">Image loaded successfully</p>
        </div>
      )}
    </div>
  );
}