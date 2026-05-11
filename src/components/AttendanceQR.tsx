'use client';
import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

const QR_VALID_SECONDS = 120;
const QR_SECRET = process.env.NEXT_PUBLIC_QR_SECRET || 'gym-qr-secret-key';

function generateRawCode(): string {
  const branchId = '1';
  const ts = Date.now();
  const raw = `GYMCARE|${branchId}|${ts}|${QR_SECRET}`;
  return btoa(raw);
}

export default function AttendanceQR() {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(QR_VALID_SECONDS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = async () => {
    const code = generateRawCode();
    const url = await QRCode.toDataURL(code, { width: 220, margin: 2, color: { dark: '#1e293b', light: '#ffffff' } });
    setQrDataUrl(url);
    setSecondsLeft(QR_VALID_SECONDS);
  };

  useEffect(() => {
    refresh();

    intervalRef.current = setInterval(refresh, QR_VALID_SECONDS * 1000);
    countdownRef.current = setInterval(() => {
      setSecondsLeft(s => (s > 0 ? s - 1 : 0));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const percent = (secondsLeft / QR_VALID_SECONDS) * 100;
  const isExpiring = secondsLeft <= 30;

  return (
    <div className="card flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full">
        <h2 className="font-semibold text-gray-900">Attendance QR Code</h2>
        <button
          onClick={refresh}
          className="text-xs text-blue-600 hover:underline"
        >
          Refresh
        </button>
      </div>

      {qrDataUrl ? (
        <div className={`p-3 rounded-xl border-2 transition-colors ${isExpiring ? 'border-red-300 bg-red-50' : 'border-gray-100 bg-white'}`}>
          <img src={qrDataUrl} alt="Attendance QR Code" width={220} height={220} />
        </div>
      ) : (
        <div className="w-[220px] h-[220px] bg-gray-100 rounded-xl animate-pulse" />
      )}

      <div className="w-full">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Expires in</span>
          <span className={isExpiring ? 'text-red-500 font-semibold' : ''}>
            {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all duration-1000 ${isExpiring ? 'bg-red-400' : 'bg-blue-500'}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        Members scan this at the front desk to check in / check out
      </p>
    </div>
  );
}
