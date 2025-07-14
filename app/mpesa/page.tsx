'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PaymentForm from '@/components/mpesa/PaymentForm';
import TransactionHistory from '@/components/mpesa/TransactionHistory';
import AnalyticsDashboard from '@/components/mpesa/AnalyticsDashboard';
import { Transaction } from '@/types/mpesa';
import { Smartphone, BarChart3, History, CheckCircle2 } from 'lucide-react';

export default function MPesaPage() {
  const [paymentSuccess, setPaymentSuccess] = useState<Transaction | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handlePaymentSuccess = (transaction: Transaction) => {
    setPaymentSuccess(transaction);
    setPaymentError(null);
    // Here you would typically unlock the content or service
    // For example: unlockPremiumFeature(transaction.accountReference);
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
    setPaymentSuccess(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              M-Pesa Payment System
            </h1>
            <p className="text-gray-600">
              Complete payment integration with real-time verification and analytics
            </p>
          </div>

          {/* Success/Error Messages */}
          {paymentSuccess && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Payment successful! Transaction ID: {paymentSuccess.mpesaReceiptNumber}
                <br />
                Your content has been unlocked.
              </AlertDescription>
            </Alert>
          )}

          {paymentError && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {paymentError}
              </AlertDescription>
            </Alert>
          )}

          {/* Main Content */}
          <Tabs defaultValue="payment" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="payment" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Payment
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                History
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="payment">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <PaymentForm
                    amount={1000}
                    description="Premium Feature Access"
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </div>
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Integration Guide</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="prose prose-sm max-w-none">
                        <h3>How to integrate this payment module:</h3>
                        <ol>
                          <li>Configure your M-Pesa credentials in environment variables</li>
                          <li>Import the PaymentForm component in your application</li>
                          <li>Handle the onSuccess callback to unlock your content</li>
                          <li>Use the analytics dashboard to track performance</li>
                        </ol>
                        
                        <h3>Environment Variables Required:</h3>
                        <ul>
                          <li><code>MPESA_CONSUMER_KEY</code></li>
                          <li><code>MPESA_CONSUMER_SECRET</code></li>
                          <li><code>MPESA_BUSINESS_SHORTCODE</code></li>
                          <li><code>MPESA_PASSKEY</code></li>
                          <li><code>MPESA_ENVIRONMENT</code> (sandbox/production)</li>
                        </ul>

                        <h3>Features:</h3>
                        <ul>
                          <li>STK Push integration</li>
                          <li>Real-time transaction verification</li>
                          <li>Transaction history and analytics</li>
                          <li>Responsive design</li>
                          <li>Export functionality</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <TransactionHistory />
            </TabsContent>

            <TabsContent value="analytics">
              <AnalyticsDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}