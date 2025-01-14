import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { transactions, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
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
          id: transactions.id,
          goldType: transactions.goldType,
          amount: transactions.amount,
          pricePerUnit: transactions.pricePerUnit,
          totalPrice: transactions.totalPrice,
          type: transactions.type,
          createdAt: transactions.createdAt,
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(transactions)
        .leftJoin(users, eq(transactions.userId, users.id))
        .orderBy(desc(transactions.createdAt));

      return NextResponse.json(allTransactions);
    }

    // For regular users, fetch only their transactions
    const userTransactions = await db
      .select({
        id: transactions.id,
        goldType: transactions.goldType,
        amount: transactions.amount,
        pricePerUnit: transactions.pricePerUnit,
        totalPrice: transactions.totalPrice,
        type: transactions.type,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .where(eq(transactions.userId, user.id))
      .orderBy(desc(transactions.createdAt));

    return NextResponse.json(userTransactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}