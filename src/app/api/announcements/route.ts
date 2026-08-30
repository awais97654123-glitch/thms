import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: [{ isPinned: 'desc' }, { publishDate: 'desc' }],
      include: {
        class: true,
        section: true,
      },
    });

    return NextResponse.json({ success: true, announcements });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, content, targetAudience = 'ALL', isPinned = false } = await req.json();

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        targetAudience,
        isPinned,
      },
    });

    return NextResponse.json({ success: true, announcement });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
  }
}
