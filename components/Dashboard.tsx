import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Wallet, Calendar, AlertCircle, Award 
} from 'lucide-react';
import { getDashboardStats, getTrips } from '../services/dataService';
import { DashboardStats, Trip } from '../types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const data = getDashboardStats();
    setStats(data);

    // Prepare chart data (Last 7 days profit)
    const trips = getTrips();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const dailyStats = last7Days.map(date => {
      const dayTrips = trips.filter(t => t.date === date);
      const income = dayTrips.reduce((sum, t) => sum + t.income, 0);
      const profit = dayTrips.reduce((sum, t) => sum + t.netProfit, 0);
      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        income,
        profit
      };
    });

    setChartData(dailyStats);
  }, []);

  if (!stats) return <div className="p-8 text-center text-slate-500">Loading Dashboard...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Monthly Profit */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Monthly Net Profit</p>
            <p className="text-2xl font-bold text-emerald-600">₹{stats.monthlyProfit.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-full text-emerald-600">
            <TrendingUp size={24} />
          </div>
        </div>

        {/* Monthly Income */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Monthly Income</p>
            <p className="text-2xl font-bold text-slate-800">₹{stats.monthlyIncome.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-full text-blue-600">
            <Wallet size={24} />
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Monthly Expenses</p>
            <p className="text-2xl font-bold text-rose-600">₹{stats.monthlyExpenses.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-rose-50 rounded-full text-rose-600">
            <TrendingDown size={24} />
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Pending Driver Pay</p>
            <p className="text-2xl font-bold text-orange-600">₹{stats.pendingPayments.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-orange-50 rounded-full text-orange-600">
            <AlertCircle size={24} />
          </div>
        </div>

        {/* Today's Trips */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Today's Trips</p>
            <p className="text-2xl font-bold text-slate-800">{stats.todayTrips}</p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
            <Calendar size={24} />
          </div>
        </div>

         {/* Best Vehicle */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-slate-500">Best Performer</p>
            <p className="text-lg font-bold text-slate-800 truncate" title={stats.bestVehicle}>{stats.bestVehicle}</p>
          </div>
          <div className="p-3 bg-yellow-50 rounded-full text-yellow-600">
            <Award size={24} />
          </div>
        </div>

      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Last 7 Days Performance</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="income" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Income" />
              <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;