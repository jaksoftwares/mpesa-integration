'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Smartphone, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Transaction } from '@/types/mpesa';

interface PaymentFormProps {
  amount: number;
  description: string;
  onSuccess: (transaction: Transaction) => void;
  onError: (error: string) => void;
}

export default function PaymentForm({ amount, description, onSuccess, onError }: PaymentFormProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [transaction, setTransaction] = useState<Transaction | null>(null);

  const formatPhoneNumber = (phone: string) => {
    // Remove any non-digit characters
    phone = phone.replace(/\D/g, '');
    
    // Convert to 254 format
    if (phone.startsWith('0')) {
      phone = '254' + phone.slice(1);
    } else if (phone.startsWith('+254')) {
      phone = phone.slice(1);
    } else if (phone.startsWith('254')) {
      phone = phone;
    }
    
    return phone;
  };

  const validatePhoneNumber = (phone: string) => {
    const formatted = formatPhoneNumber(phone);
    return formatted.length === 12 && formatted.startsWith('254');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePhoneNumber(phoneNumber)) {
      onError('Please enter a valid Kenyan phone number');
      return;
    }

    setLoading(true);
    setPaymentStatus('pending');
    setStatusMessage('Initiating payment...');

    try {
      const response = await fetch('/api/mpesa/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          phoneNumber: formatPhoneNumber(phoneNumber),
          accountReference: `PAY-${Date.now()}`,
          transactionDesc: description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment initiation failed');
      }

      setTransaction(data.transaction);
      setStatusMessage('Payment request sent. Please complete the payment on your phone.');
      
      // Start polling for payment status
      pollPaymentStatus(data.transaction.id);
      
    } catch (error) {
      setPaymentStatus('failed');
      setStatusMessage('Payment initiation failed');
      onError(error instanceof Error ? error.message : 'Payment failed');
      setLoading(false);
    }
  };

  const pollPaymentStatus = async (transactionId: string) => {
    let attempts = 0;
    const maxAttempts = 30; // Poll for 5 minutes (30 * 10 seconds)

    const poll = async () => {
      try {
        const response = await fetch(`/api/mpesa/status/${transactionId}`);
        const data = await response.json();

        if (data.transaction.status === 'completed') {
          setPaymentStatus('success');
          setStatusMessage('Payment completed successfully!');
          setLoading(false);
          onSuccess(data.transaction);
          return;
        }

        if (data.transaction.status === 'failed' || data.transaction.status === 'cancelled') {
          setPaymentStatus('failed');
          setStatusMessage('Payment failed or was cancelled');
          setLoading(false);
          onError('Payment failed or was cancelled');
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000); // Poll every 10 seconds
        } else {
          setPaymentStatus('failed');
          setStatusMessage('Payment timeout. Please try again.');
          setLoading(false);
          onError('Payment timeout');
        }
      } catch (error) {
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000);
        } else {
          setPaymentStatus('failed');
          setStatusMessage('Unable to verify payment status');
          setLoading(false);
          onError('Unable to verify payment status');
        }
      }
    };

    poll();
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'pending':
        return <Loader2 className="h-5 w-5 animate-spin text-yellow-500" />;
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Smartphone className="h-5 w-5 text-green-600" />;
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'success':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="text-xl font-bold text-green-600">M-PESA</span>
        </div>
        <CardTitle>Complete Payment</CardTitle>
        <CardDescription>Pay with M-Pesa</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            KSH {amount.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 mt-1">{description}</div>
        </div>

        {paymentStatus !== 'idle' && (
          <Alert className={`${getStatusColor()}`}>
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <AlertDescription>{statusMessage}</AlertDescription>
            </div>
          </Alert>
        )}

        {paymentStatus === 'idle' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0712345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className="text-center"
              />
              <p className="text-xs text-gray-500 text-center">
                Enter your M-Pesa registered phone number
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={loading || !phoneNumber}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Smartphone className="mr-2 h-4 w-4" />
                  Pay with M-Pesa
                </>
              )}
            </Button>
          </form>
        )}

        {paymentStatus === 'pending' && (
          <div className="text-center space-y-4">
            <div className="animate-pulse">
              <Smartphone className="h-16 w-16 mx-auto text-green-600" />
            </div>
            <div className="space-y-2">
              <p className="font-medium">Check your phone</p>
              <p className="text-sm text-gray-600">
                You'll receive an M-Pesa prompt on your phone. Enter your M-Pesa PIN to complete the payment.
              </p>
            </div>
            <Badge variant="outline" className="text-yellow-600 border-yellow-300">
              <Clock className="h-3 w-3 mr-1" />
              Waiting for payment...
            </Badge>
          </div>
        )}

        {paymentStatus === 'success' && transaction && (
          <div className="text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 mx-auto text-green-600" />
            <div className="space-y-2">
              <p className="font-medium text-green-600">Payment Successful!</p>
              <p className="text-sm text-gray-600">
                Transaction ID: {transaction.mpesaReceiptNumber}
              </p>
            </div>
            <Badge className="bg-green-100 text-green-800">
              Payment Confirmed
            </Badge>
          </div>
        )}

        {paymentStatus === 'failed' && (
          <div className="text-center space-y-4">
            <XCircle className="h-16 w-16 mx-auto text-red-600" />
            <div className="space-y-2">
              <p className="font-medium text-red-600">Payment Failed</p>
              <p className="text-sm text-gray-600">
                Please try again or contact support if the problem persists.
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                setPaymentStatus('idle');
                setStatusMessage('');
                setTransaction(null);
              }}
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}