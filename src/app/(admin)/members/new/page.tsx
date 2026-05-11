'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MemberForm, { MemberFormData } from '@/components/MemberForm';
import { api } from '@/lib/api';

export default function NewMemberPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<{ email?: string } | null>(null);

  const handleSubmit = async (data: MemberFormData) => {
    setLoading(true); setError('');
    try {
      await api.post('/members', data);
      if (data.email) {
        setCreated({ email: data.email });
      } else {
        router.push('/members');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create member');
    } finally {
      setLoading(false);
    }
  };

  if (created) {
    return (
      <div className="max-w-md mx-auto mt-16">
        <div className="card text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Member Created!</h2>
          <p className="text-gray-500 text-sm mb-6">Share these login credentials with the member:</p>
          <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Email</span>
              <span className="font-medium">{created.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Password</span>
              <span className="font-semibold text-blue-600">Gym@123</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Portal URL</span>
              <span className="font-medium text-xs">{typeof window !== 'undefined' ? window.location.origin : ''}/login</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="btn-primary flex-1" onClick={() => router.push('/members')}>Go to Members</button>
            <button className="btn-secondary flex-1" onClick={() => setCreated(null)}>Add Another</button>
          </div>
        </div>
      </div>
    );
  }

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
