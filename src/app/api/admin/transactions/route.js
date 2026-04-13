import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { verifyAdminCookie } from '@/app/lib/adminAuth';
import { parsePositiveInt } from '@/lib/validation';
import { serializeTransactions } from '@/lib/serializers';

export async function GET(request) {
  const auth = verifyAdminCookie(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');
  const search = (searchParams.get('search') || '').trim();
  const type = (searchParams.get('type') || '').trim();
  const status = (searchParams.get('status') || '').trim();
  const userId = parsePositiveInt(searchParams.get('userId'));
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';
  const skip = (page - 1) * pageSize;

  const where = {
    ...(type ? { type } : {}),
    ...(status ? { status } : {}),
    ...(userId ? { userId } : {}),
    ...(search
      ? {
          OR: [
            { referenceId: { contains: search, mode: 'insensitive' } },
            { user: { mobile: { contains: search, mode: 'insensitive' } } },
            { txnId: { contains: search, mode: 'insensitive' } },
            { address: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const orderBy = ['createdAt', 'amount', 'status', 'type', 'reviewedAt'].includes(sortBy)
    ? { [sortBy]: sortOrder }
    : { createdAt: 'desc' };

  try {
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        skip,
        take: pageSize,
        where,
        orderBy,
        select: {
          id: true,
          userId: true,
          adminId: true,
          referenceId: true,
          txnId: true,
          type: true,
          amount: true,
          currency: true,
          network: true,
          address: true,
          status: true,
          description: true,
          reviewNote: true,
          reviewedAt: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              mobile: true,
            }
          },
          reviewedBy: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      }),
      prisma.transaction.count({ where })
    ]);

    return NextResponse.json({
      transactions: serializeTransactions(transactions),
      total,
      page,
      pageSize
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
