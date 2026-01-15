'use client';

import { useState, useEffect } from 'react';
import { DocumentList } from './document-list';
import { DocumentUpload } from './document-upload';
import { SearchBar, SearchFilters } from './search-bar';
import { SearchResults } from './search-results';
import { GroupManager } from './group-manager';
import type { Document } from '@/lib/db-utils';

interface SearchResult {
  id: number;
  name: string;
  fileType: string;
  size: number;
  uploadedAt: string;
  highlightedText?: string;
  groups: string[];
}

export function DocumentManager() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // Load documents and groups on mount
  useEffect(() => {
    loadDocuments();
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const response = await fetch('/api/groups');
      if (response.ok) {
        const data = await response.json();
        const groupNames = (data.groups || []).map((g: any) => g.name);
        setGroups(groupNames);
      }
    } catch (error) {
      console.error('Failed to load groups:', error);
    }
  };

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

  const handleSearch = async (query: string, filters?: SearchFilters) => {
    setSearchQuery(query);

    // Build query string with filters
    const params = new URLSearchParams();
    if (query.trim()) {
      params.set('q', query);
    }
    if (filters?.fileTypes.length) {
      params.set('fileTypes', filters.fileTypes.join(','));
    }
    if (filters?.groups.length) {
      params.set('groups', filters.groups.join(','));
    }

    const queryString = params.toString();

    if (!queryString) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const response = await fetch(`/api/search?${queryString}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
      } else {
        console.error('Search failed');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const showSearchResults = searchQuery.trim() && (searchResults.length > 0 || isSearching);

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
            <SearchBar onSearch={handleSearch} isSearching={isSearching} availableGroups={groups} />
          </div>
          <div className="lg:w-64">
            <GroupManager />
          </div>
        </div>
      </div>

      {/* Search Results or Document List */}
      {showSearchResults ? (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              Search Results ({searchResults.length})
            </h2>
            <button
              onClick={() => setSearchQuery('')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear search
            </button>
          </div>
          <SearchResults
            results={searchResults}
            query={searchQuery}
            isLoading={isSearching}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              Documents ({documents.length})
            </h2>
          </div>
          <DocumentList
            documents={documents}
            isLoading={isLoading}
            onDocumentUpdate={loadDocuments}
          />
        </div>
      )}
    </div>
  );
}
