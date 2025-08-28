import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, Link, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Card } from './card';
import { Label } from './label';
import { cn } from '@/lib/utils';

interface AdvancedImageUploaderProps {
  onImageUpload?: (imageData: { file?: File; url?: string; dataUrl: string }) => void;
  className?: string;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  placeholder?: string;
}

export function AdvancedImageUploader({
  onImageUpload,
  className,
  maxSizeMB = 5,
  acceptedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  placeholder = 'Drag and drop an image here, or click to select'
}: AdvancedImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate file
  const validateFile = (file: File): string | null => {
    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !acceptedFormats.includes(fileExtension)) {
      return `Invalid file format. Accepted formats: ${acceptedFormats.join(', ')}`;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return `File size must be less than ${maxSizeMB}MB`;
    }

    // Check if it's actually an image
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
      setImageUrl(''); // Clear URL input when file is uploaded
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
      setError('Failed to load image from URL. Please check the URL and try again.');
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

  return (
    <div className={cn("w-full max-w-md mx-auto space-y-4", className)}>
      {/* Main Upload Area */}
      <Card
        className={cn(
          "relative border-2 border-dashed transition-all duration-200 cursor-pointer",
          dragActive
            ? "border-primary bg-primary/5 scale-105"
            : "border-gray-300 hover:border-primary hover:bg-gray-50",
          loading && "pointer-events-none opacity-70"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <div className="p-8 text-center">
          {loading ? (
            <div className="space-y-4">
              <div className="w-12 h-12 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
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
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearImage();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-600">Click to change image</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <Upload className={cn(
                  "h-8 w-8 transition-colors",
                  dragActive ? "text-primary" : "text-gray-400"
                )} />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">
                  {dragActive ? "Drop image here" : placeholder}
                </p>
                <p className="text-sm text-gray-500">
                  Supports: {acceptedFormats.join(', ').toUpperCase()} (Max {maxSizeMB}MB)
                </p>
              </div>
              <Button type="button" variant="outline" size="sm">
                <ImageIcon className="mr-2 h-4 w-4" />
                Choose File
              </Button>
            </div>
          )}
        </div>
      </Card>

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
        <Label htmlFor="image-url" className="text-sm font-medium">
          Or upload from URL
        </Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="image-url"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="pl-10"
              disabled={loading}
            />
          </div>
          <Button
            type="button"
            onClick={handleUrlSubmit}
            disabled={!imageUrl.trim() || loading}
            variant="outline"
          >
            Load
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Image Info */}
      {imagePreview && !error && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 font-medium">✓ Image loaded successfully</p>
        </div>
      )}
    </div>
  );
}

// Example usage component (optional)
export function ImageUploaderExample() {
  const [uploadedImage, setUploadedImage] = useState<{
    file?: File;
    url?: string;
    dataUrl: string;
  } | null>(null);

  const handleImageUpload = (imageData: { file?: File; url?: string; dataUrl: string }) => {
    setUploadedImage(imageData);
    console.log('Image uploaded:', imageData);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Advanced Image Uploader
        </h2>
        <p className="text-gray-600">
          Upload images via drag & drop, file selection, or URL
        </p>
      </div>

      <AdvancedImageUploader
        onImageUpload={handleImageUpload}
        maxSizeMB={10}
        acceptedFormats={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
        placeholder="Drop your awesome image here!"
      />

      {/* Display uploaded image info */}
      {uploadedImage && (
        <Card className="p-4">
          <h3 className="font-medium mb-2">Uploaded Image Info:</h3>
          <div className="space-y-1 text-sm text-gray-600">
            {uploadedImage.file && (
              <>
                <p><strong>File Name:</strong> {uploadedImage.file.name}</p>
                <p><strong>File Size:</strong> {(uploadedImage.file.size / 1024 / 1024).toFixed(2)} MB</p>
                <p><strong>File Type:</strong> {uploadedImage.file.type}</p>
              </>
            )}
            {uploadedImage.url && (
              <p><strong>URL:</strong> {uploadedImage.url}</p>
            )}
            <p><strong>Data URL Length:</strong> {uploadedImage.dataUrl.length} characters</p>
          </div>
        </Card>
      )}
    </div>
  );
}