import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { verifyAdminCookie } from '@/app/lib/adminAuth';

export async function GET(request) {
  const auth = verifyAdminCookie(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');
  const skip = (page - 1) * pageSize;

  try {
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              fullName: true,
              email: true
            }
          }
        }
      }),
      prisma.transaction.count()
    ]);

    return NextResponse.json({
      transactions,
      total,
      page,
      pageSize
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
