import React, { useRef, useState, useCallback } from 'react';
import { Upload, X, Loader2, ZoomIn } from 'lucide-react';
import Cropper, { Area } from 'react-easy-crop';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface PhotoUploadProps {
  label: string;
  currentUrl?: string | null;
  userId: string;
  index: number;
  onUploaded: (url: string) => void;
  onRemoved?: () => void;
}

// Creates a cropped image blob from a source image URL and pixel crop area
function getCroppedImg(imageSrc: string, crop: Area): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('No canvas context'));
      ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
      canvas.toBlob(blob => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      }, 'image/jpeg', 0.92);
    };
    image.onerror = reject;
    image.src = imageSrc;
  });
}

export default function PhotoUpload({ label, currentUrl, userId, index, onUploaded, onRemoved }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Crop state
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [rawImageUrl, setRawImageUrl] = useState<string | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  React.useEffect(() => {
    if (currentUrl) setPreview(currentUrl);
  }, [currentUrl]);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleFileSelected = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) return;

    const localUrl = URL.createObjectURL(file);
    setRawImageUrl(localUrl);
    setRawFile(file);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setCropDialogOpen(true);
  };

  const handleCropConfirm = async () => {
    if (!rawImageUrl || !croppedAreaPixels || !rawFile) return;
    setCropDialogOpen(false);
    setUploading(true);

    try {
      const croppedBlob = await getCroppedImg(rawImageUrl, croppedAreaPixels);
      const ext = rawFile.name.split('.').pop() || 'jpg';
      const path = `${userId}/${Date.now()}_${index}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(path, croppedBlob, { upsert: true, contentType: 'image/jpeg' });

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
      if (rawImageUrl) URL.revokeObjectURL(rawImageUrl);
      setRawImageUrl(null);
      setRawFile(null);
    }
  };

  const handleCropCancel = () => {
    setCropDialogOpen(false);
    if (rawImageUrl) URL.revokeObjectURL(rawImageUrl);
    setRawImageUrl(null);
    setRawFile(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelected(file);
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
          if (file) handleFileSelected(file);
          // Reset so same file can be re-selected
          if (inputRef.current) inputRef.current.value = '';
        }}
      />

      {/* Crop Dialog */}
      <Dialog open={cropDialogOpen} onOpenChange={(open) => { if (!open) handleCropCancel(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-playfair">Bild anpassen</DialogTitle>
          </DialogHeader>
          <div className="relative h-72 w-full overflow-hidden rounded-md bg-muted">
            {rawImageUrl && (
              <Cropper
                image={rawImageUrl}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>
          <div className="flex items-center gap-3 px-1">
            <ZoomIn className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Slider
              min={1}
              max={3}
              step={0.05}
              value={[zoom]}
              onValueChange={([v]) => setZoom(v)}
              className="flex-1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCropCancel}>Abbrechen</Button>
            <Button onClick={handleCropConfirm}>Übernehmen & Hochladen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
