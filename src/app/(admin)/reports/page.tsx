'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface MembershipRow {
  memberName: string;
  memberNo: string;
  planName: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  paid: number;
  balance: number;
  status: string;
}

interface MembershipReport {
  summary: { active: number; due: number; expired: number };
  rows: MembershipRow[];
}

interface RevenueReport {
  year: number;
  month: number;
  grandTotal: number;
  days: { date: string; total: number; payments: { member: string; amount: number; paymentMode: number }[] }[];
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function ReportsPage() {
  const [tab, setTab] = useState<'membership' | 'revenue'>('membership');
  const [msReport, setMsReport] = useState<MembershipReport | null>(null);
  const [revReport, setRevReport] = useState<RevenueReport | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tab === 'membership') {
      setLoading(true);
      api.get<MembershipReport>('/reports/memberships').then(setMsReport).finally(() => setLoading(false));
    } else {
      setLoading(true);
      api.get<RevenueReport>(`/reports/revenue?year=${year}&month=${month}`).then(setRevReport).finally(() => setLoading(false));
    }
  }, [tab, year, month]);

  const statusBadge = (s: string) => {
    if (s === 'Active') return 'badge-green';
    if (s === 'Due') return 'badge-yellow';
    return 'badge-red';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        {tab === 'membership' && (
          <button
            className="btn-secondary"
            onClick={() => api.downloadBlob('/reports/memberships/csv', 'memberships.csv')}
          >
            Export CSV
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        <button className={tab === 'membership' ? 'btn-primary' : 'btn-secondary'} onClick={() => setTab('membership')}>Membership Report</button>
        <button className={tab === 'revenue' ? 'btn-primary' : 'btn-secondary'} onClick={() => setTab('revenue')}>Revenue Report</button>
      </div>

      {loading && <div className="text-gray-400 py-8">Loading...</div>}

      {!loading && tab === 'membership' && msReport && (
        <div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="card text-center"><p className="text-2xl font-bold text-green-600">{msReport.summary.active}</p><p className="text-sm text-gray-500">Active</p></div>
            <div className="card text-center"><p className="text-2xl font-bold text-yellow-600">{msReport.summary.due}</p><p className="text-sm text-gray-500">Due</p></div>
            <div className="card text-center"><p className="text-2xl font-bold text-red-600">{msReport.summary.expired}</p><p className="text-sm text-gray-500">Expired</p></div>
          </div>
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>{['Member', 'Plan', 'Start', 'End', 'Total', 'Paid', 'Balance', 'Status'].map(h => <th key={h} className="table-header">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {msReport.rows.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="table-cell">{r.memberName}<span className="text-gray-400 text-xs ml-1">({r.memberNo})</span></td>
                      <td className="table-cell">{r.planName}</td>
                      <td className="table-cell">{r.startDate?.slice(0, 10)}</td>
                      <td className="table-cell">{r.endDate?.slice(0, 10)}</td>
                      <td className="table-cell">£{r.totalAmount.toFixed(2)}</td>
                      <td className="table-cell">£{r.paid.toFixed(2)}</td>
                      <td className="table-cell">£{r.balance.toFixed(2)}</td>
                      <td className="table-cell"><span className={statusBadge(r.status)}>{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!loading && tab === 'revenue' && (
        <div>
          <div className="flex gap-3 mb-6">
            <select className="input w-32" value={year} onChange={e => setYear(Number(e.target.value))}>
              {[2023,2024,2025,2026].map(y => <option key={y}>{y}</option>)}
            </select>
            <select className="input w-40" value={month} onChange={e => setMonth(Number(e.target.value))}>
              {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
          </div>
          {revReport && (
            <>
              <div className="card mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">£{revReport.grandTotal.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</p>
                </div>
                <p className="text-gray-400 text-sm">{MONTHS[revReport.month - 1]} {revReport.year}</p>
              </div>
              <div className="space-y-3">
                {revReport.days.map(d => (
                  <div key={d.date} className="card">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{d.date}</p>
                      <p className="font-semibold text-blue-600">£{d.total.toFixed(2)}</p>
                    </div>
                    <div className="space-y-1">
                      {(d.payments as { member: string; amount: number; paymentMode: number }[]).map((p, i) => (
                        <div key={i} className="flex items-center justify-between text-sm text-gray-500">
                          <span>{p.member}</span>
                          <span>£{p.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {revReport.days.length === 0 && <p className="text-gray-400 text-sm">No revenue data for this period.</p>}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
