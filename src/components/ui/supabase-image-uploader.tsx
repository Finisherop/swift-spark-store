import { useState } from "react";
import { Button } from "./button";
import { Label } from "./label";
import { Upload, Loader2 } from "lucide-react";
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onUpload(publicUrl);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload image. Please try again.');
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
    </div>
  );
}