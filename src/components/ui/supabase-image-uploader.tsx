import { useState } from "react";
import { Button } from "./button";
import { Label } from "./label";
import { Upload, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SupabaseImageUploaderProps {
  label: string;
  onUpload: (url: string) => void;
  bucket?: string;
  path?: string;
}

export function SupabaseImageUploader({ 
  label, 
  onUpload, 
  bucket = "product-images",
  path = "uploads"
}: SupabaseImageUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Create bucket if it doesn't exist
  const ensureBucketExists = async (bucketName: string) => {
    try {
      // Try to get bucket info first
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.warn('Could not list buckets:', listError);
        return false;
      }

      const bucketExists = buckets?.some(b => b.name === bucketName);
      
      if (!bucketExists) {
        // Try to create the bucket
        const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          allowedMimeTypes: ['image/*'],
          fileSizeLimit: 10 * 1024 * 1024 // 10MB
        });
        
        if (createError) {
          console.warn('Could not create bucket:', createError);
          return false;
        }
        
        console.log('Bucket created successfully:', data);
      }
      
      return true;
    } catch (error) {
      console.warn('Error ensuring bucket exists:', error);
      return false;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 10MB');
      }

      // Ensure bucket exists
      await ensureBucketExists(bucket);

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

      onUpload(publicUrl);
      setError("");
    } catch (error: any) {
      console.error('Error uploading file:', error);
      
      let errorMessage = 'Failed to upload image. ';
      
      if (error?.message?.includes('new row violates row-level security')) {
        errorMessage += 'Permission denied. Please contact administrator to setup storage access.';
      } else if (error?.message?.includes('The resource was not found')) {
        errorMessage += 'Storage bucket not found. Please contact administrator to setup storage.';
      } else if (error?.message?.includes('exceeded')) {
        errorMessage += 'File too large. Please choose a smaller image.';
      } else if (error?.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again or contact support.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={`file-upload-${label}`}>{label}</Label>
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
        <input
          id={`file-upload-${label}`}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}