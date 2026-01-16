import { NextRequest, NextResponse } from 'next/server';

// Dynamic import to avoid issues with database connections
async function getSearchResults(query: string, filters: any = {}, limit: number = 50) {
  const { getAllDocuments } = await import('@/lib/db-server');

  try {
    // Get all documents from database
    const allDocs = getAllDocuments();

    // Apply filters
    let filteredDocs = allDocs;

    if (filters.fileTypes && filters.fileTypes.length > 0) {
      filteredDocs = filteredDocs.filter(doc =>
        filters.fileTypes.some((type: string) =>
          doc.file_type.toLowerCase().includes(type.toLowerCase())
        )
      );
    }

    if (filters.groups && filters.groups.length > 0) {
      filteredDocs = filteredDocs.filter(doc =>
        doc.groups && filters.groups.some((group: string) =>
          doc.groups.toLowerCase().includes(group.toLowerCase())
        )
      );
    }

    if (!query.trim()) {
      // If no query, just return filtered documents
      return filteredDocs.slice(0, limit);
    }

    // Search within filtered documents with better Chinese character support
    const searchResults = filteredDocs.filter(doc => {
      const searchTerm = query.toLowerCase();
      const contentText = doc.content_text?.toLowerCase() || '';
      const name = doc.name?.toLowerCase() || '';
      const originalName = doc.original_name?.toLowerCase() || '';

      // Exact match first
      if (contentText.includes(searchTerm) ||
          name.includes(searchTerm) ||
          originalName.includes(searchTerm)) {
        return true;
      }

      // For Chinese characters, also try partial matching
      // Split Chinese characters and search for individual characters
      if (/[\u4e00-\u9fff]/.test(query)) {
        const chineseChars = query.split('');
        return chineseChars.some(char =>
          contentText.includes(char) ||
          name.includes(char) ||
          originalName.includes(char)
        );
      }

      return false;
    });

    // Limit results
    return searchResults.slice(0, limit);
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Parse filters
    const fileTypes = searchParams.get('fileTypes')?.split(',') || [];
    const groups = searchParams.get('groups')?.split(',') || [];

    const filters = {
      fileTypes: fileTypes.filter(t => t.trim()),
      groups: groups.filter(g => g.trim())
    };

    if (!query && fileTypes.length === 0 && groups.length === 0) {
      return NextResponse.json(
        { error: 'Either query or filters must be provided' },
        { status: 400 }
      );
    }

    if (query) {
      const isCjk = /[\u4e00-\u9fff]/.test(query);
      if (query.length < 2 && !isCjk) {
        return NextResponse.json(
          { error: 'Query must be at least 2 characters long (or a single CJK character)' },
          { status: 400 }
        );
      }
    }

    const results = await getSearchResults(query, filters, Math.min(limit, 100)); // Cap at 100 results

    // Format results for frontend
    const formattedResults = results.map(result => {
      const content = result.content_text || '';
      const q = query.toLowerCase();
      let snippet = '';

      if (content) {
        const lower = content.toLowerCase();
        const idx = lower.indexOf(q);
        if (idx >= 0) {
          const start = Math.max(0, idx - 60);
          const end = Math.min(content.length, idx + 60);
          snippet = (start > 0 ? '...' : '') + content.substring(start, end) + (end < content.length ? '...' : '');
        } else {
          snippet = content.substring(0, 200) + (content.length > 200 ? '...' : '');
        }
      }

      return {
        id: result.id,
        name: result.name,
        fileType: result.file_type,
        size: result.size,
        uploadedAt: result.uploaded_at,
        highlightedText: result.highlighted_text || snippet,
        groups: result.groups ? result.groups.split(',').filter(g => g.trim()) : []
      };
    });

    return NextResponse.json({
      query,
      total: formattedResults.length,
      results: formattedResults
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
