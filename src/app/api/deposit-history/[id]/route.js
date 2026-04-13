import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { serializeTransaction } from '@/lib/serializers';

export async function GET(req, { params }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return new Response(JSON.stringify({ error: 'Invalid ID' }), { status: 400 });
    }

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId: user.id, type: 'DEPOSIT' },
    });

    if (!transaction) {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    }

    return new Response(
      JSON.stringify({ transaction: serializeTransaction(transaction) }),
      { status: 200 }
    );
  } catch (err) {
    console.error('Error fetching deposit detail:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
