import prisma from '@/lib/prisma';

export async function GET(req) {
  try {
    const settings = await prisma.settings.findFirst();
    
    if (!settings) {
      return new Response(
        JSON.stringify({ error: "Settings not found" }),
        { status: 404 }
      );
    }

    const depositInfo = {
      TRC20: {
        address: settings.trc20Address,
        qrUrl: settings.trc20QrUrl,
      },
      ERC20: {
        address: settings.erc20Address,
        qrUrl: settings.erc20QrUrl,
      },
    };

    return new Response(JSON.stringify(depositInfo), { status: 200 });
  } catch (err) {
    console.error('Error fetching deposit info:', err);
    return new Response(
      JSON.stringify({ error: "Failed to fetch deposit info" }),
      { status: 500 }
    );
  }
}
