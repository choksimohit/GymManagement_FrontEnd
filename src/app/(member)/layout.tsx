'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { clearAuth, getUser } from '@/lib/auth';

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    const user = getUser();
    if (!user) { router.replace('/login'); return; }
    if (user.role !== 'member') { router.replace('/dashboard'); return; }
  }, [router]);

  const user = getUser();
  const logout = () => { clearAuth(); router.push('/login'); };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold">G</div>
          <span className="font-semibold">Gym Management</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-blue-100">{user?.fullName}</span>
          <button onClick={logout} className="text-sm text-blue-100 hover:text-white">Logout</button>
        </div>
      </header>
      <main className="max-w-2xl mx-auto p-6">{children}</main>
    </div>
  );
}
