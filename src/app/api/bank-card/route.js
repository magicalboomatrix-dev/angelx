import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { normalizeBankCardInput, parsePositiveInt } from '@/lib/validation';

export async function GET(req) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    const bankCards = await prisma.bankCard.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        accountNo: true,
        ifsc: true,
        payeeName: true,
        bankName: true,
        isSelected: true,
        createdAt: true,
      },
    });

    return new Response(JSON.stringify({ banks: bankCards }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Server error' }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    const normalized = normalizeBankCardInput(await req.json());
    if (normalized.error) {
      return new Response(JSON.stringify({ message: normalized.error }), { status: 400 });
    }

    const { accountNo, ifsc, payeeName, bankName } = normalized.value;

    const existingCard = await prisma.bankCard.findFirst({
      where: { userId: user.id, accountNo },
    });

    if (existingCard) {
      return new Response(JSON.stringify({ message: 'This account is already linked.' }), { status: 400 });
    }

    const cardCount = await prisma.bankCard.count({ where: { userId: user.id } });
    const bankCard = await prisma.bankCard.create({
      data: {
        userId: user.id,
        accountNo,
        ifsc,
        payeeName,
        bankName,
        isSelected: cardCount === 0,
      },
    });

    return new Response(JSON.stringify({ message: 'Bank card added successfully!', bankCard }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Server error' }), { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    const { id } = await req.json();
    const parsedId = parsePositiveInt(id);
    if (!parsedId) {
      return new Response(JSON.stringify({ message: 'Bank card ID required' }), { status: 400 });
    }

    const bankCard = await prisma.bankCard.findUnique({
      where: { id: parsedId },
    });

    if (!bankCard || bankCard.userId !== user.id) {
      return new Response(JSON.stringify({ message: 'Bank card not found or not yours' }), { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.bankCard.delete({
        where: { id: parsedId },
      });

      if (bankCard.isSelected) {
        const fallbackCard = await tx.bankCard.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
        });

        if (fallbackCard) {
          await tx.bankCard.update({
            where: { id: fallbackCard.id },
            data: { isSelected: true },
          });
        }
      }
    });

    return new Response(JSON.stringify({ message: 'Bank card deleted successfully' }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Server error' }), { status: 500 });
  }
}
