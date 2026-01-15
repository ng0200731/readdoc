'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface DocumentUploadProps {
  onUploadComplete: () => void;
}

export function DocumentUpload({ onUploadComplete }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (uploadedFiles.length === 0) return;

    setUploading(true);
    const formData = new FormData();

    uploadedFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setUploadedFiles([]);
        onUploadComplete();
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-3">
      {/* Dropzone */}
      <Card className="border-2 border-dashed flex-1 flex flex-col justify-center">
        <div
          {...getRootProps()}
          className={`p-4 text-center cursor-pointer transition-colors h-full flex flex-col justify-center ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {isDragActive ? 'Drop files here...' : 'Drag & drop files here'}
            </p>
            <p className="text-xs text-gray-500">
              or click to select files
            </p>
            <p className="text-xs text-gray-400">
              PDF, TXT, MD, DOC, DOCX (max 10MB)
            </p>
          </div>
        </div>
      </Card>

      {/* File List and Upload Button */}
      {uploadedFiles.length > 0 && (
        <div className="flex-shrink-0 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">Files to upload ({uploadedFiles.length})</h3>
            <Button
              onClick={uploadFiles}
              disabled={uploading}
              size="sm"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-1.5 bg-gray-50 rounded text-xs"
              >
                <div className="flex items-center space-x-1 flex-1 min-w-0">
                  <File className="h-3 w-3 text-gray-500 flex-shrink-0" />
                  <span className="truncate">{file.name}</span>
                  <span className="text-gray-500 flex-shrink-0">
                    ({(file.size / 1024 / 1024).toFixed(1)}MB)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-4 w-4 p-0 flex-shrink-0"
                >
                  <X className="h-2 w-2" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
