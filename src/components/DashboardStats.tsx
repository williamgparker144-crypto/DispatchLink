import React from 'react';
import { TrendingUp, TrendingDown, Users, Target, Truck, DollarSign } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeType, icon, color }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          {icon}
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            changeType === 'positive' ? 'text-green-600' :
            changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
          }`}>
            {changeType === 'positive' && <TrendingUp className="w-4 h-4" />}
            {changeType === 'negative' && <TrendingDown className="w-4 h-4" />}
            {change}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-[#1E3A5F] mb-1">{value}</p>
      <p className="text-sm text-gray-500">{title}</p>
    </div>
  );
};

interface DashboardStatsProps {
  userType: 'dispatcher' | 'carrier';
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ userType }) => {
  const dispatcherStats = [
    { title: 'Active Carriers', value: '24', change: '+3 this week', changeType: 'positive' as const, icon: <Truck className="w-5 h-5 text-white" />, color: 'bg-blue-500' },
    { title: 'Intent Leads', value: '156', change: '+12%', changeType: 'positive' as const, icon: <Target className="w-5 h-5 text-white" />, color: 'bg-orange-500' },
    { title: 'Loads Booked', value: '89', change: '+8 this month', changeType: 'positive' as const, icon: <DollarSign className="w-5 h-5 text-white" />, color: 'bg-green-500' },
    { title: 'Conversion Rate', value: '24%', change: '+3%', changeType: 'positive' as const, icon: <TrendingUp className="w-5 h-5 text-white" />, color: 'bg-purple-500' },
  ];

  const carrierStats = [
    { title: 'Active Dispatchers', value: '3', change: '+1 this week', changeType: 'positive' as const, icon: <Users className="w-5 h-5 text-white" />, color: 'bg-blue-500' },
    { title: 'MC# Permissions', value: '3', change: 'All active', changeType: 'neutral' as const, icon: <Target className="w-5 h-5 text-white" />, color: 'bg-orange-500' },
    { title: 'Loads This Month', value: '45', change: '+12%', changeType: 'positive' as const, icon: <Truck className="w-5 h-5 text-white" />, color: 'bg-green-500' },
    { title: 'Profile Views', value: '234', change: '+18%', changeType: 'positive' as const, icon: <TrendingUp className="w-5 h-5 text-white" />, color: 'bg-purple-500' },
  ];

  const stats = userType === 'dispatcher' ? dispatcherStats : carrierStats;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default DashboardStats;
