import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { serializeTransactions } from '@/lib/serializers';

export async function GET(req) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const history = await prisma.transaction.findMany({
      where: { userId: user.id, type: 'DEPOSIT' },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return new Response(
      JSON.stringify({ history: serializeTransactions(history) }),
      { status: 200 }
    );
  } catch (err) {
    console.error('Error fetching deposit history:', err);
    return new Response(
      JSON.stringify({ error: 'Server error' }),
      { status: 500 }
    );
  }
}
