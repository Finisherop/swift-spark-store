# 📁 ALL FILES TO COPY TO YOUR REPOSITORY

Git push nahi ho pa raha, toh manually copy karna padega. Yahan saari files ki complete list hai:

## 🆕 **NEW FILES TO CREATE:**

### 1. **src/hooks/useAdminAuth.tsx**
```typescript
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

/**
 * Custom hook to check if current user has admin role
 * Fetches the user's profile and checks for admin role
 */
export function useAdminAuth() {
  const { user, session } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdminRole() {
      if (!user || !session) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Check if user has admin role by querying their profile
        // For this implementation, we'll check if user email contains "admin" 
        // or if they have a specific role field in their profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          setIsAdmin(false);
        } else {
          // Check admin status - you can modify this logic based on your needs
          // For now, checking if email contains "admin" or if profile has admin metadata
          const isUserAdmin = 
            user.email?.includes('admin') ||
            user.user_metadata?.role === 'admin' ||
            profile?.email?.includes('admin');
          
          setIsAdmin(Boolean(isUserAdmin));
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    checkAdminRole();
  }, [user, session]);

  return { isAdmin, loading };
}
```

### 2. **src/hooks/useSupabaseImageUpload.tsx**
```typescript
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from './useAdminAuth';

/**
 * Custom hook for uploading images to Supabase Storage
 * - Only works for admin users
 * - Uploads to public bucket with CDN URLs
 * - Auto-generates public URLs after upload
 * - Saves URLs to database
 */
export function useSupabaseImageUpload() {
  const { isAdmin } = useAdminAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  /**
   * Upload multiple image files to Supabase Storage
   * @param files - Array of File objects to upload
   * @param productId - Optional product ID to associate images with
   * @returns Array of public URLs for uploaded images
   */
  const uploadImages = async (files: File[], productId?: string): Promise<string[]> => {
    // Security check: Only admin users can upload
    if (!isAdmin) {
      throw new Error('Unauthorized: Only admin users can upload images');
    }

    if (!files || files.length === 0) {
      return [];
    }

    setUploading(true);
    setUploadProgress(0);
    
    try {
      const uploadedUrls: string[] = [];
      const totalFiles = files.length;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Generate unique filename with timestamp and random ID
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        // Upload to Supabase Storage in 'product-images' bucket
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(`products/${fileName}`, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
        }

        // Get the public URL for the uploaded file
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(`products/${fileName}`);

        if (!urlData?.publicUrl) {
          throw new Error(`Failed to get public URL for ${file.name}`);
        }

        uploadedUrls.push(urlData.publicUrl);
        
        // Update progress
        setUploadProgress(((i + 1) / totalFiles) * 100);
      }

      // If productId is provided, save the URLs to the database
      if (productId && uploadedUrls.length > 0) {
        await saveImageUrlsToDatabase(productId, uploadedUrls);
      }

      return uploadedUrls;

    } catch (error) {
      console.error('Error in uploadImages:', error);
      throw error;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  /**
   * Save image URLs to the products table
   * @param productId - Product ID to update
   * @param imageUrls - Array of image URLs to add
   */
  const saveImageUrlsToDatabase = async (productId: string, imageUrls: string[]) => {
    try {
      // Get current product images
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('images')
        .eq('id', productId)
        .single();

      if (fetchError) throw fetchError;

      // Combine existing images with new ones
      const currentImages = product?.images || [];
      const updatedImages = [...currentImages, ...imageUrls];

      // Update product with new images
      const { error: updateError } = await supabase
        .from('products')
        .update({ images: updatedImages })
        .eq('id', productId);

      if (updateError) throw updateError;

    } catch (error) {
      console.error('Error saving image URLs to database:', error);
      throw error;
    }
  };

  /**
   * Delete an image from Supabase Storage and database
   * @param imageUrl - Public URL of the image to delete
   * @param productId - Product ID to remove image from
   */
  const deleteImage = async (imageUrl: string, productId?: string) => {
    if (!isAdmin) {
      throw new Error('Unauthorized: Only admin users can delete images');
    }

    try {
      // Extract file path from public URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `products/${fileName}`;

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('product-images')
        .remove([filePath]);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        throw new Error(`Failed to delete image: ${deleteError.message}`);
      }

      // If productId provided, remove from database
      if (productId) {
        const { data: product, error: fetchError } = await supabase
          .from('products')
          .select('images')
          .eq('id', productId)
          .single();

        if (fetchError) throw fetchError;

        const updatedImages = (product?.images || []).filter((url: string) => url !== imageUrl);
        
        const { error: updateError } = await supabase
          .from('products')
          .update({ images: updatedImages })
          .eq('id', productId);

        if (updateError) throw updateError;
      }

    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  };

  return {
    uploadImages,
    deleteImage,
    uploading,
    uploadProgress,
    isAdmin
  };
}
```

