import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { userBalances, goldAssets, transactions } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { sendGoldSaleNotification } from '@/lib/telegram/bot';

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
      // Calculate total gold holdings and average cost for this type before the sale
      const [totalGold] = await tx
        .select({
          total: sql<string>`sum(${goldAssets.amount})`,
          totalCost: sql<string>`sum(${goldAssets.amount} * ${goldAssets.purchasePrice})`,
          avgCost: sql<string>`CASE 
            WHEN sum(${goldAssets.amount}) > 0 
            THEN sum(${goldAssets.amount} * ${goldAssets.purchasePrice}) / sum(${goldAssets.amount})
            ELSE 0 
          END`
        })
        .from(goldAssets)
        .where(
          and(
            eq(goldAssets.userId, user.id),
            eq(goldAssets.goldType, goldType)
          )
        );

      const currentBalance = Number(totalGold?.total || 0);
      const currentTotalCost = Number(totalGold?.totalCost || 0);
      const currentAvgCost = Number(totalGold?.avgCost || 0);
      
      if (currentBalance < amount) {
        throw new Error(`Insufficient gold balance. You have ${currentBalance} units available.`);
      }

      // Get all gold assets for this type
      const assets = await tx
        .select()
        .from(goldAssets)
        .where(
          and(
            eq(goldAssets.userId, user.id),
            eq(goldAssets.goldType, goldType)
          )
        )
        .orderBy(goldAssets.createdAt);

      let remainingAmountToSell = Number(amount);
      
      // Process each asset until we've sold the requested amount
      for (const asset of assets) {
        const assetAmount = Number(asset.amount);
        if (assetAmount <= 0) continue;

        const amountToSellFromAsset = Math.min(assetAmount, remainingAmountToSell);
        
        if (amountToSellFromAsset > 0) {
          await tx
            .update(goldAssets)
            .set({
              amount: sql`${goldAssets.amount} - ${amountToSellFromAsset}`,
              updatedAt: new Date(),
            })
            .where(eq(goldAssets.id, asset.id));

          remainingAmountToSell -= amountToSellFromAsset;
        }

        if (remainingAmountToSell <= 0) break;
      }

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

      // Calculate new balances and costs after the sale
      const [newBalance] = await tx
        .select()
        .from(userBalances)
        .where(eq(userBalances.userId, user.id))
        .limit(1);

      const [newTotalGold] = await tx
        .select({
          total: sql<string>`sum(${goldAssets.amount})`,
          totalCost: sql<string>`sum(${goldAssets.amount} * ${goldAssets.purchasePrice})`,
          avgCost: sql<string>`CASE 
            WHEN sum(${goldAssets.amount}) > 0 
            THEN sum(${goldAssets.amount} * ${goldAssets.purchasePrice}) / sum(${goldAssets.amount})
            ELSE 0 
          END`
        })
        .from(goldAssets)
        .where(
          and(
            eq(goldAssets.userId, user.id),
            eq(goldAssets.goldType, goldType)
          )
        );

      const remainingAmount = Number(newTotalGold.total || 0);
      const remainingTotalCost = Number(newTotalGold.totalCost || 0);
      const remainingAvgCost = Number(newTotalGold.avgCost || 0);

      // Calculate profit/loss
      const profitLoss = totalPrice - (Number(amount) * currentAvgCost);

      // Send Telegram notification after transaction is complete
      await Promise.allSettled([
        sendGoldSaleNotification({
          userName: user.name || user.email,
          goldType,
          amount: Number(amount),
          totalPrice: Number(totalPrice),
          pricePerUnit: Number(pricePerUnit),
          profitLoss
        })
      ]);

      return {
        balance: newBalance.balance,
        goldAmount: remainingAmount.toString(),
        averageCost: remainingAvgCost,
        totalCost: remainingTotalCost,
        previousAvgCost: currentAvgCost,
        previousTotalCost: currentTotalCost
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