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

  const showSearchResults = searchQuery.trim().length > 0;

  return (
    <div className="h-screen flex">
      {/* Left Panel - 30% width */}
      <div className="w-[30%] flex flex-col">
        {/* Upload Section - Top 30% of left panel */}
        <div className="h-[30%] bg-white rounded-lg shadow-sm border m-4 p-4 flex flex-col">
          <h2 className="text-lg font-semibold mb-3 flex-shrink-0">Upload Documents</h2>
          <div className="flex-1 overflow-hidden">
            <DocumentUpload onUploadComplete={handleUploadComplete} />
          </div>
        </div>

        {/* Document List - Bottom 70% of left panel */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border m-4 mt-0 p-4 overflow-hidden">
          <h2 className="text-lg font-semibold mb-3">
            Documents ({documents.length})
          </h2>
          <div className="h-full overflow-y-auto">
            <DocumentList
              documents={documents}
              isLoading={isLoading}
              onDocumentUpdate={loadDocuments}
            />
          </div>
        </div>
      </div>

      {/* Right Panel - 70% width */}
      <div className="flex-1 flex flex-col">
        {/* Search Section - Top 20% of right panel */}
        <div className="h-1/5 bg-white rounded-lg shadow-sm border m-4 p-4">
          <h2 className="text-lg font-semibold mb-3">Search Documents</h2>
          <SearchBar onSearch={handleSearch} isSearching={isSearching} availableGroups={groups} />
          <div className="mt-3">
            <GroupManager />
          </div>
        </div>

        {/* Search Results - Bottom 80% of right panel */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border m-4 mt-0 p-4 overflow-hidden">
          {showSearchResults ? (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">
                  Search Results ({searchResults.length})
                </h2>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear search
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {searchResults.length > 0 ? (
                  <SearchResults
                    results={searchResults}
                    query={searchQuery}
                    isLoading={isSearching}
                  />
                ) : !isSearching ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                      <p className="text-gray-500">
                        No documents match your search for "<span className="font-medium">{searchQuery}</span>".
                        Try different keywords or check your spelling.
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-lg font-medium mb-2">Document Search</h3>
                <p>Use the search bar above to find documents</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
