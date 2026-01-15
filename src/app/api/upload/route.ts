import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

// Supported file types
const SUPPORTED_TYPES = [
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Helper function to extract text from different file types
async function extractText(buffer: Buffer, mimeType: string, originalName: string): Promise<string> {
  try {
    switch (mimeType) {
      case 'application/pdf':
        const pdfData = await pdfParse(buffer);
        return pdfData.text;

      case 'text/plain':
      case 'text/markdown':
        return buffer.toString('utf-8');

      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        const docxResult = await mammoth.extractRawText({ buffer });
        return docxResult.value;

      default:
        // For unsupported types, try to read as text anyway
        try {
          return buffer.toString('utf-8');
        } catch {
          return `Unsupported file type: ${mimeType}`;
        }
    }
  } catch (error) {
    console.error('Text extraction error:', error);
    return `Error extracting text from ${originalName}: ${error}`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const uploadedDocuments = [];

    // Ensure uploads directory exists
    const uploadsDir = join(process.cwd(), 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    for (const file of files) {
      // Validate file
      if (!SUPPORTED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Unsupported file type: ${file.type}. Supported types: PDF, TXT, MD, DOC, DOCX` },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File too large: ${file.name}. Maximum size: 10MB` },
          { status: 400 }
        );
      }

      // Generate unique filename
      const fileExtension = extname(file.name);
      const uniqueName = `${randomUUID()}${fileExtension}`;
      const filePath = join(uploadsDir, uniqueName);

      // Read file buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Extract text content
      const contentText = await extractText(buffer, file.type, file.name);

      // Save file to disk
      await writeFile(filePath, buffer);

      // Save to database
      const { createDocument } = await import('@/lib/db-utils');
      const document = createDocument({
        name: file.name,
        originalName: file.name,
        filePath: uniqueName, // Store relative path
        fileType: file.type,
        size: file.size,
        contentText: contentText,
      });

      uploadedDocuments.push(document);
    }

    return NextResponse.json({
      message: `Successfully uploaded ${uploadedDocuments.length} document(s)`,
      documents: uploadedDocuments,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}

// GET endpoint to list uploaded documents (for testing)
export async function GET() {
  try {
    const { getAllDocuments } = await import('@/lib/db-utils');
    const documents = getAllDocuments();

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}
