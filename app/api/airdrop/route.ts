import { NextResponse } from "next/server";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { LRUCache } from "lru-cache";

const RPC_URL = `${process.env.NEXT_PUBLIC_RPC_URL}`;

const rateLimitCache = new LRUCache<
  string,
  { count: number; firstRequest: number }
>({
  max: 500, // Maximum number of wallet addresses to store
  ttl: 1000 * 60 * 60, // 1 hour in milliseconds
});

export async function POST(request: Request) {
  const { walletAddress, amount } = await request.json();

  if (!walletAddress || !amount) {
    return NextResponse.json({ message: "No wallet found!" }, { status: 400 });
  }

  const now = Date.now();
  const rateLimitData = rateLimitCache.get(walletAddress);

  if (rateLimitData) {
    if (
      rateLimitData.count >= 2 &&
      now - rateLimitData.firstRequest < 3600000
    ) {
      // 1 hour in ms
      return NextResponse.json(
        { message: "Rate limit exceeded. Please wait before trying again." },
        { status: 429 },
      );
    } else if (now - rateLimitData.firstRequest >= 3600000) {
      rateLimitCache.set(walletAddress, { count: 1, firstRequest: now });
    } else {
      rateLimitCache.set(walletAddress, {
        count: rateLimitData.count + 1,
        firstRequest: rateLimitData.firstRequest,
      });
    }
  } else {
    rateLimitCache.set(walletAddress, { count: 1, firstRequest: now });
  }

  try {
    const lamports = amount * LAMPORTS_PER_SOL;
    const connection = new Connection(RPC_URL, "confirmed");
    const publicKey = new PublicKey(walletAddress);
    const airdropSignature = await connection.requestAirdrop(
      publicKey,
      lamports,
    );

    return NextResponse.json(
      {
        message: `Successfully airdropped ${amount} sol`,
        signature: airdropSignature,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Error airdropping solana!", error);
    return NextResponse.json(
      { message: "Internal server error!" },
      { status: 500 },
    );
  }
}
