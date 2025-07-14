import { MPesaConfig, PaymentRequest, PaymentResponse, Transaction } from '@/types/mpesa';
import { supabase, supabaseAdmin } from './supabase';

export class MPesaService {
  private config: MPesaConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(config: MPesaConfig) {
    this.config = config;
  }

  private getBaseUrl(): string {
    return this.config.environment === 'production' 
      ? 'https://api.safaricom.co.ke' 
      : 'https://sandbox.safaricom.co.ke';
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const auth = Buffer.from(`${this.config.consumerKey}:${this.config.consumerSecret}`).toString('base64');
    
    try {
      const response = await fetch(`${this.getBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to authenticate with M-Pesa API'}`);
      }

      const responseText = await response.text();
      
      if (!responseText) {
        throw new Error('Empty response from M-Pesa API');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Invalid JSON response from M-Pesa API: ${responseText}`);
      }
      
      if (data.access_token) {
        this.accessToken = data.access_token;
        this.tokenExpiry = Date.now() + (data.expires_in * 1000);
        return this.accessToken;
      }

      throw new Error(`No access token in response: ${JSON.stringify(data)}`);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`M-Pesa authentication failed: ${error.message}`);
      }
      throw new Error('M-Pesa authentication failed: Unknown error');
    }
  }

  private generatePassword(): string {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = Buffer.from(`${this.config.businessShortCode}${this.config.passkey}${timestamp}`).toString('base64');
    return password;
  }

  private getTimestamp(): string {
    return new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  }

  async initiateStkPush(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
  const accessToken = await this.getAccessToken();
  const timestamp = this.getTimestamp();
  const password = this.generatePassword();

  const payload = {
    BusinessShortCode: this.config.businessShortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: paymentRequest.amount,
    PartyA: paymentRequest.phoneNumber,
    PartyB: this.config.businessShortCode,
    PhoneNumber: paymentRequest.phoneNumber,
    CallBackURL: paymentRequest.callbackUrl,
    AccountReference: paymentRequest.accountReference,
    TransactionDesc: paymentRequest.transactionDesc
  };

  console.log('[MPESA] Sending STK Push with payload:', payload);

  const response = await fetch(`${this.getBaseUrl()}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  console.log('[MPESA] STK Push Response:', data);

  if (data.ResponseCode === '0') {
    return {
      merchantRequestId: data.MerchantRequestID,
      checkoutRequestId: data.CheckoutRequestID,
      responseCode: data.ResponseCode,
      responseDescription: data.ResponseDescription,
      customerMessage: data.CustomerMessage
    };
  }

  throw new Error(
    `[${data.ResponseCode || '??'}] ${data.ResponseDescription || 'Payment initiation failed'}`
  );
}

  async queryTransaction(checkoutRequestId: string): Promise<any> {
    const accessToken = await this.getAccessToken();
    const timestamp = this.getTimestamp();
    const password = this.generatePassword();

    const payload = {
      BusinessShortCode: this.config.businessShortCode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId
    };

    const response = await fetch(`${this.getBaseUrl()}/mpesa/stkpushquery/v1/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    return await response.json();
  }
}

// Supabase-based transaction store
export class TransactionStore {
  static async createTransaction(transaction: Omit<Transaction, 'id' | 'timestamp' | 'updatedAt'>): Promise<Transaction> {
    const { data, error } = await supabaseAdmin
      .from('mpesa_transactions')
      .insert({
        merchant_request_id: transaction.merchantRequestId,
        checkout_request_id: transaction.checkoutRequestId,
        amount: transaction.amount,
        phone_number: transaction.phoneNumber,
        account_reference: transaction.accountReference,
        transaction_desc: transaction.transactionDesc,
        status: transaction.status,
        mpesa_receipt_number: transaction.mpesaReceiptNumber
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating transaction:', error);
      throw new Error('Failed to create transaction');
    }

    return {
      id: data.id,
      merchantRequestId: data.merchant_request_id,
      checkoutRequestId: data.checkout_request_id,
      amount: data.amount,
      phoneNumber: data.phone_number,
      accountReference: data.account_reference,
      transactionDesc: data.transaction_desc,
      status: data.status,
      mpesaReceiptNumber: data.mpesa_receipt_number,
      timestamp: data.created_at,
      updatedAt: data.updated_at
    };
  }

  static async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | null> {
    const updateData: any = {};
    
    if (updates.status) updateData.status = updates.status;
    if (updates.mpesaReceiptNumber) updateData.mpesa_receipt_number = updates.mpesaReceiptNumber;
    if (updates.amount) updateData.amount = updates.amount;
    if (updates.phoneNumber) updateData.phone_number = updates.phoneNumber;

    const { data, error } = await supabaseAdmin
      .from('mpesa_transactions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating transaction:', error);
      return null;
    }

    return {
      id: data.id,
      merchantRequestId: data.merchant_request_id,
      checkoutRequestId: data.checkout_request_id,
      amount: data.amount,
      phoneNumber: data.phone_number,
      accountReference: data.account_reference,
      transactionDesc: data.transaction_desc,
      status: data.status,
      mpesaReceiptNumber: data.mpesa_receipt_number,
      timestamp: data.created_at,
      updatedAt: data.updated_at
    };
  }

  static async getTransaction(id: string): Promise<Transaction | null> {
    const { data, error } = await supabaseAdmin
      .from('mpesa_transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      merchantRequestId: data.merchant_request_id,
      checkoutRequestId: data.checkout_request_id,
      amount: data.amount,
      phoneNumber: data.phone_number,
      accountReference: data.account_reference,
      transactionDesc: data.transaction_desc,
      status: data.status,
      mpesaReceiptNumber: data.mpesa_receipt_number,
      timestamp: data.created_at,
      updatedAt: data.updated_at
    };
  }

  static async getTransactionByCheckoutRequestId(checkoutRequestId: string): Promise<Transaction | null> {
    const { data, error } = await supabaseAdmin
      .from('mpesa_transactions')
      .select('*')
      .eq('checkout_request_id', checkoutRequestId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      merchantRequestId: data.merchant_request_id,
      checkoutRequestId: data.checkout_request_id,
      amount: data.amount,
      phoneNumber: data.phone_number,
      accountReference: data.account_reference,
      transactionDesc: data.transaction_desc,
      status: data.status,
      mpesaReceiptNumber: data.mpesa_receipt_number,
      timestamp: data.created_at,
      updatedAt: data.updated_at
    };
  }

  static async getAllTransactions(): Promise<Transaction[]> {
    const { data, error } = await supabaseAdmin
      .from('mpesa_transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      merchantRequestId: item.merchant_request_id,
      checkoutRequestId: item.checkout_request_id,
      amount: item.amount,
      phoneNumber: item.phone_number,
      accountReference: item.account_reference,
      transactionDesc: item.transaction_desc,
      status: item.status,
      mpesaReceiptNumber: item.mpesa_receipt_number,
      timestamp: item.created_at,
      updatedAt: item.updated_at
    }));
  }

  static async getTransactionsByStatus(status: Transaction['status']): Promise<Transaction[]> {
    const { data, error } = await supabaseAdmin
      .from('mpesa_transactions')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transactions by status:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      merchantRequestId: item.merchant_request_id,
      checkoutRequestId: item.checkout_request_id,
      amount: item.amount,
      phoneNumber: item.phone_number,
      accountReference: item.account_reference,
      transactionDesc: item.transaction_desc,
      status: item.status,
      mpesaReceiptNumber: item.mpesa_receipt_number,
      timestamp: item.created_at,
      updatedAt: item.updated_at
    }));
  }

  static async getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    const { data, error } = await supabaseAdmin
      .from('mpesa_transactions')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transactions by date range:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      merchantRequestId: item.merchant_request_id,
      checkoutRequestId: item.checkout_request_id,
      amount: item.amount,
      phoneNumber: item.phone_number,
      accountReference: item.account_reference,
      transactionDesc: item.transaction_desc,
      status: item.status,
      mpesaReceiptNumber: item.mpesa_receipt_number,
      timestamp: item.created_at,
      updatedAt: item.updated_at
    }));
  }
}