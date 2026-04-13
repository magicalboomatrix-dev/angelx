import prisma from '@/lib/prisma';
import { getOrCreateSettings, serializeDepositInfo } from '@/lib/settings';

export async function GET(req) {
  try {
    const settings = await getOrCreateSettings(prisma);
    const depositInfo = serializeDepositInfo(settings);

    return new Response(JSON.stringify(depositInfo), { status: 200 });
  } catch (err) {
    console.error('Error fetching deposit info:', err);
    return new Response(
      JSON.stringify({ error: "Failed to fetch deposit info" }),
      { status: 500 }
    );
  }
}
