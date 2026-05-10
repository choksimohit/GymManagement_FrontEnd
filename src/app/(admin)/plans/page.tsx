'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/api';
import { MembershipPlan, DURATION_UNIT_LABELS } from '@/types';

interface PlanForm {
  name: string;
  durationValue: number;
  durationUnit: number;
  price: number;
  description?: string;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [editing, setEditing] = useState<MembershipPlan | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PlanForm>();

  const load = () => api.get<MembershipPlan[]>('/plans').then(setPlans);
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); reset({ durationUnit: 3, durationValue: 1 }); setShowForm(true); };
  const openEdit = (p: MembershipPlan) => {
    setEditing(p);
    reset({ name: p.name, durationValue: p.durationValue, durationUnit: p.durationUnit, price: Number(p.price), description: p.description });
    setShowForm(true);
  };

  const onSubmit = async (data: PlanForm) => {
    setLoading(true);
    try {
      if (editing) await api.put(`/plans/${editing.id}`, data);
      else await api.post('/plans', data);
      await load(); setShowForm(false);
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this plan?')) return;
    await api.delete(`/plans/${id}`);
    await load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Membership Plans</h1>
        <button className="btn-primary" onClick={openCreate}>+ New Plan</button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="font-semibold mb-4">{editing ? 'Edit Plan' : 'New Plan'}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Plan Name *</label>
              <input className="input" {...register('name', { required: true })} />
            </div>
            <div>
              <label className="label">Price (₹) *</label>
              <input type="number" step="0.01" className="input" {...register('price', { required: true, valueAsNumber: true })} />
            </div>
            <div>
              <label className="label">Duration Value *</label>
              <input type="number" className="input" {...register('durationValue', { required: true, valueAsNumber: true })} />
            </div>
            <div>
              <label className="label">Duration Unit *</label>
              <select className="input" {...register('durationUnit', { valueAsNumber: true })}>
                <option value={1}>Days</option>
                <option value={2}>Weeks</option>
                <option value={3}>Months</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">Description</label>
              <input className="input" {...register('description')} />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map(p => (
          <div key={p.id} className="card">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{p.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{p.durationValue} {DURATION_UNIT_LABELS[p.durationUnit]}</p>
                {p.description && <p className="text-xs text-gray-400 mt-1">{p.description}</p>}
              </div>
              <p className="text-xl font-bold text-blue-600">₹{Number(p.price).toFixed(2)}</p>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="btn-secondary text-xs py-1 px-3" onClick={() => openEdit(p)}>Edit</button>
              <button className="btn-danger text-xs py-1 px-3" onClick={() => handleDelete(p.id)}>Delete</button>
            </div>
          </div>
        ))}
        {plans.length === 0 && <p className="text-gray-400 text-sm col-span-3">No plans created yet.</p>}
      </div>
    </div>
  );
}
