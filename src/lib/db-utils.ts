import Fuse from 'fuse.js';

// Mock data for when database is not available
const mockDocuments: Document[] = [
  {
    id: 1,
    name: 'sample-document.pdf',
    original_name: 'sample-document.pdf',
    file_path: 'sample.pdf',
    file_type: 'application/pdf',
    size: 1024000,
    content_text: 'This is a sample PDF document with some searchable content. It contains information about document management and search functionality.',
    uploaded_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    groups: 'Documentation'
  },
  {
    id: 2,
    name: 'readme.txt',
    original_name: 'readme.txt',
    file_path: 'readme.txt',
    file_type: 'text/plain',
    size: 2048,
    content_text: 'Welcome to ReadDoc! This application allows you to upload, organize, and search through your documents efficiently.',
    uploaded_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    groups: 'Documentation'
  },
  {
    id: 3,
    name: 'project-notes.md',
    original_name: 'project-notes.md',
    file_path: 'notes.md',
    file_type: 'text/markdown',
    size: 4096,
    content_text: '# Project Notes\n\nThis project demonstrates document management with search capabilities. Features include file upload, text extraction, and full-text search.\n\nQC 前端加入一 - Quality Control frontend integration step one.',
    uploaded_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    groups: 'Notes,Project'
  },
  {
    id: 4,
    name: 'chinese-document.txt',
    original_name: 'chinese-document.txt',
    file_path: 'chinese.txt',
    file_type: 'text/plain',
    size: 1024,
    content_text: '这是一个中文文档示例。QC 前端加入一，包含一些中文搜索测试内容。',
    uploaded_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    groups: 'Chinese,Test'
  }
];

const mockGroups: Group[] = [
  { id: 1, name: 'Documentation', created_at: new Date().toISOString() },
  { id: 2, name: 'Notes', created_at: new Date().toISOString() },
  { id: 3, name: 'Project', created_at: new Date().toISOString() }
];

export interface Document {
  id: number;
  name: string;
  original_name: string;
  file_path: string;
  file_type: string;
  size: number;
  content_text?: string;
  uploaded_at: string;
  updated_at: string;
  groups?: string;
}

export interface Group {
  id: number;
  name: string;
  created_at: string;
}

// Document operations - Client-side only uses mock data or API calls
export function getAllDocuments(): Document[] {
  // Always return mock data for client-side usage
  // Real database operations happen in API routes
  return mockDocuments;
}

// Search operations - Client-side fuzzy search on mock data
export function searchDocuments(query: string): Document[] {
  // Use Fuse.js for fuzzy search on mock data
  const allDocs = getAllDocuments();

  // Configure Fuse.js for better Chinese character support
  const fuse = new Fuse(allDocs, {
    keys: [
      { name: 'content_text', weight: 0.7 },
      { name: 'name', weight: 0.2 },
      { name: 'original_name', weight: 0.1 }
    ],
    threshold: 0.4, // Slightly higher threshold for better Chinese matching
    includeScore: true,
    includeMatches: true,
    useExtendedSearch: true, // Better for non-English characters
    // Add tokenizer for Chinese characters
    tokenize: true,
    matchAllTokens: true
  });

  const results = fuse.search(query);

  // If no results with extended search, try a simpler approach
  if (results.length === 0) {
    // Simple text search for Chinese characters
    const simpleResults = allDocs.filter(doc =>
      doc.content_text?.includes(query) ||
      doc.name?.includes(query) ||
      doc.original_name?.includes(query)
    );
    return simpleResults;
  }

  // Convert Fuse.js results back to Document format
  return results.map(result => ({
    ...result.item,
    // Add a highlighted snippet if matches exist
    highlighted_text: result.matches?.[0]?.value?.substring(
      Math.max(0, result.matches[0].indices[0][0] - 50),
      Math.min(result.item.content_text?.length || 0, result.matches[0].indices[0][1] + 50)
    )
  }));
}

// Group operations - Client-side only uses mock data
export function getAllGroups(): Group[] {
  return mockGroups;
}

// Document-Group relationship operations
export function assignDocumentToGroup(documentId: number, groupId: number): boolean {
  try {
    const result = dbStatements.assignDocumentToGroup.run(documentId, groupId);
    return result.changes > 0;
  } catch {
    // Likely a constraint violation (already assigned)
    return false;
  }
}

export function removeDocumentFromGroup(documentId: number, groupId: number): boolean {
  try {
    const result = dbStatements.removeDocumentFromGroup.run(documentId, groupId);
    return result.changes > 0;
  } catch {
    return false;
  }
}

export function getDocumentGroups(_documentId: number): Group[] {
  // TODO: Implement document groups query
  return [];
}

// Utility functions
export function getFileTypeIcon(fileType: string): string {
  const type = fileType.toLowerCase();
  if (type.includes('pdf')) return '📄';
  if (type.includes('doc') || type.includes('docx')) return '📝';
  if (type.includes('txt')) return '📃';
  if (type.includes('md')) return '📖';
  return '📄';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
