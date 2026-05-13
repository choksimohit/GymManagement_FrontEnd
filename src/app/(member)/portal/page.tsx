'use client';
import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { api } from '@/lib/api';
import { getUser } from '@/lib/auth';
import { Member, MemberMembership, MEMBERSHIP_STATUS_LABELS } from '@/types';

const QrScanner = dynamic(() => import('@/components/QrScanner'), { ssr: false });

export default function MemberPortalPage() {
  const user = getUser();
  const memberId = user?.memberId;
  const [member, setMember] = useState<Member | null>(null);
  const [memberships, setMemberships] = useState<MemberMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrInput, setQrInput] = useState('');
  const [qrResult, setQrResult] = useState<{ action: string; message?: string } | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    if (!memberId) return;
    Promise.all([
      api.get<Member>(`/members/${memberId}`),
      api.get<MemberMembership[]>(`/memberships/member/${memberId}`),
    ]).then(([m, ms]) => { setMember(m); setMemberships(ms); }).finally(() => setLoading(false));
  }, [memberId]);

  const latestMembership = memberships[0];
  const paid = latestMembership?.payments?.reduce((s, p) => s + Number(p.amount), 0) ?? 0;
  const balance = latestMembership ? Number(latestMembership.totalAmount) - paid : 0;
  const isExpired = latestMembership ? new Date(latestMembership.endDate) < new Date() : true;

  const handleQRScan = async (code?: string) => {
    const qrCode = code ?? qrInput;
    if (!qrCode) return;
    try {
      const res = await api.post<{ action: string; message?: string }>('/attendance/qr', { qrCode });
      setQrResult(res);
      setQrInput('');
    } catch (err) {
      setQrResult({ action: 'error', message: err instanceof Error ? err.message : 'Error' });
    }
  };

  const handleCameraScan = useCallback((decoded: string) => {
    setShowScanner(false);
    handleQRScan(decoded);
  }, []);

  if (loading) return <div className="text-gray-400 py-8 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="font-semibold text-lg mb-4">Welcome, {member?.firstName}!</h2>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          {[
            ['Member No', member?.memberNo],
            ['Phone', member?.phone],
            ['Email', member?.email],
            ['Status', MEMBERSHIP_STATUS_LABELS[member?.membershipStatus ?? 1]],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-gray-500">{k}</dt>
              <dd className="font-medium">{v || '—'}</dd>
            </div>
          ))}
        </dl>
      </div>

      {latestMembership && (
        <div className="card">
          <h2 className="font-semibold mb-4">Current Membership</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-gray-500">Plan</dt><dd className="font-medium">{latestMembership.plan?.name}</dd></div>
            <div><dt className="text-gray-500">Start</dt><dd className="font-medium">{latestMembership.startDate?.slice(0, 10)}</dd></div>
            <div><dt className="text-gray-500">End</dt>
              <dd>
                <span className={isExpired ? 'badge-red' : 'badge-green'}>{latestMembership.endDate?.slice(0, 10)}</span>
              </dd>
            </div>
            <div><dt className="text-gray-500">Balance</dt>
              <dd><span className={balance > 0 ? 'badge-red' : 'badge-green'}>£{balance.toFixed(2)}</span></dd>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="font-semibold mb-4">Attendance via QR</h2>
        <button
          className="btn-primary w-full mb-4 flex items-center justify-center gap-2"
          onClick={() => { setQrResult(null); setShowScanner(true); }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m0 14v1m8-8h-1M5 12H4m12.95-6.95l-.707.707M6.757 17.243l-.707.707m12.02 0l-.707-.707M6.757 6.757l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
          </svg>
          Scan QR Code with Camera
        </button>
        <p className="text-xs text-gray-400 text-center mb-3">— or paste code manually —</p>
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Paste QR code here..."
            value={qrInput}
            onChange={e => setQrInput(e.target.value)}
          />
          <button className="btn-primary" onClick={() => handleQRScan()}>Submit</button>
        </div>
        {qrResult && (
          <div className={`mt-3 px-4 py-3 rounded-lg text-sm font-medium ${qrResult.action === 'check-in' ? 'bg-green-50 text-green-700' : qrResult.action === 'check-out' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
            {qrResult.action === 'check-in' && 'Checked in successfully!'}
            {qrResult.action === 'check-out' && 'Checked out successfully!'}
            {qrResult.action === 'none' && 'Already completed attendance today.'}
            {qrResult.action === 'error' && (qrResult.message || 'Error processing QR code.')}
          </div>
        )}
      </div>

      {showScanner && <QrScanner onScan={handleCameraScan} onClose={() => setShowScanner(false)} />}
    </div>
  );
}
