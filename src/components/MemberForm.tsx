'use client';
import { useFieldArray, useForm } from 'react-hook-form';
import { Member, EmergencyContact } from '@/types';

export interface MemberFormData {
  firstName: string;
  lastName: string;
  gender?: string;
  dateOfBirth?: string;
  email?: string;
  phone?: string;
  address?: string;
  membershipType: number;
  membershipStatus: number;
  emergencyContacts: EmergencyContact[];
}

interface Props {
  defaultValues?: Partial<MemberFormData>;
  onSubmit: (data: MemberFormData) => Promise<void>;
  loading?: boolean;
}

export default function MemberForm({ defaultValues, onSubmit, loading }: Props) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<MemberFormData>({
    defaultValues: {
      membershipType: 1,
      membershipStatus: 1,
      emergencyContacts: [],
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'emergencyContacts' });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">First Name *</label>
            <input className="input" {...register('firstName', { required: 'Required' })} />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="label">Last Name *</label>
            <input className="input" {...register('lastName', { required: 'Required' })} />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
          </div>
          <div>
            <label className="label">Gender</label>
            <select className="input" {...register('gender')}>
              <option value="">Select...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="label">Date of Birth</label>
            <input type="date" className="input" {...register('dateOfBirth')} />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" {...register('email')} />
            <p className="text-xs text-blue-500 mt-1">
              Member will be able to log in to the portal using this email with default password <span className="font-semibold">Gym@123</span>
            </p>
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" {...register('phone')} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Address</label>
            <textarea className="input" rows={2} {...register('address')} />
          </div>
          <div>
            <label className="label">Membership Type</label>
            <select className="input" {...register('membershipType', { valueAsNumber: true })}>
              <option value={1}>Potential Member</option>
              <option value={2}>Paid Member</option>
              <option value={3}>Free Member</option>
            </select>
          </div>
          <div>
            <label className="label">Membership Status</label>
            <select className="input" {...register('membershipStatus', { valueAsNumber: true })}>
              <option value={1}>Active</option>
              <option value={2}>Frozen</option>
              <option value={3}>Resigned</option>
              <option value={4}>Deceased</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Emergency Contacts</h2>
          <button
            type="button"
            className="btn-secondary text-sm"
            onClick={() => append({ name: '', phone: '', relationship: '' })}
          >
            + Add Contact
          </button>
        </div>
        {fields.length === 0 && (
          <p className="text-gray-400 text-sm">No emergency contacts added.</p>
        )}
        {fields.map((field, i) => (
          <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
            <input className="input" placeholder="Name *" {...register(`emergencyContacts.${i}.name`, { required: true })} />
            <input className="input" placeholder="Relationship" {...register(`emergencyContacts.${i}.relationship`)} />
            <div className="flex gap-2">
              <input className="input flex-1" placeholder="Phone *" {...register(`emergencyContacts.${i}.phone`, { required: true })} />
              <button type="button" onClick={() => remove(i)} className="btn-danger px-3">✕</button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Member'}
        </button>
        <button type="button" className="btn-secondary" onClick={() => window.history.back()}>
          Cancel
        </button>
      </div>
    </form>
  );
}
