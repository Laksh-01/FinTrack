import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { format } from 'date-fns';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { cn } from '../lib/utils';
import { TrendingUp } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Slider } from "../../components/ui/slider";
import { fi } from 'date-fns/locale';


const COLORS = [
  '#FFD166', '#06D6A0', '#118AB2', '#EF476F', '#8338EC', '#FFBE0B',
];

// 🧠 Helper to parse raw AI text into usable array
const parseAiText = (text) => {
  const lines = text.split('\n').filter(Boolean);
  const results = [];
  let current = {};

  lines.forEach(line => {
    if (line.startsWith("Year:")) {
      if (Object.keys(current).length) results.push(current);
      current = { year: Number(line.split(":")[1].trim()) };
    } else if (line.includes("Portfolio Value")) {
      const value = Number(line.match(/₹([\d,]+)/)?.[1]?.replace(/,/g, '') || 0);
      current.value = value;
    } else if (line.includes("Gain/Loss")) {
      const gain = Number(line.match(/([+-]?\d+)%/)?.[1] || 0);
      current.gain = gain;
    } else if (line.startsWith("Summary:")) {
      current.summary = line.replace("Summary:", "").trim();
    } else if (line.startsWith("Inflation Projected")) {
      const inflation = Number(line.match(/([\d.]+)%/)?.[1] || 0);
      current.inflation = inflation;
    }
  });

  if (Object.keys(current).length) results.push(current);
  return results;
};


const InvestmentPage = ({ accountId }) => {
  const navigate = useNavigate();
  const [transactions, setTransaction] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiData, setAiData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(1);
  const [investedVal , setInvestedVal] = useState([]);

  const getProjectedData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/investments/predict`, {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ accountId })
      });

      if (!response.ok) throw new Error('Failed to fetch projections');
      const result = await response.json();
     
      const parsed = parseAiText(result.data);
     
      setAiData(parsed);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };


  const getInvestedVal = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/investments/calculate-total`, {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ accountId })
      });

      if (!response.ok) throw new Error('Failed to fetch projections');
      const result = await response.json();
    setInvestedVal(result.data);
     
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactions = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/investments/get-data`, {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ accountId })
      });

      if (!response.ok) throw new Error('Failed to fetch transactions');
      const result = await response.json();
      setTransaction(result.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accountId) {
      getTransactions();
      getProjectedData();
      getInvestedVal();
    }
  }, [accountId]);

  const accountInvestments = transactions.filter(
    (t) => t.accountId === accountId && t.type === 'INVESTMENTS'
  );

  const recentInvestments = accountInvestments
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 30);

  const investmentsByCategory = accountInvestments.reduce((acc, transaction) => {
    const category = transaction.category || 'Uncategorized';
    if (!acc[category]) acc[category] = 0;
    acc[category] += Number(transaction.amount);
    return acc;
  }, {});

  const pieChartData = Object.entries(investmentsByCategory).map(
    ([category, value]) => ({ name: category, value })
  );

  const totalInvested = pieChartData.reduce((sum, item) => sum + item.value, 0);


  const selectedData = aiData.find(d => d.year === selectedYear);
  const filteredData = aiData.filter(item => item.year <= selectedYear);




  return (
    <div className='p-10'>

      {/* Grid Cards */}
      <div className="grid gap-4 md:grid-cols-2 p-5">

        {/* 🟩 Recent Investments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base font-normal">Recent Investments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInvestments.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No recent investments
                </p>
              ) : (
                recentInvestments.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between">
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

        {/* 🟨 Pie Chart Distribution */}
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

      {/* 📈 AI Projection */}
      <div className="m-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-normal">Investment Tracker (AI)</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-6">

            {/* 🔘 Slider */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Projection Year: {selectedYear} year(s)
              </label>
              <Slider
                min={1}
                max={10}
                step={1}
                defaultValue={[1]}
                onValueChange={(val) => setSelectedYear(val[0])}
                className="w-full"
              />
            </div>

            {/* 📊 AI Result */}
            {selectedData ? (
              <div className="text-sm bg-muted p-4 rounded-xl space-y-1">
                <p><strong>Projected Portfolio Interest Returns:</strong> ₹{selectedData.value.toLocaleString()}</p>
 <p><strong>Total Portfolio Value:</strong> ₹
  {selectedData && investedVal[selectedYear-1]?.invested
    ? (Number(investedVal[selectedYear-1].invested) + Number(selectedData.value)).toLocaleString()
    : 'Loading...'}
</p>


                <p><strong>Projected Gain:</strong> +{selectedData.gain}%</p>
                <p><strong>Summary:</strong> {selectedData.summary}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No AI data for this year.</p>
            )}

            {/* 📉 Line Chart */}
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvestmentPage;
