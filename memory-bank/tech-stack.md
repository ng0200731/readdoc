# Technology Stack Recommendation

## Frontend
- **Framework**: Next.js 14+ (React-based, full-stack capabilities)
- **Styling**: Tailwind CSS (utility-first, fast development)
- **UI Components**: shadcn/ui (accessible, customizable components)
- **Language**: TypeScript (type safety, better DX)

## Backend/API
- **Runtime**: Node.js (same as frontend for simplicity)
- **Framework**: Next.js API Routes (no separate server needed)
- **File Processing**:
  - PDF: pdf-parse or pdf2pic
  - Text extraction: mammoth (for DOC/DOCX), markdown parsing
- **Search**: Fuse.js (lightweight fuzzy search) or SQLite FTS (Full-Text Search)

## Database
- **Primary**: SQLite with better-sqlite3 (simple, file-based, no server setup)
- **Schema**: Documents table + Groups table + Document-Group relationships

## File Storage
- **Local**: File system storage in `/uploads` directory
- **Organization**: By group folders for easy management

## Development Tools
- **Package Manager**: npm/yarn
- **Linting**: ESLint + Prettier
- **Testing**: Jest + React Testing Library (if needed)
- **Version Control**: Git

## Deployment
- **Target**: Static export or Node.js server
- **Hosting**: Vercel, Netlify, or self-hosted

## Why This Stack?
- **Simple**: Single language (TypeScript), minimal services
- **Stable**: Well-established, large community support
- **Fast Development**: Next.js provides both frontend and API
- **Search-Ready**: SQLite FTS for document content search
- **Maintainable**: Clear separation of concerns, modular architecture