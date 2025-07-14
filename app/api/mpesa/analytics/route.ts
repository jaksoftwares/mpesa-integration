import { NextRequest, NextResponse } from 'next/server';
import { TransactionStore } from '@/lib/mpesa';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30days';

    const transactions = await TransactionStore.getAllTransactions();
    
    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (range) {
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const filteredTransactions = transactions.filter(
      t => new Date(t.timestamp) >= startDate
    );

    // Calculate metrics
    const totalRevenue = filteredTransactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalTransactions = filteredTransactions.length;
    const completedTransactions = filteredTransactions.filter(t => t.status === 'completed').length;
    const successRate = totalTransactions > 0 ? (completedTransactions / totalTransactions) * 100 : 0;
    const averageAmount = completedTransactions > 0 ? totalRevenue / completedTransactions : 0;

    // Calculate growth (compare with previous period)
    const previousPeriodStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
    const previousTransactions = transactions.filter(
      t => new Date(t.timestamp) >= previousPeriodStart && new Date(t.timestamp) < startDate
    );
    
    const previousRevenue = previousTransactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const revenueGrowth = previousRevenue > 0 ? 
      ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    
    const transactionGrowth = previousTransactions.length > 0 ? 
      ((totalTransactions - previousTransactions.length) / previousTransactions.length) * 100 : 0;

    // Status distribution
    const statusCounts = {
      pending: filteredTransactions.filter(t => t.status === 'pending').length,
      completed: filteredTransactions.filter(t => t.status === 'completed').length,
      failed: filteredTransactions.filter(t => t.status === 'failed').length,
      cancelled: filteredTransactions.filter(t => t.status === 'cancelled').length
    };

    const statusDistribution = [
      { name: 'completed', value: statusCounts.completed, color: '#00A651' },
      { name: 'pending', value: statusCounts.pending, color: '#FFA500' },
      { name: 'failed', value: statusCounts.failed, color: '#FF0000' },
      { name: 'cancelled', value: statusCounts.cancelled, color: '#808080' }
    ];

    // Daily revenue data
    const dailyRevenue: { [key: string]: { revenue: number; transactions: number } } = {};
    
    filteredTransactions.forEach(t => {
      const date = new Date(t.timestamp).toISOString().split('T')[0];
      if (!dailyRevenue[date]) {
        dailyRevenue[date] = { revenue: 0, transactions: 0 };
      }
      dailyRevenue[date].transactions += 1;
      if (t.status === 'completed') {
        dailyRevenue[date].revenue += t.amount;
      }
    });

    const dailyRevenueArray = Object.entries(dailyRevenue).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      transactions: data.transactions
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Monthly revenue data
    const monthlyRevenue: { [key: string]: { revenue: number; transactions: number } } = {};
    
    filteredTransactions.forEach(t => {
      const date = new Date(t.timestamp);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyRevenue[month]) {
        monthlyRevenue[month] = { revenue: 0, transactions: 0 };
      }
      monthlyRevenue[month].transactions += 1;
      if (t.status === 'completed') {
        monthlyRevenue[month].revenue += t.amount;
      }
    });

    const monthlyRevenueArray = Object.entries(monthlyRevenue).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      transactions: data.transactions
    })).sort((a, b) => a.month.localeCompare(b.month));

    const analytics = {
      totalRevenue,
      totalTransactions,
      successRate,
      averageAmount,
      revenueGrowth,
      transactionGrowth,
      statusDistribution,
      dailyRevenue: dailyRevenueArray,
      monthlyRevenue: monthlyRevenueArray
    };

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}