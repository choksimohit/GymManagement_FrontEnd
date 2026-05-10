import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Gym Management',
  description: 'Gym membership and operations management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
