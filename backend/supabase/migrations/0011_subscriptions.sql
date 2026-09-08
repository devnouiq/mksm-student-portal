-- 0011_subscriptions
-- READ-ONLY mirror of Razorpay (India) / PayPal (international) subscription
-- status + payment history (PRD 7). No payment processing here. Rows are written
-- only by the sync endpoint (service role). `payments_this_year` /
-- `payments_last_3_months` are derived (0017).
-- Rollback: drop table subscription_payments, subscriptions.

create table subscriptions (
  id                       uuid primary key default gen_random_uuid(),
  student_id               uuid not null references profiles (id) on delete cascade,
  course_id                uuid references courses (id) on delete set null,
  provider                 subscription_provider not null,
  external_subscription_id text not null,
  status                   subscription_status not null,
  active_cycle             integer not null default 0 check (active_cycle >= 0),
  paid_cycle               integer not null default 0 check (paid_cycle >= 0),
  start_date               date,
  next_due_date            date,
  pending_dues_minor       bigint not null default 0 check (pending_dues_minor >= 0),
  synced_at                timestamptz,
  raw                      jsonb,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  unique (provider, external_subscription_id)
);

create index subscriptions_student_idx on subscriptions (student_id);
create index subscriptions_status_idx  on subscriptions (status);

create trigger subscriptions_set_updated_at
  before update on subscriptions
  for each row execute function extensions.moddatetime (updated_at);

create table subscription_payments (
  id                   uuid primary key default gen_random_uuid(),
  subscription_id      uuid not null references subscriptions (id) on delete cascade,
  external_payment_id  text not null unique,
  amount_minor         bigint not null check (amount_minor >= 0),
  currency             text not null default 'INR',
  status               text not null default 'captured',
  paid_at              timestamptz not null,
  raw                  jsonb,
  created_at           timestamptz not null default now()
);

create index subscription_payments_sub_paid_idx on subscription_payments (subscription_id, paid_at);
