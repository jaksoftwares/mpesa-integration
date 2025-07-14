import { NextRequest, NextResponse } from 'next/server';
import { MPesaService, TransactionStore } from '@/lib/mpesa';

export const dynamic = 'force-dynamic';

const mpesaService = new MPesaService({
  consumerKey: process.env.MPESA_CONSUMER_KEY || 'your_consumer_key',
  consumerSecret: process.env.MPESA_CONSUMER_SECRET || 'your_consumer_secret',
  businessShortCode: process.env.MPESA_BUSINESS_SHORTCODE || '174379',
  passkey: process.env.MPESA_PASSKEY || 'your_passkey',
  environment: (process.env.MPESA_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
});

export async function POST(request: NextRequest) {
  try {
    const { amount, phoneNumber, accountReference, transactionDesc } = await request.json();

    // Validate input
    if (!amount || !phoneNumber || !accountReference || !transactionDesc) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create callback URL
    const callbackUrl = `${request.nextUrl.origin}/api/mpesa/callback`;

    // Initiate STK push
    const paymentResponse = await mpesaService.initiateStkPush({
      amount,
      phoneNumber,
      accountReference,
      transactionDesc,
      callbackUrl
    });

    // Store transaction in database
    const transaction = await TransactionStore.createTransaction({
      merchantRequestId: paymentResponse.merchantRequestId,
      checkoutRequestId: paymentResponse.checkoutRequestId,
      amount,
      phoneNumber,
      accountReference,
      transactionDesc,
      status: 'pending'
    });

    return NextResponse.json({
      success: true,
      message: 'Payment initiated successfully',
      transaction,
      paymentResponse
    });

  } catch (error) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Payment initiation failed' },
      { status: 500 }
    );
  }
}