import { useState } from "react";
import { Button } from "./button";
import { Label } from "./label";
import { Upload, Loader2, AlertCircle, Check, X, Cloud, HardDrive } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface EnhancedSupabaseUploaderProps {
  label: string;
  onUpload: (url: string) => void;
  bucket?: string;
  path?: string;
  enableFallback?: boolean;
  maxSizeMB?: number;
  acceptedFormats?: string[];
}

export function EnhancedSupabaseUploader({ 
  label, 
  onUpload, 
  bucket = "product-images",
  path = "uploads",
  enableFallback = true,
  maxSizeMB = 5,
  acceptedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp']
}: EnhancedSupabaseUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [preview, setPreview] = useState<string>("");
  const [uploadMethod, setUploadMethod] = useState<"storage" | "base64" | null>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !acceptedFormats.includes(fileExtension)) {
      return `Invalid file format. Accepted: ${acceptedFormats.join(', ')}`;
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

  // Try to upload to Supabase Storage
  const uploadToSupabase = async (file: File): Promise<string | null> => {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      // Upload file to Supabase storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.warn('Supabase storage upload failed:', error);
      return null;
    }
  };

  // Convert to base64 as fallback
  const convertToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");
    setSuccess("");
    setUploadMethod(null);

    try {
      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      let uploadUrl: string | null = null;

      // Try Supabase storage first
      try {
        uploadUrl = await uploadToSupabase(file);
        if (uploadUrl) {
          setUploadMethod("storage");
          setSuccess("Image uploaded to cloud storage successfully!");
        }
      } catch (storageError) {
        console.warn('Storage upload failed, trying fallback...', storageError);
      }

      // Fallback to base64 if Supabase failed
      if (!uploadUrl && enableFallback) {
        uploadUrl = await convertToBase64(file);
        if (uploadUrl) {
          setUploadMethod("base64");
          setSuccess("Image processed successfully (local storage)!");
        }
      }

      if (!uploadUrl) {
        throw new Error('Failed to upload image. Storage service unavailable.');
      }

      setPreview(uploadUrl);
      onUpload(uploadUrl);
      
    } catch (error: any) {
      console.error('Error uploading file:', error);
      
      let errorMessage = 'Failed to upload image. ';
      
      if (error?.message?.includes('new row violates row-level security')) {
        errorMessage += 'Permission denied. Using local storage instead.';
        
        if (enableFallback) {
          // Try fallback
          try {
            const base64Url = await convertToBase64(file);
            setPreview(base64Url);
            onUpload(base64Url);
            setUploadMethod("base64");
            setSuccess("Image processed successfully (local storage)!");
            return;
          } catch (fallbackError) {
            errorMessage += ' Fallback also failed.';
          }
        }
      } else if (error?.message?.includes('The resource was not found')) {
        errorMessage += 'Storage bucket not found.';
      } else if (error?.message?.includes('exceeded')) {
        errorMessage += 'File too large. Please choose a smaller image.';
      } else if (error?.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const clearImage = () => {
    setPreview("");
    setSuccess("");
    setError("");
    setUploadMethod(null);
  };

  return (
    <div className="space-y-3">
      <Label htmlFor={`file-upload-${label}`}>{label}</Label>
      
      {/* Upload Button */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={() => document.getElementById(`file-upload-${label}`)?.click()}
          className="relative"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          {loading ? 'Uploading...' : 'Upload Image'}
        </Button>
        
        {preview && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearImage}
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
        
        <input
          id={`file-upload-${label}`}
          type="file"
          accept={acceptedFormats.map(format => `.${format}`).join(',')}
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Preview */}
      {preview && (
        <div className="mt-2 relative">
          <img
            src={preview}
            alt="Preview"
            className="max-w-full h-32 object-cover rounded-lg border"
          />
          {uploadMethod && (
            <div className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm">
              {uploadMethod === "storage" ? (
                <Cloud className="h-3 w-3 text-blue-500" />
              ) : (
                <HardDrive className="h-3 w-3 text-gray-500" />
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
          <div className="flex items-center gap-2">
            <p className="text-sm text-green-700">{success}</p>
            {uploadMethod === "storage" && <Cloud className="h-3 w-3 text-green-600" />}
            {uploadMethod === "base64" && <HardDrive className="h-3 w-3 text-green-600" />}
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Info */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>Supported formats: {acceptedFormats.join(', ').toUpperCase()} (Max {maxSizeMB}MB)</p>
        {enableFallback && (
          <p>Auto-fallback to local storage if cloud upload fails</p>
        )}
      </div>
    </div>
  );
}