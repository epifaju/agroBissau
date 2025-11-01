'use client';

import { useState, useRef, useCallback } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
}

export function ImageUpload({
  images,
  onChange,
  maxImages = 10,
  maxSizeMB = 5,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Vérifier le type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Format non supporté. Formats acceptés: JPG, PNG, WEBP';
    }

    // Vérifier la taille
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      return `Fichier trop volumineux. Taille maximum: ${maxSizeMB}MB`;
    }

    return null;
  };

  const uploadFile = async (file: File, index?: number): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && index !== undefined) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress((prev) => ({ ...prev, [index]: percentComplete }));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response.url);
        } else {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.error || 'Erreur lors de l\'upload'));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Erreur réseau lors de l\'upload'));
      });

      xhr.open('POST', '/api/upload/image');
      xhr.send(formData);
    });
  };

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      const remainingSlots = maxImages - images.length;

      if (fileArray.length > remainingSlots) {
        alert(`Vous ne pouvez ajouter que ${remainingSlots} image(s) supplémentaire(s). Maximum: ${maxImages}`);
        return;
      }

      setUploading(true);
      const newImages: string[] = [];
      const errors: string[] = [];

      for (let i = 0; i < fileArray.length && images.length + newImages.length < maxImages; i++) {
        const file = fileArray[i];
        const validationError = validateFile(file);

        if (validationError) {
          errors.push(`${file.name}: ${validationError}`);
          continue;
        }

        try {
          const imageUrl = await uploadFile(file, images.length + newImages.length);
          newImages.push(imageUrl);
        } catch (error: any) {
          errors.push(`${file.name}: ${error.message}`);
        }
      }

      if (errors.length > 0) {
        alert(`Erreurs:\n${errors.join('\n')}`);
      }

      if (newImages.length > 0) {
        onChange([...images, ...newImages]);
      }

      setUploading(false);
      setUploadProgress({});
    },
    [images, maxImages, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [handleFiles]
  );

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-4">
      {/* Zone de drag & drop */}
      {canAddMore && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            isDragging
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100',
            uploading && 'opacity-50 pointer-events-none'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={handleFileInputChange}
            className="hidden"
            disabled={uploading || !canAddMore}
          />

          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-white rounded-full">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Glissez-déposez vos images ici, ou
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="mt-2"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Parcourir
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Formats acceptés: JPG, PNG, WEBP (max {maxSizeMB}MB par image)
            </p>
            <p className="text-xs text-gray-500">
              {images.length}/{maxImages} images ajoutées
            </p>
          </div>
        </div>
      )}

      {/* Prévisualisation des images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                <img
                  src={imageUrl}
                  alt={`Prévisualisation ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                aria-label="Supprimer l'image"
              >
                <X className="w-4 h-4" />
              </button>
              {uploadProgress[index] !== undefined && (
                <div className="absolute bottom-0 left-0 right-0 bg-gray-200 h-1">
                  <div
                    className="bg-green-500 h-1 transition-all"
                    style={{ width: `${uploadProgress[index]}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Message si limite atteinte */}
      {!canAddMore && (
        <p className="text-sm text-gray-600 text-center">
          Limite de {maxImages} images atteinte. Supprimez une image pour en ajouter une autre.
        </p>
      )}
    </div>
  );
}

