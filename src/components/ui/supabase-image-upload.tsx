import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./button";
import { Card } from "./card";
import { X, Upload, Image as ImageIcon, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSupabaseImageUpload } from "@/hooks/useSupabaseImageUpload";
import { Alert, AlertDescription } from "./alert";
import { Progress } from "./progress";

interface SupabaseImageUploadProps {
  onImagesUploaded: (urls: string[]) => void;
  maxFiles?: number;
  className?: string;
  productId?: string; // Optional: auto-save to product
}

/**
 * Modern drag & drop image upload component for Supabase Storage
 * - Admin users only
 * - Uploads directly to Supabase public bucket
 * - Auto-generates CDN public URLs
 * - Shows upload progress and previews
 * - Optimized for WebP/AVIF formats with fallback
 */
export function SupabaseImageUpload({ 
  onImagesUploaded, 
  maxFiles = 5, 
  className,
  productId
}: SupabaseImageUploadProps) {
  const { uploadImages, uploading, uploadProgress, isAdmin } = useSupabaseImageUpload();
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [error, setError] = useState<string>('');

  // Only allow image files, prefer modern formats
  const acceptedFileTypes = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.svg']
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError('');
    
    // Validate file types and sizes
    const validFiles = acceptedFiles.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      if (!isValidType) {
        setError(`${file.name} is not a valid image file`);
        return false;
      }
      if (!isValidSize) {
        setError(`${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    const newFiles = [...files, ...validFiles].slice(0, maxFiles);
    setFiles(newFiles);

    // Create previews for new files
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews].slice(0, maxFiles));
  }, [files, maxFiles]);

  const removeFile = (index: number) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(previews[index]);
    
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    setFiles(newFiles);
    setPreviews(newPreviews);
    setError('');
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setError('');
    
    try {
      // Upload files to Supabase Storage
      const urls = await uploadImages(files, productId);
      
      // Store uploaded URLs
      setUploadedUrls(prev => [...prev, ...urls]);
      
      // Notify parent component
      onImagesUploaded(urls);
      
      // Clear files and previews after successful upload
      previews.forEach(preview => URL.revokeObjectURL(preview));
      setFiles([]);
      setPreviews([]);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxFiles: maxFiles - files.length,
    disabled: files.length >= maxFiles || uploading || !isAdmin
  });

  // Show access denied for non-admin users
  if (!isAdmin) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Access denied. Only admin users can upload images.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Uploading to Supabase...</span>
            <span className="text-sm text-muted-foreground">{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      {/* Drop Zone */}
      <Card
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 hover:border-primary/50",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          (files.length >= maxFiles || uploading) && "opacity-50 cursor-not-allowed",
          uploading && "pointer-events-none"
        )}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            {uploading ? (
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            ) : (
              <Upload className="h-8 w-8 text-primary" />
            )}
          </div>
          
          {isDragActive ? (
            <p className="text-lg font-medium">Drop the images here...</p>
          ) : (
            <div className="space-y-2">
              <p className="text-lg font-medium">
                Drag & drop images here, or click to select
              </p>
              <p className="text-sm text-muted-foreground">
                Support: PNG, JPG, JPEG, GIF, WebP, AVIF, SVG (Max {maxFiles} files, 10MB each)
              </p>
              <p className="text-xs text-muted-foreground">
                Images will be uploaded to Supabase Storage with public CDN URLs
              </p>
              <p className="text-xs text-muted-foreground">
                {files.length}/{maxFiles} files selected
              </p>
            </div>
          )}
          
          {files.length < maxFiles && !uploading && (
            <Button type="button" variant="outline" size="sm">
              <ImageIcon className="mr-2 h-4 w-4" />
              Choose Files
            </Button>
          )}
        </div>
      </Card>

      {/* File Previews */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                
                {!uploading && (
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
                
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {files[index].name}
                </p>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          <Button 
            onClick={handleUpload} 
            disabled={uploading || files.length === 0}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading to Supabase...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload {files.length} Image{files.length !== 1 ? 's' : ''} to Supabase
              </>
            )}
          </Button>
        </div>
      )}

      {/* Recently Uploaded URLs */}
      {uploadedUrls.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-green-800">Recently Uploaded:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {uploadedUrls.map((url, index) => (
              <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={url}
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}