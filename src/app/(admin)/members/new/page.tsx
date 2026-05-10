'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MemberForm, { MemberFormData } from '@/components/MemberForm';
import { api } from '@/lib/api';

export default function NewMemberPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (data: MemberFormData) => {
    setLoading(true); setError('');
    try {
      await api.post('/members', data);
      router.push('/members');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Member</h1>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
      <MemberForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
