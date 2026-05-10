'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MemberForm, { MemberFormData } from '@/components/MemberForm';
import { api } from '@/lib/api';
import { Member } from '@/types';

export default function EditMemberPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<Member>(`/members/${id}`).then(setMember);
  }, [id]);

  const handleSubmit = async (data: MemberFormData) => {
    setLoading(true); setError('');
    try {
      await api.put(`/members/${id}`, data);
      router.push(`/members/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!member) return <div className="text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Member</h1>
        <p className="text-gray-500 text-sm">{member.memberNo}</p>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
      <MemberForm
        defaultValues={{
          firstName: member.firstName,
          lastName: member.lastName,
          gender: member.gender,
          dateOfBirth: member.dateOfBirth?.slice(0, 10),
          email: member.email,
          phone: member.phone,
          address: member.address,
          membershipType: member.membershipType,
          membershipStatus: member.membershipStatus,
          emergencyContacts: member.emergencyContacts ?? [],
        }}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}
