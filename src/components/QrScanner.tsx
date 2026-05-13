'use client';
import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface Props {
  onScan: (result: string) => void;
  onClose: () => void;
}

export default function QrScanner({ onScan, onClose }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const divId = 'qr-reader';

  useEffect(() => {
    const scanner = new Html5Qrcode(divId);
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decoded) => {
        scanner.stop().catch(() => {});
        onScan(decoded);
      },
      () => {}
    ).catch(() => {});

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-4 w-full max-w-sm mx-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Scan QR Code</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <div id={divId} className="w-full rounded-lg overflow-hidden" />
        <p className="text-xs text-gray-400 text-center mt-3">Point your camera at the QR code</p>
      </div>
    </div>
  );
}