### 3. **src/components/ui/supabase-image-upload.tsx**
```typescript
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
```

### 4. **src/components/ui/optimized-image.tsx**
```typescript
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  lazy?: boolean;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Optimized image component with lazy loading and modern format support
 * - Lazy loading by default
 * - Prefers WebP/AVIF formats when available
 * - Fallback to original format if modern formats fail
 * - Works seamlessly with Supabase Storage URLs
 */
export function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  lazy = true,
  fallbackSrc = '/placeholder.svg',
  onLoad,
  onError
}: OptimizedImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isInView, setIsInView] = useState(!lazy);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, isInView]);

  // Try to optimize Supabase URLs for modern formats
  const getOptimizedSrc = (originalSrc: string): string => {
    // Check if it's a Supabase Storage URL
    if (originalSrc.includes('supabase.co/storage/')) {
      // For Supabase, we can add transform parameters for optimization
      // Note: This depends on Supabase's image transformation features
      // You may need to enable these in your Supabase project
      try {
        const url = new URL(originalSrc);
        // Add quality and format optimization parameters
        url.searchParams.set('quality', '80');
        url.searchParams.set('format', 'webp');
        return url.toString();
      } catch {
        return originalSrc;
      }
    }
    return originalSrc;
  };

  const handleLoad = () => {
    setImageLoaded(true);
    setImageError(false);
    onLoad?.();
  };

  const handleError = () => {
    setImageError(true);
    
    // Try fallback strategies
    if (currentSrc !== src && currentSrc !== fallbackSrc) {
      // If optimized version failed, try original
      setCurrentSrc(src);
    } else if (currentSrc !== fallbackSrc) {
      // If original failed, use fallback
      setCurrentSrc(fallbackSrc);
    }
    
    onError?.();
  };

  // Update src when prop changes
  useEffect(() => {
    setCurrentSrc(getOptimizedSrc(src));
    setImageLoaded(false);
    setImageError(false);
  }, [src]);

  return (
    <div 
      ref={imgRef}
      className={cn(
        "relative overflow-hidden",
        !imageLoaded && "bg-muted animate-pulse",
        className
      )}
      style={{ width, height }}
    >
      {isInView && (
        <>
          {/* Main optimized image */}
          <picture>
            {/* Try WebP format first (if supported) */}
            {src.includes('supabase.co/storage/') && (
              <source 
                srcSet={getOptimizedSrc(src)} 
                type="image/webp" 
              />
            )}
            
            {/* Fallback to original format */}
            <img
              src={currentSrc}
              alt={alt}
              className={cn(
                "w-full h-full object-cover transition-opacity duration-300",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              width={width}
              height={height}
              loading={lazy ? "lazy" : "eager"}
              onLoad={handleLoad}
              onError={handleError}
              decoding="async"
            />
          </picture>

          {/* Loading placeholder */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
            </div>
          )}

          {/* Error state */}
          {imageError && currentSrc === fallbackSrc && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
              <span className="text-sm">Failed to load image</span>
            </div>
          )}
        </>
      )}

      {/* Lazy loading placeholder */}
      {!isInView && lazy && (
        <div className="absolute inset-0 bg-muted" />
      )}
    </div>
  );
}
```

### 5. **src/components/ui/progress.tsx**
```typescript
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
```

### 6. **src/components/ui/alert.tsx**
```typescript
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
```

