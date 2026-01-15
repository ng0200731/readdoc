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
    <div className="space-y-4">
      {/* Dropzone */}
      <Card className="border-2 border-dashed">
        <div
          {...getRootProps()}
          className={`p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {isDragActive ? 'Drop files here...' : 'Drag & drop files here'}
            </p>
            <p className="text-sm text-gray-500">
              or click to select files
            </p>
            <p className="text-xs text-gray-400">
              Supported: PDF, TXT, MD, DOC, DOCX (max 10MB each)
            </p>
          </div>
        </div>
      </Card>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Files to upload:</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded border"
              >
                <div className="flex items-center space-x-2">
                  <File className="h-4 w-4 text-gray-500" />
                  <span className="text-sm truncate">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(file.size / 1024 / 1024).toFixed(1)}MB)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {uploadedFiles.length > 0 && (
        <Button
          onClick={uploadFiles}
          disabled={uploading}
          className="w-full"
        >
          {uploading ? 'Uploading...' : `Upload ${uploadedFiles.length} file(s)`}
        </Button>
      )}
    </div>
  );
}
