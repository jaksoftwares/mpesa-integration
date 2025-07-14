'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Shield, BarChart3, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-16">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <span className="text-3xl font-bold text-green-600">M-PESA</span>
              <span className="text-3xl font-bold text-gray-900">Payment Module</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Complete Payment Integration
              <br />
              <span className="text-green-600">Made Simple</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Professional M-Pesa payment module with real-time verification, transaction tracking, 
              and comprehensive analytics dashboard. Ready to integrate into any Next.js application.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/mpesa">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  <Smartphone className="mr-2 h-5 w-5" />
                  Try Live Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                <BarChart3 className="mr-2 h-5 w-5" />
                View Analytics
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <Card className="text-center">
              <CardHeader>
                <Smartphone className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <CardTitle className="text-lg">STK Push</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Seamless mobile payment experience with M-Pesa STK Push integration
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                <CardTitle className="text-lg">Real-time Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Instant transaction verification with secure callback handling
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <BarChart3 className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                <CardTitle className="text-lg">Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Comprehensive analytics with charts, reports, and insights
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Zap className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                <CardTitle className="text-lg">Easy Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Modular design that can be integrated into any Next.js application
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Technical Features */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Frontend</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Next.js 13+</Badge>
                  <Badge variant="secondary">React 18</Badge>
                  <Badge variant="secondary">TypeScript</Badge>
                  <Badge variant="secondary">Tailwind CSS</Badge>
                  <Badge variant="secondary">shadcn/ui</Badge>
                  <Badge variant="secondary">Recharts</Badge>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Backend</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Safaricom Daraja API</Badge>
                  <Badge variant="secondary">REST API</Badge>
                  <Badge variant="secondary">Webhook Handling</Badge>
                  <Badge variant="secondary">Real-time Polling</Badge>
                  <Badge variant="secondary">Transaction Storage</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Integration Steps */}
          <div className="text-left max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Integration Steps</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Configure M-Pesa Credentials</h3>
                  <p className="text-gray-600">Set up your Safaricom Daraja API credentials in environment variables</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Import Components</h3>
                  <p className="text-gray-600">Import PaymentForm and other components into your application</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Handle Callbacks</h3>
                  <p className="text-gray-600">Implement success/error handlers to unlock content or services</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">4</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Monitor & Analyze</h3>
                  <p className="text-gray-600">Use the analytics dashboard to track performance and revenue</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-green-600 text-white rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Ready to Start Accepting M-Pesa Payments?</h2>
            <p className="text-green-100 mb-6">
              Get started with our comprehensive payment module and start accepting payments in minutes.
            </p>
            <Link href="/mpesa">
              <Button size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
                <Smartphone className="mr-2 h-5 w-5" />
                Try Live Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}