'use client';

import { useState } from 'react';
import { FileText, Download, Edit2, MoreHorizontal, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RenameDialog } from './rename-dialog';
import type { Document } from '@/lib/db-utils';
import { getFileTypeIcon, formatFileSize } from '@/lib/db-utils';

interface DocumentListProps {
  documents: Document[];
  isLoading: boolean;
  onDocumentUpdate: () => void;
}

export function DocumentList({ documents, isLoading, onDocumentUpdate }: DocumentListProps) {
  const [renamingDocument, setRenamingDocument] = useState<Document | null>(null);

  const handleRename = async (documentId: number, newName: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      });

      if (response.ok) {
        onDocumentUpdate();
        setRenamingDocument(null);
      } else {
        alert('Failed to rename document');
      }
    } catch (error) {
      console.error('Rename error:', error);
      alert('Failed to rename document');
    }
  };

  const handleDownload = (document: Document) => {
    // For now, just open the file. In a real app, you'd serve it through an API
    window.open(`/uploads/${document.file_path}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <Card className="p-8 text-center">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
        <p className="text-gray-500">
          Upload some documents to get started with searching and organizing.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((document) => (
        <Card key={document.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="text-2xl">
                {getFileTypeIcon(document.file_type)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">
                  {document.name}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>{formatFileSize(document.size)}</span>
                  <span>•</span>
                  <span>{new Date(document.uploaded_at).toLocaleDateString()}</span>
                  {document.groups && (
                    <>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <Folder className="h-3 w-3" />
                        <span>{document.groups.split(',').length} groups</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {document.file_type.split('/')[1]?.toUpperCase()}
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleDownload(document)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRenamingDocument(document)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Rename
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Card>
      ))}

      {renamingDocument && (
        <RenameDialog
          document={renamingDocument}
          onRename={handleRename}
          onClose={() => setRenamingDocument(null)}
        />
      )}
    </div>
  );
}

