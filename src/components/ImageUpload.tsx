import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Upload, Image, X, Loader2 } from 'lucide-react';
import { translate } from '../utils/translations';

interface ImageUploadProps {
  onImageUpload: (file: File) => Promise<string>;
  onImageRemove: () => void;
  currentImageUrl?: string;
  language: string;
  isLoading?: boolean;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

export function ImageUpload({ 
  onImageUpload, 
  onImageRemove, 
  currentImageUrl, 
  language,
  isLoading = false,
  maxSizeMB = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp']
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return translate('invalidFileType', language);
    }
    
    if (file.size > maxSizeMB * 1024 * 1024) {
      return translate('fileTooLarge', language).replace('{size}', maxSizeMB.toString());
    }
    
    return null;
  };

  const handleFileUpload = async (file: File) => {
    setUploadError(null);
    
    const error = validateFile(file);
    if (error) {
      setUploadError(error);
      return;
    }

    try {
      await onImageUpload(file);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : translate('uploadError', language));
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg">{translate('cropImages', language)}</h3>
            {currentImageUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={onImageRemove}
                disabled={isLoading}
              >
                <X className="h-4 w-4 mr-2" />
                {translate('remove', language)}
              </Button>
            )}
          </div>

          {uploadError && (
            <Alert variant="destructive">
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}

          {currentImageUrl ? (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden border-2 border-dashed border-gray-200">
                <img
                  src={currentImageUrl}
                  alt="Uploaded crop"
                  className="w-full h-48 object-cover"
                />
                {isLoading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                onClick={openFileDialog}
                disabled={isLoading}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {translate('changeImage', language)}
              </Button>
            </div>
          ) : (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setDragActive(false);
              }}
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDrop={handleDrop}
            >
              {isLoading ? (
                <div className="space-y-4">
                  <Loader2 className="h-12 w-12 text-green-600 animate-spin mx-auto" />
                  <p className="text-muted-foreground">
                    {translate('uploadingImage', language)}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="bg-green-100 p-3 rounded-full">
                      <Image className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg">{translate('dropImageHere', language)}</p>
                    <p className="text-sm text-muted-foreground">
                      {translate('uploadImageDescription', language)}
                    </p>
                  </div>
                  <Button
                    onClick={openFileDialog}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isLoading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {translate('selectImage', language)}
                  </Button>
                </div>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleFileInput}
            className="hidden"
            disabled={isLoading}
          />

          <p className="text-xs text-muted-foreground">
            {translate('supportedFormats', language)}: JPEG, PNG, WebP • {translate('maxSize', language)}: {maxSizeMB}MB
          </p>
        </div>
      </CardContent>
    </Card>
  );
}