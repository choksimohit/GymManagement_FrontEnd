'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Member, MemberMembership, MEMBERSHIP_STATUS_LABELS, MEMBERSHIP_TYPE_LABELS, DURATION_UNIT_LABELS } from '@/types';

export default function MemberDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Member>(`/members/${id}`).then(setMember).finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Resign this member?')) return;
    await api.delete(`/members/${id}`);
    router.push('/members');
  };

  if (loading) return <div className="text-gray-400">Loading...</div>;
  if (!member) return <div className="text-red-500">Member not found.</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{member.firstName} {member.lastName}</h1>
          <p className="text-gray-500 text-sm">{member.memberNo}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/members/${id}/edit`} className="btn-secondary">Edit</Link>
          <button onClick={handleDelete} className="btn-danger">Resign</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold mb-4">Personal Details</h2>
          <dl className="space-y-2 text-sm">
            {[
              ['Email', member.email],
              ['Phone', member.phone],
              ['Gender', member.gender],
              ['Date of Birth', member.dateOfBirth?.slice(0, 10)],
              ['Address', member.address],
              ['Join Date', member.joinDate?.slice(0, 10)],
              ['Type', MEMBERSHIP_TYPE_LABELS[member.membershipType]],
              ['Status', MEMBERSHIP_STATUS_LABELS[member.membershipStatus]],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <dt className="text-gray-500 w-32 shrink-0">{k}:</dt>
                <dd className="font-medium">{v || '—'}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-4">Emergency Contacts</h2>
          {(member.emergencyContacts ?? []).length === 0 ? (
            <p className="text-gray-400 text-sm">No emergency contacts.</p>
          ) : (
            <div className="space-y-3">
              {member.emergencyContacts!.map(c => (
                <div key={c.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-gray-500">{c.relationship} · {c.phone}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Memberships</h2>
            <Link href={`/memberships/new?memberId=${id}`} className="btn-secondary text-sm">+ Add</Link>
          </div>
          {(member.memberships ?? []).length === 0 ? (
            <p className="text-gray-400 text-sm">No memberships assigned.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead><tr className="border-b">
                  {['Plan', 'Start', 'End', 'Total', 'Paid', 'Balance'].map(h => (
                    <th key={h} className="table-header">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {member.memberships!.map((ms: MemberMembership) => {
                    const paid = (ms.payments ?? []).reduce((s, p) => s + Number(p.amount), 0);
                    const balance = Number(ms.totalAmount) - paid;
                    return (
                      <tr key={ms.id} className="border-b hover:bg-gray-50">
                        <td className="table-cell">{ms.plan?.name}</td>
                        <td className="table-cell">{ms.startDate?.slice(0, 10)}</td>
                        <td className="table-cell">{ms.endDate?.slice(0, 10)}</td>
                        <td className="table-cell">₹{Number(ms.totalAmount).toFixed(2)}</td>
                        <td className="table-cell">₹{paid.toFixed(2)}</td>
                        <td className="table-cell">
                          <span className={balance > 0 ? 'badge-red' : 'badge-green'}>₹{balance.toFixed(2)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {(member.bodyProgress ?? []).length > 0 && (
          <div className="card lg:col-span-2">
            <h2 className="font-semibold mb-4">Body Progress</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead><tr className="border-b">
                  {['Date', 'Weight', 'BMI', 'Fat %', 'Muscle %', 'Notes'].map(h => (
                    <th key={h} className="table-header">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {member.bodyProgress!.map(p => (
                    <tr key={p.id} className="border-b hover:bg-gray-50">
                      <td className="table-cell">{p.progressDate?.slice(0, 10)}</td>
                      <td className="table-cell">{p.weight ?? '—'}</td>
                      <td className="table-cell">{p.bmi ?? '—'}</td>
                      <td className="table-cell">{p.fat ?? '—'}</td>
                      <td className="table-cell">{p.muscle ?? '—'}</td>
                      <td className="table-cell text-gray-500">{p.notes ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
