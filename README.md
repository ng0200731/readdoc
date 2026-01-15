# ReadDoc - Document Reader & Organizer

A modern web application for uploading, organizing, and searching through documents. Built with Next.js, TypeScript, and SQLite.

## Features

- 📁 **Document Upload**: Drag-and-drop upload for PDF, TXT, MD, DOC, and DOCX files
- 🔍 **Smart Search**: Search through document content with full-text search capabilities
- 📋 **Organization**: Create groups/folders to organize your documents
- ✏️ **Rename & Manage**: Rename documents and manage your collection
- 📱 **Responsive**: Works on desktop and mobile devices
- 🚀 **Fast**: Built with modern web technologies for optimal performance

## Tech Stack

- **Frontend**: Next.js 14+, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: SQLite with Full-Text Search
- **File Processing**: PDF parsing, DOCX text extraction, markdown support

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Quick Start (Windows)

For Windows users, simply double-click the batch files:

1. **`start-readdoc.bat`** - Full setup (installs dependencies, initializes database, starts server)
2. **`quick-start.bat`** - Quick launch (assumes dependencies are already installed)

### Manual Installation

1. Clone the repository:
```bash
git clone https://github.com/ng0200731/readdoc.git
cd readdoc
```

2. Install dependencies:
```bash
npm install
```

3. Initialize the database:
```bash
npm run init-db
```

4. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Upload Documents**: Drag and drop files onto the upload area or click to select files
2. **Organize**: Create groups to categorize your documents
3. **Search**: Use the search bar to find content within your documents
4. **Manage**: Rename documents or download them as needed

## Supported File Types

- PDF (.pdf) - Text content extracted
- Plain Text (.txt)
- Markdown (.md)
- Microsoft Word (.doc, .docx)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run init-db` - Initialize/reset database

### Windows Batch Files

- `start-readdoc.bat` - Full setup and launch (installs dependencies, initializes database, starts server)
- `quick-start.bat` - Quick launch (assumes setup is complete)

**Port Handling:** Both batch files automatically detect available ports starting from 3000, so they work even when other services are using common ports.

### Project Structure

```
src/
├── app/                 # Next.js app router
│   ├── api/            # API routes
│   └── globals.css     # Global styles
├── components/         # React components
│   ├── ui/            # shadcn/ui components
│   └── ...            # Feature components
└── lib/               # Utilities and database
memory-bank/           # Project planning documents
scripts/               # Database setup scripts
uploads/               # File storage directory
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Planning & Architecture

This project follows a structured development approach with planning documents in the `memory-bank/` directory:

- `PRD.md` - Product Requirements Document
- `tech-stack.md` - Technology stack decisions
- `implementation-plan.md` - Step-by-step development plan
- `architecture.md` - System architecture and design decisions
- `progress.md` - Development progress tracking