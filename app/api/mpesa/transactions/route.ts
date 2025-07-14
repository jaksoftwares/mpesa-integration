import { NextRequest, NextResponse } from 'next/server';
import { TransactionStore } from '@/lib/mpesa';

export async function GET(request: NextRequest) {
  try {
    const transactions = await TransactionStore.getAllTransactions();

    return NextResponse.json({ transactions });

  } catch (error) {
    console.error('Transactions fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}