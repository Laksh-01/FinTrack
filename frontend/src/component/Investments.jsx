import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { cn } from '../lib/utils';
import { TrendingUp } from 'lucide-react';

const COLORS = [
  '#FFD166',
  '#06D6A0',
  '#118AB2',
  '#EF476F',
  '#8338EC',
  '#FFBE0B',
];

const InvestmentOverview = ({ accounts, transactions }) => {
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts.find((a) => a.isDefault)?.id || accounts[0]?.id || ''
  );

  const accountInvestments = transactions.filter(
    (t) => t.accountId === selectedAccountId && t.type === 'INVESTMENTS'
  );

  const recentInvestments = accountInvestments
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const investmentsByCategory = accountInvestments.reduce((acc, transaction) => {
    const category = transaction.category || 'Uncategorized';
    if (!acc[category]) acc[category] = 0;
    acc[category] += Number(transaction.amount);
    return acc;
  }, {});

  const pieChartData = Object.entries(investmentsByCategory).map(
    ([category, value]) => ({
      name: category,
      value,
    })
  );

  const totalInvested = pieChartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 p-5">
      {/* Recent Investments Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-normal">Recent Investments</CardTitle>
          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentInvestments.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No recent investments
              </p>
            ) : (
              recentInvestments.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {transaction.description || 'Unnamed Investment'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(transaction.date), 'PP')}
                    </p>
                  </div>
                  <div className="flex items-center text-blue-500">
                    <TrendingUp className="mr-1 h-4 w-4" />
                    ₹{!isNaN(transaction.amount) ? Number(transaction.amount).toFixed(2) : '0.00'}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Investment Breakdown Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-normal">Investment Distribution</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-5">
          {pieChartData.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No investments available
            </p>
          ) : (
            <>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      labelLine={false}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `₹${Number(value).toFixed(2)}`}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-muted-foreground pt-2">
                Total Invested: ₹{Number(totalInvested).toFixed(2)}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestmentOverview;
