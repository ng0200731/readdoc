# Architecture Decisions

## Current Architecture
- **Frontend**: Next.js 14+ with TypeScript and Tailwind CSS
- **Backend**: Next.js API Routes (serverless)
- **Database**: SQLite with better-sqlite3
- **UI Components**: shadcn/ui with Radix UI primitives
- **File Storage**: Local filesystem in `/uploads` directory

## Key Design Decisions

### Database Schema Choices ✅ COMPLETED
- **Documents Table**: Stores metadata, file paths, and extracted text content
- **Groups Table**: Simple categorization system for organizing documents
- **Document-Groups Junction Table**: Many-to-many relationship between documents and groups
- **FTS Virtual Table**: SQLite Full-Text Search for fast document content search
- **Triggers**: Automatic synchronization between main tables and FTS table

### File Storage Structure
- **Local Storage**: Files stored in `/uploads` directory
- **Organization**: Flat structure initially, can be organized by groups later
- **Naming**: Files renamed with UUIDs to prevent conflicts

### API Endpoint Design
- **RESTful**: Standard REST endpoints for CRUD operations
- **File Upload**: Multipart form data handling for document uploads
- **Search**: Dedicated search endpoint with query parameters

### Component Architecture
- **shadcn/ui**: Consistent, accessible UI components
- **Modular**: Separate components for different features
- **TypeScript**: Full type safety throughout the application

### Search Implementation Approach
- **Primary**: SQLite FTS (Full-Text Search) for fast, accurate results
- **Fallback**: Fuse.js for fuzzy matching and advanced features
- **Highlighting**: Search terms highlighted in results