import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { userBalances, goldAssets } from '@/lib/db/schema';
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
      // Update user balance
      await tx
        .update(userBalances)
        .set({
          balance: sql`${userBalances.balance} - ${totalPrice}`,
          updatedAt: new Date(),
        })
        .where(eq(userBalances.userId, user.id));

      // Add to user's gold assets
      const existingAsset = await tx
        .select()
        .from(goldAssets)
        .where(
          and(
            eq(goldAssets.userId, user.id),
            eq(goldAssets.goldType, goldType)
          )
        )
        .limit(1);

      if (existingAsset.length > 0) {
        // Update existing asset
        await tx
          .update(goldAssets)
          .set({
            amount: sql`${goldAssets.amount} + ${amount}`,
            updatedAt: new Date(),
          })
          .where(eq(goldAssets.id, existingAsset[0].id));
      } else {
        // Create new asset record
        await tx.insert(goldAssets).values({
          userId: user.id,
          goldType,
          amount,
          purchasePrice: pricePerUnit,
        });
      }

      // Return updated balances
      const [newBalance] = await tx
        .select()
        .from(userBalances)
        .where(eq(userBalances.userId, user.id))
        .limit(1);

      const [newAsset] = await tx
        .select()
        .from(goldAssets)
        .where(
          and(
            eq(goldAssets.userId, user.id),
            eq(goldAssets.goldType, goldType)
          )
        )
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
    console.error('Error processing gold purchase:', error);
    return NextResponse.json(
      { error: 'Failed to process purchase' },
      { status: 500 }
    );
  }
}