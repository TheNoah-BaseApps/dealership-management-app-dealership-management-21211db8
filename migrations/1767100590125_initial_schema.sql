CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  email text NOT NULL UNIQUE,
  password text NOT NULL,
  name text NOT NULL,
  role text NOT NULL,
  phone text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

CREATE TABLE IF NOT EXISTS customers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text,
  customer_type text,
  assigned_sales_rep uuid,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers (email);
CREATE INDEX IF NOT EXISTS idx_customers_assigned_sales_rep ON customers (assigned_sales_rep);

CREATE TABLE IF NOT EXISTS leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  customer_id uuid NOT NULL,
  source text,
  status text NOT NULL,
  interest_type text,
  assigned_to uuid,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  converted_at timestamp with time zone
);
CREATE INDEX IF NOT EXISTS idx_leads_customer_id ON leads (customer_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads (assigned_to);

CREATE TABLE IF NOT EXISTS service_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  service_request_id text NOT NULL UNIQUE,
  customer_id uuid NOT NULL,
  request_date timestamp with time zone NOT NULL,
  issue_type text NOT NULL,
  issue_description text NOT NULL,
  assigned_agent uuid,
  priority_level text NOT NULL,
  resolution_status text NOT NULL,
  resolution_date timestamp with time zone,
  feedback_score integer,
  communication_mode text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_service_requests_service_request_id ON service_requests (service_request_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_customer_id ON service_requests (customer_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests (resolution_status);
CREATE INDEX IF NOT EXISTS idx_service_requests_priority ON service_requests (priority_level);

CREATE TABLE IF NOT EXISTS campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  target_segment text,
  status text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns (status);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON campaigns (start_date, end_date);

CREATE TABLE IF NOT EXISTS customer_engagements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  engagement_id text NOT NULL UNIQUE,
  customer_id uuid NOT NULL,
  engagement_type text NOT NULL,
  engagement_date timestamp with time zone NOT NULL,
  campaign_id uuid,
  response_received boolean DEFAULT false NOT NULL,
  reward_points integer DEFAULT 0 NOT NULL,
  communication_method text,
  engagement_outcome text,
  follow_up_needed boolean DEFAULT false NOT NULL,
  next_engagement_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_customer_engagements_engagement_id ON customer_engagements (engagement_id);
CREATE INDEX IF NOT EXISTS idx_customer_engagements_customer_id ON customer_engagements (customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_engagements_campaign_id ON customer_engagements (campaign_id);
CREATE INDEX IF NOT EXISTS idx_customer_engagements_follow_up ON customer_engagements (follow_up_needed, next_engagement_date);

CREATE TABLE IF NOT EXISTS vehicles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  vin text NOT NULL UNIQUE,
  make text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  color text,
  status text NOT NULL,
  price decimal(10,2) NOT NULL,
  cost decimal(10,2),
  purchase_date timestamp with time zone,
  sold_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_vehicles_vin ON vehicles (vin);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles (status);
CREATE INDEX IF NOT EXISTS idx_vehicles_make_model ON vehicles (make, model);

CREATE TABLE IF NOT EXISTS parts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  part_number text NOT NULL UNIQUE,
  name text NOT NULL,
  category text,
  quantity integer DEFAULT 0 NOT NULL,
  unit_price decimal(10,2) NOT NULL,
  reorder_level integer DEFAULT 10 NOT NULL,
  supplier_id uuid,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_parts_part_number ON parts (part_number);
CREATE INDEX IF NOT EXISTS idx_parts_category ON parts (category);
CREATE INDEX IF NOT EXISTS idx_parts_quantity ON parts (quantity);

CREATE TABLE IF NOT EXISTS sales_orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  order_number text NOT NULL UNIQUE,
  customer_id uuid NOT NULL,
  vehicle_id uuid,
  sales_rep_id uuid NOT NULL,
  order_date timestamp with time zone NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  status text NOT NULL,
  payment_status text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sales_orders_order_number ON sales_orders (order_number);
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer_id ON sales_orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON sales_orders (status);
CREATE INDEX IF NOT EXISTS idx_sales_orders_sales_rep_id ON sales_orders (sales_rep_id);

CREATE TABLE IF NOT EXISTS repair_orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  ro_number text NOT NULL UNIQUE,
  customer_id uuid NOT NULL,
  vehicle_vin text NOT NULL,
  service_advisor_id uuid NOT NULL,
  scheduled_date timestamp with time zone NOT NULL,
  completion_date timestamp with time zone,
  labor_cost decimal(10,2) DEFAULT 0 NOT NULL,
  parts_cost decimal(10,2) DEFAULT 0 NOT NULL,
  total_cost decimal(10,2) DEFAULT 0 NOT NULL,
  status text NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_repair_orders_ro_number ON repair_orders (ro_number);
CREATE INDEX IF NOT EXISTS idx_repair_orders_customer_id ON repair_orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_repair_orders_status ON repair_orders (status);
CREATE INDEX IF NOT EXISTS idx_repair_orders_vehicle_vin ON repair_orders (vehicle_vin);

CREATE TABLE IF NOT EXISTS repair_order_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  repair_order_id uuid NOT NULL,
  part_id uuid,
  quantity integer DEFAULT 1 NOT NULL,
  unit_price decimal(10,2) NOT NULL,
  labor_hours decimal(5,2) DEFAULT 0 NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_repair_order_items_repair_order_id ON repair_order_items (repair_order_id);
CREATE INDEX IF NOT EXISTS idx_repair_order_items_part_id ON repair_order_items (part_id);

CREATE TABLE IF NOT EXISTS service_appointments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  customer_id uuid NOT NULL,
  vehicle_vin text NOT NULL,
  appointment_date timestamp with time zone NOT NULL,
  service_type text NOT NULL,
  advisor_id uuid NOT NULL,
  status text NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_service_appointments_customer_id ON service_appointments (customer_id);
CREATE INDEX IF NOT EXISTS idx_service_appointments_advisor_date ON service_appointments (advisor_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_service_appointments_status ON service_appointments (status);

CREATE TABLE IF NOT EXISTS invoices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  invoice_number text NOT NULL UNIQUE,
  customer_id uuid NOT NULL,
  related_order_id uuid,
  order_type text,
  invoice_date timestamp with time zone NOT NULL,
  due_date timestamp with time zone NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  paid_amount decimal(10,2) DEFAULT 0 NOT NULL,
  status text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices (invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices (customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices (status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices (due_date);

CREATE TABLE IF NOT EXISTS payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  invoice_id uuid NOT NULL,
  payment_date timestamp with time zone NOT NULL,
  amount decimal(10,2) NOT NULL,
  payment_method text NOT NULL,
  transaction_id text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments (invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments (payment_date);

CREATE TABLE IF NOT EXISTS compliance_records (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  record_type text NOT NULL,
  reference_id uuid,
  description text NOT NULL,
  compliance_date timestamp with time zone NOT NULL,
  status text NOT NULL,
  audited_by uuid,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_compliance_records_record_type ON compliance_records (record_type);
CREATE INDEX IF NOT EXISTS idx_compliance_records_status ON compliance_records (status);
CREATE INDEX IF NOT EXISTS idx_compliance_records_compliance_date ON compliance_records (compliance_date);

CREATE TABLE IF NOT EXISTS communications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  customer_id uuid NOT NULL,
  user_id uuid NOT NULL,
  type text NOT NULL,
  channel text NOT NULL,
  subject text,
  content text NOT NULL,
  sent_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_communications_customer_id ON communications (customer_id);
CREATE INDEX IF NOT EXISTS idx_communications_user_id ON communications (user_id);
CREATE INDEX IF NOT EXISTS idx_communications_channel ON communications (channel);
CREATE INDEX IF NOT EXISTS idx_communications_sent_at ON communications (sent_at);