// Row types for supabase/migrations/0001_core.sql. Keep in exact sync
// with that file — column names, nullability, and defaults must match.

export type Vertical = 'ecommerce' | 'courses' | 'services' | 'realestate'

export type Role = 'owner' | 'admin' | 'manager' | 'staff' | 'rider' | 'viewer'

export type InvitationStatus = 'pending' | 'accepted' | 'revoked'

/** Recursive JSON value — used for jsonb columns (org_settings.value, audit_log.before/after). */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Org {
  id: string
  name: string
  slug: string
  vertical: Vertical
  plan: string
  plan_key: string | null
  subscription_status: 'trialing' | 'active' | 'past_due' | 'suspended' | 'cancelled'
  trial_ends_at: string | null
  current_period_start: string | null
  current_period_end: string | null
  grace_period_end: string | null
  enabled_modules: string[]
  currency: string
  country: string
  timezone: string
  logo_path: string | null
  phone: string | null
  email: string | null
  address: string | null
  bin_number: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Profile {
  user_id: string
  full_name: string | null
  phone: string | null
  avatar_path: string | null
  created_at: string
}

export interface OrgMember {
  org_id: string
  user_id: string
  role: Role
  created_at: string
}

export interface Invitation {
  id: string
  org_id: string
  email: string
  role: Role
  token: string
  status: InvitationStatus
  invited_by: string | null
  expires_at: string
  created_at: string
}

export interface OrgSetting {
  org_id: string
  key: string
  value: Json | null
  updated_at: string
  updated_by: string | null
  created_at: string
}

export interface AuditLog {
  id: number
  org_id: string
  actor_id: string | null
  action: string
  entity: string
  entity_id: string | null
  before: Json | null
  after: Json | null
  created_at: string
}

/** Maps to the `notifications` table — named AppNotification to avoid
 *  colliding with the DOM's global `Notification` type. */
export interface AppNotification {
  id: string
  org_id: string
  user_id: string | null
  type: string
  title: string
  body: string | null
  link: string | null
  read_at: string | null
  created_at: string
}

export interface Media {
  id: string
  org_id: string
  path: string
  name: string | null
  mime: string | null
  size: number | null
  width: number | null
  height: number | null
  alt: string | null
  folder: string
  created_by: string | null
  created_at: string
}

export interface DocSequence {
  org_id: string
  doc_type: string
  prefix: string
  next_no: number
  padding: number
  created_at: string
}

export interface PlatformAdmin {
  user_id: string
  created_at: string
}


export interface PlatformPlan {
  id: string
  plan_key: string
  name: string
  description: string | null
  price_paisa: number
  billing_interval: 'monthly' | 'yearly'
  trial_days: number
  limits: Json
  available_modules: string[]
  is_active: boolean
  position: number
  created_at: string
  updated_at: string
}

export interface PlatformSubscription {
  id: string
  org_id: string
  plan_key: string
  status: 'trialing' | 'active' | 'past_due' | 'suspended' | 'cancelled'
  billing_interval: 'monthly' | 'yearly'
  current_period_start: string | null
  current_period_end: string | null
  trial_ends_at: string | null
  grace_period_end: string | null
  cancel_at_period_end: boolean
  provider: string | null
  provider_customer_ref: string | null
  provider_subscription_ref: string | null
  created_at: string
  updated_at: string
}

export interface PlatformInvoice {
  id: string
  org_id: string
  subscription_id: string | null
  invoice_no: string
  amount_paisa: number
  currency: string
  status: 'draft' | 'pending' | 'paid' | 'void' | 'overdue' | 'refunded'
  payment_method: string | null
  provider: string | null
  provider_reference: string | null
  description: string | null
  due_at: string | null
  paid_at: string | null
  created_at: string
  updated_at: string
}

export interface CustomDomain {
  id: string
  org_id: string
  hostname: string
  status: 'pending' | 'verified' | 'disabled'
  verification_token: string
  verified_at: string | null
  verified_by: string | null
  created_at: string
  updated_at: string
}

export interface PlatformPaymentEvent {
  id: string
  org_id: string
  invoice_id: string | null
  provider: string
  event_id: string
  event_type: string
  payload: Json
  processed_at: string | null
  created_at: string
}
