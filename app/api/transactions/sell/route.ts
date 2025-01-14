import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { userBalances, goldAssets, transactions } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

export async function POST(request: Request) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { goldType, amount, pricePerUnit, totalPrice } = data;

    // Start a transaction
    const result = await db.transaction(async (tx) => {
      // Check if user has enough gold to sell
      const [existingAsset] = await tx
        .select()
        .from(goldAssets)
        .where(
          and(
            eq(goldAssets.userId, user.id),
            eq(goldAssets.goldType, goldType)
          )
        )
        .limit(1);

      if (!existingAsset || Number(existingAsset.amount) < amount) {
        throw new Error('Insufficient gold balance');
      }

      // Update gold assets
      await tx
        .update(goldAssets)
        .set({
          amount: sql`${goldAssets.amount} - ${amount}`,
          updatedAt: new Date(),
        })
        .where(eq(goldAssets.id, existingAsset.id));

      // Update user balance
      await tx
        .update(userBalances)
        .set({
          balance: sql`${userBalances.balance} + ${totalPrice}`,
          updatedAt: new Date(),
        })
        .where(eq(userBalances.userId, user.id));

      // Record the transaction
      await tx.insert(transactions).values({
        userId: user.id,
        goldType,
        amount,
        pricePerUnit,
        totalPrice,
        type: 'sell',
      });

      // Return updated balances
      const [newBalance] = await tx
        .select()
        .from(userBalances)
        .where(eq(userBalances.userId, user.id))
        .limit(1);

      const [newAsset] = await tx
        .select()
        .from(goldAssets)
        .where(eq(goldAssets.id, existingAsset.id))
        .limit(1);

      return {
        balance: newBalance.balance,
        goldAmount: newAsset.amount
      };
    });

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error processing gold sale:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process sale' },
      { status: 500 }
    );
  }
}