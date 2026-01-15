import { NextRequest, NextResponse } from 'next/server';

// TODO: Import group functions when implemented
// import { createGroup, getAllGroups } from '@/lib/db-utils';

export async function GET() {
  try {
    const { getAllGroups } = await import('@/lib/db-server');
    const groups = getAllGroups();
    return NextResponse.json({ groups });
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Valid group name is required' },
        { status: 400 }
      );
    }

    const { createGroup } = await import('@/lib/db-server');
    const group = createGroup(name.trim());

    return NextResponse.json({ group });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    );
  }
}
