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

    // Simple text search within filtered documents
    const searchResults = filteredDocs.filter(doc =>
      doc.content_text?.toLowerCase().includes(query.toLowerCase()) ||
      doc.name.toLowerCase().includes(query.toLowerCase()) ||
      doc.original_name.toLowerCase().includes(query.toLowerCase())
    );

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

    if (query && query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters long' },
        { status: 400 }
      );
    }

    const results = await getSearchResults(query, filters, Math.min(limit, 100)); // Cap at 100 results

    // Format results for frontend
    const formattedResults = results.map(result => ({
      id: result.id,
      name: result.name,
      fileType: result.file_type,
      size: result.size,
      uploadedAt: result.uploaded_at,
      highlightedText: result.highlighted_text || result.content_text?.substring(0, 200) + '...',
      groups: result.groups ? result.groups.split(',').filter(g => g.trim()) : []
    }));

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
