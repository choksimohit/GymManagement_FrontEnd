'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Member, MEMBERSHIP_STATUS_LABELS, MEMBERSHIP_TYPE_LABELS } from '@/types';

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Member[]>('/members').then(setMembers).finally(() => setLoading(false));
  }, []);

  const filtered = members.filter(m =>
    `${m.fullName} ${m.memberNo} ${m.phone} ${m.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (status: number) => {
    const map: Record<number, string> = { 1: 'badge-green', 2: 'badge-blue', 3: 'badge-gray', 4: 'badge-red' };
    return map[status] ?? 'badge-gray';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <p className="text-gray-500 text-sm mt-1">{members.length} total members</p>
        </div>
        <Link href="/members/new" className="btn-primary">+ Add Member</Link>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <input
            className="input max-w-sm"
            placeholder="Search by name, member no, phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {['Member No', 'Name', 'Phone', 'Type', 'Status', 'Payment', 'Actions'].map(h => (
                    <th key={h} className="table-header">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="table-cell font-medium text-blue-600">{m.memberNo}</td>
                    <td className="table-cell">{m.fullName ?? `${m.firstName} ${m.lastName}`}</td>
                    <td className="table-cell text-gray-500">{m.phone ?? '—'}</td>
                    <td className="table-cell"><span className="badge-blue">{MEMBERSHIP_TYPE_LABELS[m.membershipType]}</span></td>
                    <td className="table-cell"><span className={statusBadge(m.membershipStatus)}>{MEMBERSHIP_STATUS_LABELS[m.membershipStatus]}</span></td>
                    <td className="table-cell">
                      <span className={m.isPaymentActive ? 'badge-green' : 'badge-red'}>
                        {m.isPaymentActive ? 'Active' : 'Due / Expired'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <Link href={`/members/${m.id}`} className="btn-secondary text-xs py-1 px-2">View</Link>
                        <Link href={`/members/${m.id}/edit`} className="btn-secondary text-xs py-1 px-2">Edit</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="p-8 text-center text-gray-400">No members found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
