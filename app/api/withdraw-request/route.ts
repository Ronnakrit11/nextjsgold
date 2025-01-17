import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { withdrawalRequests } from '@/lib/db/schema';
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
    const { goldType, amount, name, tel, address } = data;

    // Create withdrawal request
    await db.insert(withdrawalRequests).values({
      userId: user.id,
      goldType,
      amount,
      name,
      tel,
      address,
      status: 'pending'
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating withdrawal request:', error);
    return NextResponse.json(
      { error: 'Failed to create withdrawal request' },
      { status: 500 }
    );
  }
}