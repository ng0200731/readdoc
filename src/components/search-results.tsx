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
  snippets?: string[];
  groups: string[];
}

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  isLoading: boolean;
}

export function SearchResults({ results, query, isLoading }: SearchResultsProps) {
  const escapeHtml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const highlightText = (text: string, query: string) => {
    if (!query || !text) return escapeHtml(text);

    const isCjk = /[\u4e00-\u9fff]/.test(query);
    const tokens = isCjk ? Array.from(query) : query.split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return escapeHtml(text);

    const escaped = escapeHtml(text);
    // Build regex for tokens (escape each)
    const parts = tokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${parts.join('|')})`, 'gi');
    return escaped.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
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

                {result.snippets && result.snippets.length > 0 ? (
                  <div className="space-y-2 text-sm text-gray-700 leading-relaxed">
                    {result.snippets.map((s, i) => (
                      <div
                        key={i}
                        className="snippet"
                        dangerouslySetInnerHTML={{ __html: highlightText(s, query) }}
                      />
                    ))}
                  </div>
                ) : null}
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

