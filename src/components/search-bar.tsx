'use client';

import { useState } from 'react';
import { Search, X, Loader2, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export interface SearchFilters {
  fileTypes: string[];
  groups: string[];
}

interface SearchBarProps {
  onSearch: (query: string, filters?: SearchFilters) => void;
  isSearching?: boolean;
  availableGroups?: string[];
}

export function SearchBar({ onSearch, isSearching = false, availableGroups = [] }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    fileTypes: [],
    groups: []
  });

  const fileTypes = ['pdf', 'txt', 'md', 'doc', 'docx'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, filters);
  };

  const handleClear = () => {
    setQuery('');
    setFilters({ fileTypes: [], groups: [] });
    onSearch('', { fileTypes: [], groups: [] });
  };

  const toggleFileType = (fileType: string) => {
    const newFilters = {
      ...filters,
      fileTypes: filters.fileTypes.includes(fileType)
        ? filters.fileTypes.filter(t => t !== fileType)
        : [...filters.fileTypes, fileType]
    };
    setFilters(newFilters);
    if (query.trim()) {
      onSearch(query, newFilters);
    }
  };

  const toggleGroup = (group: string) => {
    const newFilters = {
      ...filters,
      groups: filters.groups.includes(group)
        ? filters.groups.filter(g => g !== group)
        : [...filters.groups, group]
    };
    setFilters(newFilters);
    if (query.trim()) {
      onSearch(query, newFilters);
    }
  };

  const activeFiltersCount = filters.fileTypes.length + filters.groups.length;

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search documents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-24"
            disabled={isSearching}
          />
          <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {isSearching && (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 relative"
                >
                  <Filter className="h-3 w-3" />
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>File Types</DropdownMenuLabel>
                {fileTypes.map(type => (
                  <DropdownMenuCheckboxItem
                    key={type}
                    checked={filters.fileTypes.includes(type)}
                    onCheckedChange={() => toggleFileType(type)}
                  >
                    .{type.toUpperCase()}
                  </DropdownMenuCheckboxItem>
                ))}

                {availableGroups.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Groups</DropdownMenuLabel>
                    {availableGroups.map(group => (
                      <DropdownMenuCheckboxItem
                        key={group}
                        checked={filters.groups.includes(group)}
                        onCheckedChange={() => toggleGroup(group)}
                      >
                        {group}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {query && !isSearching && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </form>

      {/* Active filters display */}
      {(filters.fileTypes.length > 0 || filters.groups.length > 0) && (
        <div className="flex flex-wrap gap-1">
          {filters.fileTypes.map(type => (
            <Badge key={type} variant="outline" className="text-xs">
              .{type.toUpperCase()}
              <button
                onClick={() => toggleFileType(type)}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-2 w-2" />
              </button>
            </Badge>
          ))}
          {filters.groups.map(group => (
            <Badge key={group} variant="outline" className="text-xs">
              {group}
              <button
                onClick={() => toggleGroup(group)}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-2 w-2" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
