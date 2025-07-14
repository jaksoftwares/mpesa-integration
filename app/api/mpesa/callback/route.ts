import { NextRequest, NextResponse } from 'next/server';
import { TransactionStore } from '@/lib/mpesa';

export async function POST(request: NextRequest) {
  try {
    const callbackData = await request.json();
    
    console.log('M-Pesa Callback:', JSON.stringify(callbackData, null, 2));

    const { Body } = callbackData;
    const { stkCallback } = Body;

    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata
    } = stkCallback;

    // Find transaction by checkout request ID
    const transaction = await TransactionStore.getTransactionByCheckoutRequestId(CheckoutRequestID);

    if (!transaction) {
      console.error('Transaction not found for CheckoutRequestID:', CheckoutRequestID);
      return NextResponse.json({ success: false, error: 'Transaction not found' });
    }

    // Update transaction based on result code
    if (ResultCode === 0) {
      // Payment successful
      let mpesaReceiptNumber = '';
      let amount = transaction.amount;
      let phoneNumber = transaction.phoneNumber;

      if (CallbackMetadata && CallbackMetadata.Item) {
        const items = CallbackMetadata.Item;
        const receiptItem = items.find((item: any) => item.Name === 'MpesaReceiptNumber');
        const amountItem = items.find((item: any) => item.Name === 'Amount');
        const phoneItem = items.find((item: any) => item.Name === 'PhoneNumber');

        if (receiptItem) mpesaReceiptNumber = receiptItem.Value;
        if (amountItem) amount = amountItem.Value;
        if (phoneItem) phoneNumber = phoneItem.Value;
      }

      await TransactionStore.updateTransaction(transaction.id, {
        status: 'completed',
        mpesaReceiptNumber,
        amount,
        phoneNumber
      });

      console.log('Payment completed successfully:', mpesaReceiptNumber);
    } else {
      // Payment failed
      await TransactionStore.updateTransaction(transaction.id, {
        status: 'failed'
      });

      console.log('Payment failed:', ResultDesc);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Callback processing error:', error);
    return NextResponse.json(
      { success: false, error: 'Callback processing failed' },
      { status: 500 }
    );
  }
}