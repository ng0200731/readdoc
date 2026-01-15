'use client';

import { useState, useEffect } from 'react';
import { DocumentList } from './document-list';
import { DocumentUpload } from './document-upload';
import { SearchBar } from './search-bar';
import { GroupManager } from './group-manager';
import type { Document } from '@/lib/db-utils';

export function DocumentManager() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, []);

  // Filter documents based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredDocuments(documents);
    } else {
      // For now, just filter by name. Later we'll implement full-text search
      const filtered = documents.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.original_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredDocuments(filtered);
    }
  }, [documents, searchQuery]);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/upload');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadComplete = () => {
    loadDocuments(); // Refresh the document list
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">Upload Documents</h2>
        <DocumentUpload onUploadComplete={handleUploadComplete} />
      </div>

      {/* Search and Group Management */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <div className="flex-1">
            <SearchBar onSearch={handleSearch} />
          </div>
          <div className="lg:w-64">
            <GroupManager />
          </div>
        </div>
      </div>

      {/* Document List */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Documents ({filteredDocuments.length})
          </h2>
        </div>
        <DocumentList
          documents={filteredDocuments}
          isLoading={isLoading}
          onDocumentUpdate={loadDocuments}
        />
      </div>
    </div>
  );
}
