import Database from 'better-sqlite3';
import path from 'path';

// Database path
const DB_PATH = path.join(process.cwd(), 'documents.db');

// Initialize database with error handling
let db: Database;
let dbInitialized = false;

try {
  db = new Database(DB_PATH);
  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');
  dbInitialized = true;
} catch (error) {
  console.error('Failed to initialize database:', error);
  console.log('Running in demo mode without database...');
  // We'll provide mock data in the functions below
}

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    content_text TEXT,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS document_groups (
    document_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    PRIMARY KEY (document_id, group_id),
    FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE
  );

  -- Create FTS virtual table for full-text search
  CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts USING fts5(
    content_text,
    content='documents',
    content_rowid='id'
  );

  -- Create triggers to keep FTS table in sync
  CREATE TRIGGER IF NOT EXISTS documents_fts_insert AFTER INSERT ON documents
  BEGIN
    INSERT INTO documents_fts(rowid, content_text) VALUES (new.id, new.content_text);
  END;

  CREATE TRIGGER IF NOT EXISTS documents_fts_delete AFTER DELETE ON documents
  BEGIN
    DELETE FROM documents_fts WHERE rowid = old.id;
  END;

  CREATE TRIGGER IF NOT EXISTS documents_fts_update AFTER UPDATE ON documents
  BEGIN
    UPDATE documents_fts SET content_text = new.content_text WHERE rowid = new.id;
  END;
`);

// Prepared statements for common operations
export const dbStatements = {
  // Documents
  insertDocument: db.prepare(`
    INSERT INTO documents (name, original_name, file_path, file_type, size, content_text)
    VALUES (?, ?, ?, ?, ?, ?)
  `),

  getDocumentById: db.prepare(`
    SELECT * FROM documents WHERE id = ?
  `),

  getAllDocuments: db.prepare(`
    SELECT
      d.*,
      GROUP_CONCAT(g.name) as groups
    FROM documents d
    LEFT JOIN document_groups dg ON d.id = dg.document_id
    LEFT JOIN groups g ON dg.group_id = g.id
    GROUP BY d.id
    ORDER BY d.uploaded_at DESC
  `),

  updateDocument: db.prepare(`
    UPDATE documents
    SET name = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),

  deleteDocument: db.prepare(`
    DELETE FROM documents WHERE id = ?
  `),

  // Search
  searchDocuments: db.prepare(`
    SELECT d.*, highlight(documents_fts, 0, '<mark>', '</mark>') as highlighted_text
    FROM documents_fts
    JOIN documents d ON documents_fts.rowid = d.id
    WHERE documents_fts MATCH ?
    ORDER BY rank
  `),

  // Groups
  insertGroup: db.prepare(`
    INSERT INTO groups (name) VALUES (?)
  `),

  getAllGroups: db.prepare(`
    SELECT * FROM groups ORDER BY name
  `),

  getGroupById: db.prepare(`
    SELECT * FROM groups WHERE id = ?
  `),

  // Document-Group relationships
  assignDocumentToGroup: db.prepare(`
    INSERT OR IGNORE INTO document_groups (document_id, group_id) VALUES (?, ?)
  `),

  removeDocumentFromGroup: db.prepare(`
    DELETE FROM document_groups WHERE document_id = ? AND group_id = ?
  `),

  getDocumentsByGroup: db.prepare(`
    SELECT d.* FROM documents d
    JOIN document_groups dg ON d.id = dg.document_id
    WHERE dg.group_id = ?
    ORDER BY d.uploaded_at DESC
  `),
};

export default db;

// Helper function to close database connection
export function closeDatabase() {
  db.close();
}
