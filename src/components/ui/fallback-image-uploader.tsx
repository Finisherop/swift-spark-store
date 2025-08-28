import { useState } from "react";
import { Button } from "./button";
import { Label } from "./label";
import { Upload, Loader2, AlertCircle, Check, X } from "lucide-react";

interface FallbackImageUploaderProps {
  label: string;
  onUpload: (url: string) => void;
  onError?: (error: string) => void;
  maxSizeMB?: number;
  acceptedFormats?: string[];
}

export function FallbackImageUploader({ 
  label, 
  onUpload,
  onError,
  maxSizeMB = 5,
  acceptedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp']
}: FallbackImageUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [preview, setPreview] = useState<string>("");

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setPreview(dataUrl);
        onUpload(dataUrl);
        setSuccess("Image uploaded successfully!");
        setLoading(false);
      };
      
      reader.onerror = () => {
        throw new Error('Failed to read file');
      };
      
      reader.readAsDataURL(file);
      
    } catch (error: any) {
      console.error('Error uploading file:', error);
      const errorMessage = error?.message || 'Failed to upload image. Please try again.';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
      setLoading(false);
    } finally {
      // Reset file input
      event.target.value = '';
    }
  };

  const clearImage = () => {
    setPreview("");
    setSuccess("");
    setError("");
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
          {loading ? 'Processing...' : 'Choose Image'}
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
        <div className="mt-2">
          <img
            src={preview}
            alt="Preview"
            className="max-w-full h-32 object-cover rounded-lg border"
          />
        </div>
      )}
      
      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-700">{success}</p>
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
      <p className="text-xs text-gray-500">
        Supported formats: {acceptedFormats.join(', ').toUpperCase()} (Max {maxSizeMB}MB)
      </p>
    </div>
  );
}