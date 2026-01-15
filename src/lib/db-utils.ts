import { dbStatements } from './db';

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

// Document operations
export function createDocument(data: {
  name: string;
  originalName: string;
  filePath: string;
  fileType: string;
  size: number;
  contentText?: string;
}): Document {
  const result = dbStatements.insertDocument.run(
    data.name,
    data.originalName,
    data.filePath,
    data.fileType,
    data.size,
    data.contentText || null
  );

  return getDocumentById(result.lastInsertRowid as number)!;
}

export function getDocumentById(id: number): Document | null {
  const doc = dbStatements.getDocumentById.get(id) as Document | undefined;
  return doc || null;
}

export function getAllDocuments(): Document[] {
  return dbStatements.getAllDocuments.all() as Document[];
}

export function updateDocument(id: number, name: string): boolean {
  const result = dbStatements.updateDocument.run(name, id);
  return result.changes > 0;
}

export function deleteDocument(id: number): boolean {
  const result = dbStatements.deleteDocument.run(id);
  return result.changes > 0;
}

// Search operations
export function searchDocuments(query: string): Document[] {
  try {
    // Use SQLite FTS for exact matches
    const ftsResults = dbStatements.searchDocuments.all(query) as Document[];
    if (ftsResults.length > 0) {
      return ftsResults;
    }
  } catch (error) {
    // FTS query failed, fall back to basic text search
    console.warn('FTS search failed, falling back to basic search');
  }

  // Fallback: basic LIKE search
  const allDocs = getAllDocuments();
  const searchTerm = query.toLowerCase();

  return allDocs.filter(doc =>
    doc.content_text?.toLowerCase().includes(searchTerm) ||
    doc.name.toLowerCase().includes(searchTerm) ||
    doc.original_name.toLowerCase().includes(searchTerm)
  );
}

// Group operations
export function createGroup(name: string): Group {
  const result = dbStatements.insertGroup.run(name);
  return getGroupById(result.lastInsertRowid as number)!;
}

export function getAllGroups(): Group[] {
  return dbStatements.getAllGroups.all() as Group[];
}

export function getGroupById(id: number): Group | null {
  const group = dbStatements.getGroupById.get(id) as Group | undefined;
  return group || null;
}

export function getDocumentsByGroup(groupId: number): Document[] {
  return dbStatements.getDocumentsByGroup.all(groupId) as Document[];
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
