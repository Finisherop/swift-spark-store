import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./button";
import { Card } from "./card";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  accept?: Record<string, string[]>;
  className?: string;
}

export function FileUpload({ 
  onFilesChange, 
  maxFiles = 5, 
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
  },
  className 
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
    setFiles(newFiles);
    // Only upload newly added files to avoid re-uploading existing ones
    onFilesChange(acceptedFiles);

    // Create previews for the newly accepted files
    const newPreviews = acceptedFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews].slice(0, maxFiles));
  }, [files, maxFiles, onFilesChange]);

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(previews[index]);
    
    setFiles(newFiles);
    setPreviews(newPreviews);
    onFilesChange(newFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: maxFiles - files.length,
    disabled: files.length >= maxFiles
  });

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <Card
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 hover-scale",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          files.length >= maxFiles && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          
          {isDragActive ? (
            <p className="text-lg font-medium">Drop the images here...</p>
          ) : (
            <div className="space-y-2">
              <p className="text-lg font-medium">
                Drag & drop images here, or click to select
              </p>
              <p className="text-sm text-muted-foreground">
                Support: PNG, JPG, JPEG, GIF, WebP (Max {maxFiles} files)
              </p>
              <p className="text-xs text-muted-foreground">
                {files.length}/{maxFiles} files selected
              </p>
            </div>
          )}
          
          {files.length < maxFiles && (
            <Button type="button" variant="outline" size="sm">
              <ImageIcon className="mr-2 h-4 w-4" />
              Choose Files
            </Button>
          )}
        </div>
      </Card>

      {/* File Previews */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              
              <Button
                type="button"
                size="sm"
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFile(index)}
              >
                <X className="h-3 w-3" />
              </Button>
              
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {files[index].name}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}