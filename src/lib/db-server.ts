import { dbStatements } from './db';
import type { Document } from './db-utils';

export interface CreateDocumentData {
  name: string;
  originalName: string;
  filePath: string;
  fileType: string;
  size: number;
  contentText?: string;
}

// Server-side only database operations
export function createDocument(data: CreateDocumentData): Document {
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

export function getAllGroups() {
  return dbStatements.getAllGroups.all();
}

export function createGroup(name: string) {
  const result = dbStatements.insertGroup.run(name);
  return getGroupById(result.lastInsertRowid as number);
}

export function getGroupById(id: number) {
  return dbStatements.getGroupById.get(id);
}

