import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { goldAssets } from '@/lib/db/schema';
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

    const transactions = await db
      .select()
      .from(goldAssets)
      .where(eq(goldAssets.userId, user.id))
      .orderBy(goldAssets.createdAt);

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction history' },
      { status: 500 }
    );
  }
}