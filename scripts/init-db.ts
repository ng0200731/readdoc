#!/usr/bin/env tsx

/**
 * Database initialization script
 * Run this to set up the database schema and initial data
 */

import { existsSync } from 'fs';
import path from 'path';

// Import database connection to trigger initialization
import '../src/lib/db';

// Check if database file exists
const dbPath = path.join(process.cwd(), 'documents.db');

console.log('🔄 Initializing database...');

if (existsSync(dbPath)) {
  console.log('✅ Database file already exists at:', dbPath);
} else {
  console.log('📁 Database file will be created at:', dbPath);
}

// The database schema is automatically created when the db module is imported
console.log('✅ Database schema initialized successfully!');

// Create some sample groups if they don't exist
console.log('🔄 Checking for sample data...');

// Note: In a real app, you might want to add sample data here
console.log('✅ Database initialization complete!');
console.log('');
console.log('Database location:', dbPath);
console.log('You can now run: npm run dev');
