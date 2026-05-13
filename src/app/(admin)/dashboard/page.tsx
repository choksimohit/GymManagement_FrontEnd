'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { DashboardStats } from '@/types';
import AttendanceQR from '@/components/AttendanceQR';

function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: string; color: string }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<DashboardStats>('/dashboard')
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-500">Loading dashboard...</div>;
  if (!stats) return <div className="text-red-500">Failed to load stats.</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your gym operations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 content-start">
          <StatCard label="Total Members" value={stats.totalMembers} icon="👥" color="bg-blue-100" />
          <StatCard label="Active Members" value={stats.activeMembers} icon="✅" color="bg-green-100" />
          <StatCard label="Active Subscriptions" value={stats.activeSubscriptions} icon="🎫" color="bg-purple-100" />
          <StatCard label="Today's Attendance" value={stats.todayAttendance} icon="📋" color="bg-orange-100" />
          <StatCard label="Expiring in 7 Days" value={stats.expiringIn7Days} icon="⚠️" color="bg-yellow-100" />
          <StatCard
            label="Monthly Revenue"
            value={`£${stats.monthlyRevenue.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`}
            icon="💰"
            color="bg-emerald-100"
          />
        </div>
        <div>
          <AttendanceQR />
        </div>
      </div>
    </div>
  );
}