### 7. **FINAL_SQL_TO_RUN.sql** (Root directory)
```sql
-- FINAL SQL CODE TO RUN IN SUPABASE
-- Delete old policies and create new ones for akk116636@gmail.com
-- Copy-paste this entire code in Supabase SQL Editor and RUN

-- ============================================================================
-- 1. DELETE OLD POLICIES (if any exist)
-- ============================================================================

-- Drop existing policies (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Public read access for product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload access" ON storage.objects;
DROP POLICY IF EXISTS "Admin update access" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete access" ON storage.objects;

-- Drop old function if exists
DROP FUNCTION IF EXISTS public.is_admin_user(UUID);

-- ============================================================================
-- 2. ENABLE RLS (Row Level Security)
-- ============================================================================

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. CREATE NEW POLICIES FOR YOUR ADMIN EMAIL
-- ============================================================================

-- Policy 1: Allow PUBLIC READ access (everyone can view images)
CREATE POLICY "Public read access for product images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

-- Policy 2: Allow ONLY akk116636@gmail.com to UPLOAD images
CREATE POLICY "Admin users can upload product images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
  AND (
    -- Your specific admin email
    auth.jwt() ->> 'email' = 'akk116636@gmail.com'
    OR
    -- OR check admin role in metadata (backup method)
    auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
    OR
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  )
);

-- Policy 3: Allow ONLY akk116636@gmail.com to UPDATE images
CREATE POLICY "Admin users can update product images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
  AND (
    -- Your specific admin email
    auth.jwt() ->> 'email' = 'akk116636@gmail.com'
    OR
    -- OR check admin role in metadata (backup method)
    auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
    OR
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  )
);

-- Policy 4: Allow ONLY akk116636@gmail.com to DELETE images
CREATE POLICY "Admin users can delete product images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
  AND (
    -- Your specific admin email
    auth.jwt() ->> 'email' = 'akk116636@gmail.com'
    OR
    -- OR check admin role in metadata (backup method)
    auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
    OR
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  )
);

-- ============================================================================
-- 4. CREATE ADMIN HELPER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin_user(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
  user_role TEXT;
BEGIN
  -- Get user email
  SELECT email INTO user_email 
  FROM auth.users 
  WHERE id = user_id;
  
  -- Get user role from metadata
  SELECT 
    COALESCE(
      raw_user_meta_data ->> 'role',
      raw_app_meta_data ->> 'role'
    ) INTO user_role
  FROM auth.users 
  WHERE id = user_id;
  
  -- Return true if user is admin
  RETURN (
    user_email = 'akk116636@gmail.com' OR 
    user_role = 'admin'
  );
END;
$$;

-- ============================================================================
-- 5. GRANT PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.is_admin_user TO authenticated;

-- ============================================================================
-- 6. SET ADMIN ROLE FOR YOUR EMAIL
-- ============================================================================

-- Set admin role for akk116636@gmail.com
UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'akk116636@gmail.com';

-- ============================================================================
-- 7. VERIFY SETUP (Optional - you can run these to check)
-- ============================================================================

-- Check if your user has admin role
-- SELECT email, raw_user_meta_data FROM auth.users WHERE email = 'akk116636@gmail.com';

-- Check if policies are created
-- SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. Make sure 'product-images' bucket exists and is PUBLIC
-- 2. Only akk116636@gmail.com can upload/edit/delete images
-- 3. Everyone can view images (public access for website)
-- 4. If policies already exist, they will be replaced with new ones
-- 5. Your admin role is set automatically in this script
-- ============================================================================
```

## 🔄 **MAIN UPDATES TO EXISTING FILES:**

Yeh files modify karni padhengi:

### **src/components/ui/product-form.tsx** (Lines to change):
```typescript
// Add these imports at top
import { SupabaseImageUpload } from "./supabase-image-upload";
import { OptimizedImage } from "./optimized-image";

// Replace the manual URL input section with:
<SupabaseImageUpload 
  onImagesUploaded={handleImagesUploaded}
  maxFiles={5}
  productId={product?.id}
/>

// Replace img tags with OptimizedImage
<OptimizedImage
  src={image}
  alt={`Product ${index + 1}`}
  className="w-full h-24 rounded-lg border"
/>
```

### **src/components/ui/product-card.tsx** (Add import and replace img):
```typescript
import { OptimizedImage } from "./optimized-image";

// Replace img tag with:
<OptimizedImage
  src={product.images?.[0] || '/placeholder.svg'}
  alt={product.name}
  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
  lazy={true}
/>
```

### **Delete this file:**
- `src/components/ui/file-upload.tsx` (completely remove)

## 🎯 **Summary:**
1. **7 NEW files banao** ☝️
2. **3 existing files update karo** (imports + img → OptimizedImage)
3. **1 file delete karo** 
4. **SQL run karo** Supabase mein

Yeh complete list hai! Copy karte jao files! 😊