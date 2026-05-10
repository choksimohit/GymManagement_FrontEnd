export type MembershipType = 1 | 2 | 3;
export type MembershipStatus = 1 | 2 | 3 | 4;
export type PaymentMode = 1 | 2 | 3;
export type DurationUnit = 1 | 2 | 3;

export const MEMBERSHIP_TYPE_LABELS: Record<MembershipType, string> = {
  1: 'Potential Member',
  2: 'Paid Member',
  3: 'Free Member',
};

export const MEMBERSHIP_STATUS_LABELS: Record<MembershipStatus, string> = {
  1: 'Active',
  2: 'Frozen',
  3: 'Resigned',
  4: 'Deceased',
};

export const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
  1: 'Cash',
  2: 'UPI',
  3: 'Card',
};

export const DURATION_UNIT_LABELS: Record<DurationUnit, string> = {
  1: 'Days',
  2: 'Weeks',
  3: 'Months',
};

export interface Member {
  id: number;
  memberNo: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  gender?: string;
  dateOfBirth?: string;
  email?: string;
  phone?: string;
  address?: string;
  membershipType: MembershipType;
  membershipStatus: MembershipStatus;
  joinDate: string;
  isPaymentActive?: boolean;
  emergencyContacts?: EmergencyContact[];
  memberships?: MemberMembership[];
  bodyProgress?: BodyProgress[];
}

export interface EmergencyContact {
  id?: number;
  memberId?: number;
  name: string;
  relationship?: string;
  phone: string;
}

export interface MembershipPlan {
  id: number;
  name: string;
  durationValue: number;
  durationUnit: DurationUnit;
  price: number;
  description?: string;
}

export interface MemberMembership {
  id: number;
  memberId: number;
  planId: number;
  startDate: string;
  endDate: string;
  totalAmount: number;
  plan?: MembershipPlan;
  member?: Pick<Member, 'id' | 'memberNo' | 'firstName' | 'lastName'>;
  payments?: MembershipPayment[];
}

export interface MembershipPayment {
  id: number;
  membershipId: number;
  amount: number;
  paymentDate: string;
  paymentMode: PaymentMode;
  referenceNo?: string;
}

export interface Attendance {
  id: number;
  memberId: number;
  checkIn: string;
  checkOut?: string;
  member?: Pick<Member, 'id' | 'memberNo' | 'firstName' | 'lastName'>;
}

export interface BodyProgress {
  id: number;
  memberId: number;
  progressDate: string;
  weight?: number;
  bmi?: number;
  fat?: number;
  muscle?: number;
  notes?: string;
}

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  todayAttendance: number;
  expiringIn7Days: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
}
