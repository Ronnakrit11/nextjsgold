import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { userBalances } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { redis, CACHE_KEYS, CACHE_TTL } from '@/lib/redis';

export async function GET() {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Try to get cached balance
    const cachedBalance = await redis.get(CACHE_KEYS.USER_BALANCE(user.id));
    if (cachedBalance) {
      return NextResponse.json({
        balance: cachedBalance
      });
    }

    // If not cached, fetch from database
    const balance = await db
      .select()
      .from(userBalances)
      .where(eq(userBalances.userId, user.id))
      .limit(1);

    const userBalance = balance[0]?.balance || '0';

    // Cache the balance
    await redis.set(CACHE_KEYS.USER_BALANCE(user.id), userBalance, {
      ex: CACHE_TTL.USER_BALANCE
    });

    return NextResponse.json({
      balance: userBalance
    });
  } catch (error) {
    console.error('Error fetching user balance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch balance' },
      { status: 500 }
    );
  }
}