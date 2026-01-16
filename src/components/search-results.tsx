'use client';

import { FileText, Download, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getFileTypeIcon, formatFileSize } from '@/lib/db-utils';

interface SearchResult {
  id: number;
  name: string;
  fileType: string;
  size: number;
  uploadedAt: string;
  highlightedText?: string;
  groups: string[];
}

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  isLoading: boolean;
}

export function SearchResults({ results, query, isLoading }: SearchResultsProps) {
  const highlightText = (text: string, query: string) => {
    if (!query || !text) return text;

    // Simple highlighting - replace query terms with marked spans
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (results.length === 0 && query) {
    return (
      <Card className="p-8 text-center">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
        <p className="text-gray-500">
          No documents match your search for "<span className="font-medium">{query}</span>".
          Try different keywords or check your spelling.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
      </div>

      {results.map((result) => (
        <Card key={result.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className="text-2xl mt-1">
                {getFileTypeIcon(result.fileType)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-medium text-gray-900 truncate">
                    {result.name}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {result.fileType.split('/')[1]?.toUpperCase()}
                  </Badge>
                </div>

                <div className="text-sm text-gray-600 mb-2">
                  {formatFileSize(result.size)} • Uploaded {new Date(result.uploadedAt).toLocaleDateString()}
                  {result.groups.length > 0 && (
                    <> • {result.groups.length} group{result.groups.length !== 1 ? 's' : ''}</>
                  )}
                </div>

                {result.highlightedText && (
                  <div
                    className="text-sm text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: highlightText(result.highlightedText, query)
                    }}
                  />
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/uploads/${result.id}`, '_blank')}
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

