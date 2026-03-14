import React, { useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface PhotoUploadProps {
  label: string;
  currentUrl?: string | null;
  userId: string;
  index: number;
  onUploaded: (url: string) => void;
  onRemoved?: () => void;
}

export default function PhotoUpload({ label, currentUrl, userId, index, onUploaded, onRemoved }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Sync currentUrl changes
  React.useEffect(() => {
    if (currentUrl) setPreview(currentUrl);
  }, [currentUrl]);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) return; // 5MB limit

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);

    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${userId}/${Date.now()}_${index}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(path);

      setPreview(publicUrl);
      onUploaded(publicUrl);
    } catch (err) {
      console.error('Upload error:', err);
      setPreview(currentUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
    onRemoved?.();
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div
        className={cn(
          'relative flex h-40 w-40 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors',
          dragOver ? 'border-primary bg-primary/5' : 'border-border bg-muted/30 hover:border-muted-foreground/40'
        )}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {uploading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {preview ? (
          <>
            <img src={preview} alt={label} className="h-full w-full object-cover" />
            {!uploading && (
              <button
                type="button"
                className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm hover:bg-destructive/90"
                onClick={(e) => { e.stopPropagation(); handleRemove(); }}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <Upload className="h-5 w-5" />
            <span className="text-xs">Foto wählen</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
