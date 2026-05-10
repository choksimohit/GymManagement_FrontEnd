'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Attendance } from '@/types';
import { format } from 'date-fns';

export default function AttendancePage() {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [qr, setQr] = useState('');

  const load = async (d: string) => {
    setLoading(true);
    try {
      const data = await api.get<Attendance[]>(`/attendance?date=${d}`);
      setRecords(data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(date); }, [date]);

  const generateQR = async () => {
    const secret = process.env.NEXT_PUBLIC_QR_SECRET || 'gym-qr-secret-key';
    const branchId = '1';
    const ts = Date.now();
    const raw = `GYMCARE|${branchId}|${ts}|${secret}`;
    const encoded = btoa(raw);
    setQr(encoded);
    setTimeout(() => setQr(''), 120000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-500 text-sm mt-1">{records.length} check-ins on {date}</p>
        </div>
        <div className="flex gap-3">
          <input
            type="date"
            className="input"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
          <button className="btn-primary" onClick={generateQR}>Generate QR</button>
        </div>
      </div>

      {qr && (
        <div className="card mb-6 text-center">
          <p className="text-sm font-medium text-gray-700 mb-3">QR Code (valid 2 minutes)</p>
          <div className="inline-block p-4 bg-gray-50 rounded-xl">
            <p className="font-mono text-xs break-all text-gray-500">{qr}</p>
          </div>
          <p className="text-xs text-gray-400 mt-2">Members scan this via the Member Portal to check in/out</p>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>{['Member', 'Member No', 'Check In', 'Check Out', 'Duration'].map(h => <th key={h} className="table-header">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {records.map(r => {
                const duration = r.checkOut
                  ? Math.round((new Date(r.checkOut).getTime() - new Date(r.checkIn).getTime()) / 60000)
                  : null;
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="table-cell">{r.member?.firstName} {r.member?.lastName}</td>
                    <td className="table-cell text-gray-500">{r.member?.memberNo}</td>
                    <td className="table-cell">{format(new Date(r.checkIn), 'hh:mm a')}</td>
                    <td className="table-cell">{r.checkOut ? format(new Date(r.checkOut), 'hh:mm a') : <span className="badge-green">In Gym</span>}</td>
                    <td className="table-cell">{duration !== null ? `${duration} min` : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {!loading && records.length === 0 && <div className="p-8 text-center text-gray-400">No attendance records for this date.</div>}
      </div>
    </div>
  );
}
