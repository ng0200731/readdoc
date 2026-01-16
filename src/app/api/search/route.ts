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

    // Search within filtered documents with token-based matching
    const isCjk = /[\u4e00-\u9fff]/.test(query);
    const tokens: string[] = isCjk
      ? Array.from(query) // split into characters for CJK
      : query.split(/\s+/).filter(Boolean); // split by whitespace for non-CJK

    const searchResults = filteredDocs.filter(doc => {
      const contentRaw = doc.content_text || '';
      const nameRaw = doc.name || '';
      const originalNameRaw = doc.original_name || '';
      const contentText = contentRaw.toLowerCase();
      const name = nameRaw.toLowerCase();
      const originalName = originalNameRaw.toLowerCase();

      // Exact phrase match first (case-insensitive)
      if (query && (contentText.includes(query.toLowerCase()) || name.includes(query.toLowerCase()) || originalName.includes(query.toLowerCase()))) {
        return true;
      }

      // If single CJK character query, also check raw content (avoid lowercasing issues)
      if (isCjk && tokens.length === 1) {
        const ch = tokens[0];
        if (contentRaw.includes(ch) || nameRaw.includes(ch) || originalNameRaw.includes(ch)) {
          return true;
        }
      }

      // Token-based OR matching: return true if any token is present (case-insensitive)
      return tokens.some(token => {
        const t = token.toLowerCase();
        return contentText.includes(t) || name.includes(t) || originalName.includes(t);
      });
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
    // Helper: split into sentences/snippets
    const extractSnippets = (text: string, q: string, maxSnippets = 3) => {
      if (!text) return [];
      const snippets: string[] = [];
      const isCjk = /[\u4e00-\u9fff]/.test(q);
      // split text into sentences depending on CJK or non-CJK
      const parts = isCjk
        ? text.split(/(?<=[。！？；\n\r])/u)
        : text.split(/(?<=[.!?]\s)|\n/u);

      const tokens = isCjk ? Array.from(q) : q.split(/\s+/).filter(Boolean);
      const qLower = q.toLowerCase();

      for (const part of parts) {
        const partTrim = part.trim();
        if (!partTrim) continue;
        const lower = partTrim.toLowerCase();
        // phrase match
        if (q && lower.includes(qLower)) {
          snippets.push(partTrim);
        } else {
          // token match: any token present
          const matched = tokens.some(t => {
            if (!t) return false;
            if (isCjk) {
              return partTrim.includes(t);
            }
            return lower.includes(t.toLowerCase());
          });
          if (matched) snippets.push(partTrim);
        }
        if (snippets.length >= maxSnippets) break;
      }

      // fallback: return start of document if nothing found
      if (snippets.length === 0) {
        const s = text.length > 200 ? text.substring(0, 200) + '...' : text;
        return [s];
      }
      return snippets;
    };

    const formattedResults = results.map(result => {
      const content = result.content_text || '';
      const snippets = extractSnippets(content, query, 3);

      return {
        id: result.id,
        name: result.name,
        fileType: result.file_type,
        size: result.size,
        uploadedAt: result.uploaded_at,
        snippets,
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
