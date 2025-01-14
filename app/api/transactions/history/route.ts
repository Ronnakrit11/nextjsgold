import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { goldAssets, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

export async function GET() {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // If admin (ronnakritnook1@gmail.com), fetch all transactions
    if (user.email === 'ronnakritnook1@gmail.com') {
      const allTransactions = await db
        .select({
          id: goldAssets.id,
          goldType: goldAssets.goldType,
          amount: goldAssets.amount,
          purchasePrice: goldAssets.purchasePrice,
          createdAt: goldAssets.createdAt,
          updatedAt: goldAssets.updatedAt,
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(goldAssets)
        .leftJoin(users, eq(goldAssets.userId, users.id))
        .orderBy(goldAssets.createdAt);

      return NextResponse.json(allTransactions);
    }

    // For regular users, fetch only their transactions
    const userTransactions = await db
      .select({
        id: goldAssets.id,
        goldType: goldAssets.goldType,
        amount: goldAssets.amount,
        purchasePrice: goldAssets.purchasePrice,
        createdAt: goldAssets.createdAt,
        updatedAt: goldAssets.updatedAt,
      })
      .from(goldAssets)
      .where(eq(goldAssets.userId, user.id))
      .orderBy(goldAssets.createdAt);

    return NextResponse.json(userTransactions);
  } catch (error) {
    console.error('Error fetching gold assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gold assets' },
      { status: 500 }
    );
  }
}