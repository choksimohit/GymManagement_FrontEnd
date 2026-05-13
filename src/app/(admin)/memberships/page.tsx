'use client';
import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/api';
import { MemberMembership, MembershipPlan, Member } from '@/types';

interface MembershipForm {
  memberId: number;
  planId: number;
  startDate: string;
  totalAmount: number;
}

interface PaymentForm {
  amount: number;
  paymentDate: string;
  paymentMode: number;
  referenceNo?: string;
}

function MembershipsContent() {
  const searchParams = useSearchParams();
  const prefilledMemberId = searchParams.get('memberId');

  const [memberships, setMemberships] = useState<MemberMembership[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [showForm, setShowForm] = useState(!!prefilledMemberId);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const mForm = useForm<MembershipForm>({ defaultValues: { memberId: prefilledMemberId ? Number(prefilledMemberId) : undefined, startDate: new Date().toISOString().slice(0, 10) } });
  const pForm = useForm<PaymentForm>({ defaultValues: { paymentDate: new Date().toISOString().slice(0, 10), paymentMode: 1 } });

  const load = async () => {
    const [ms, ps, mbs] = await Promise.all([
      api.get<MemberMembership[]>('/memberships'),
      api.get<MembershipPlan[]>('/plans'),
      api.get<Member[]>('/members'),
    ]);
    setMemberships(ms); setPlans(ps); setMembers(mbs);
  };
  useEffect(() => { load(); }, []);

  const onPlanChange = async (planId: number, startDate: string) => {
    if (!planId || !startDate) return;
    try {
      const plan = plans.find(p => p.id === planId);
      if (plan) mForm.setValue('totalAmount', Number(plan.price));
      await api.post<{ endDate: string }>('/memberships/calculate-end-date', { planId, startDate });
    } catch {}
  };

  const onSubmitMembership = async (data: MembershipForm) => {
    setLoading(true);
    try {
      await api.post('/memberships', data);
      await load(); setShowForm(false); mForm.reset();
    } finally { setLoading(false); }
  };

  const onSubmitPayment = async (data: PaymentForm) => {
    if (!payingId) return;
    setLoading(true);
    try {
      await api.post(`/memberships/${payingId}/payments`, data);
      await load(); setPayingId(null); pForm.reset();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Payment failed');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this membership?')) return;
    await api.delete(`/memberships/${id}`);
    await load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Memberships</h1>
        <button className="btn-primary" onClick={() => { setShowForm(true); mForm.reset({ startDate: new Date().toISOString().slice(0, 10) }); }}>
          + Assign Membership
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="font-semibold mb-4">Assign Membership</h2>
          <form onSubmit={mForm.handleSubmit(onSubmitMembership)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Member *</label>
              <select className="input" {...mForm.register('memberId', { required: true, valueAsNumber: true })}>
                <option value="">Select member...</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.memberNo} — {m.firstName} {m.lastName}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Plan *</label>
              <select className="input" {...mForm.register('planId', {
                required: true, valueAsNumber: true,
                onChange: e => onPlanChange(Number(e.target.value), mForm.getValues('startDate'))
              })}>
                <option value="">Select plan...</option>
                {plans.map(p => <option key={p.id} value={p.id}>{p.name} — £{Number(p.price).toFixed(2)}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Start Date *</label>
              <input type="date" className="input" {...mForm.register('startDate', {
                required: true,
                onChange: e => onPlanChange(mForm.getValues('planId'), e.target.value)
              })} />
            </div>
            <div>
              <label className="label">Total Amount (£) *</label>
              <input type="number" step="0.01" className="input" {...mForm.register('totalAmount', { required: true, valueAsNumber: true })} />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {payingId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="font-semibold mb-4">Add Payment</h2>
            <form onSubmit={pForm.handleSubmit(onSubmitPayment)} className="space-y-4">
              <div>
                <label className="label">Amount (£) *</label>
                <input type="number" step="0.01" className="input" {...pForm.register('amount', { required: true, valueAsNumber: true })} />
              </div>
              <div>
                <label className="label">Payment Date *</label>
                <input type="date" className="input" {...pForm.register('paymentDate', { required: true })} />
              </div>
              <div>
                <label className="label">Payment Mode *</label>
                <select className="input" {...pForm.register('paymentMode', { valueAsNumber: true })}>
                  <option value={1}>Cash</option>
                  <option value={2}>UPI</option>
                  <option value={3}>Card</option>
                </select>
              </div>
              <div>
                <label className="label">Reference No</label>
                <input className="input" {...pForm.register('referenceNo')} />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Add Payment'}</button>
                <button type="button" className="btn-secondary" onClick={() => setPayingId(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>{['Member', 'Plan', 'Start', 'End', 'Total', 'Paid', 'Balance', 'Actions'].map(h => <th key={h} className="table-header">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {memberships.map(ms => {
                const paid = (ms.payments ?? []).reduce((s, p) => s + Number(p.amount), 0);
                const balance = Number(ms.totalAmount) - paid;
                const expired = new Date(ms.endDate) < new Date();
                return (
                  <tr key={ms.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <Link href={`/members/${ms.member?.id}`} className="text-blue-600 hover:underline">
                        {ms.member?.firstName} {ms.member?.lastName}
                      </Link>
                    </td>
                    <td className="table-cell">{ms.plan?.name}</td>
                    <td className="table-cell">{ms.startDate?.slice(0, 10)}</td>
                    <td className="table-cell">
                      <span className={expired ? 'badge-red' : 'badge-green'}>{ms.endDate?.slice(0, 10)}</span>
                    </td>
                    <td className="table-cell">£{Number(ms.totalAmount).toFixed(2)}</td>
                    <td className="table-cell">£{paid.toFixed(2)}</td>
                    <td className="table-cell"><span className={balance > 0 ? 'badge-red' : 'badge-green'}>£{balance.toFixed(2)}</span></td>
                    <td className="table-cell">
                      <div className="flex gap-1">
                        {balance > 0 && <button className="btn-primary text-xs py-1 px-2" onClick={() => setPayingId(ms.id)}>Pay</button>}
                        <button className="btn-danger text-xs py-1 px-2" onClick={() => handleDelete(ms.id)}>Del</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {memberships.length === 0 && <div className="p-8 text-center text-gray-400">No memberships found.</div>}
        </div>
      </div>
    </div>
  );
}

export default function MembershipsPage() {
  return (
    <Suspense fallback={<div className="text-gray-400">Loading...</div>}>
      <MembershipsContent />
    </Suspense>
  );
}
