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