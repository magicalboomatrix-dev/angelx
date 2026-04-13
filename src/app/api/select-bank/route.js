import prisma from "@/lib/prisma";
import { getCurrentUser } from '@/lib/auth';
import { parsePositiveInt } from '@/lib/validation';

export async function POST(req) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    const { bankId } = await req.json();
    const parsedBankId = parsePositiveInt(bankId);
    if (!parsedBankId) {
      return new Response(JSON.stringify({ message: 'Bank ID is required' }), { status: 400 });
    }

    const bank = await prisma.bankCard.findFirst({
      where: { id: parsedBankId, userId: user.id },
    });

    if (!bank) {
      return new Response(JSON.stringify({ message: "Bank not found" }), { status: 404 });
    }

    await prisma.$transaction([
      prisma.bankCard.updateMany({
        where: { userId: user.id },
        data: { isSelected: false },
      }),
      prisma.bankCard.update({
        where: { id: bank.id },
        data: { isSelected: true },
      }),
    ]);

    const selectedBank = await prisma.bankCard.findUnique({
      where: { id: bank.id },
    });

    return new Response(JSON.stringify({ message: "Bank selected", bank: selectedBank }), { status: 200 });
  } catch (error) {
    console.error("Error selecting bank:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
}
