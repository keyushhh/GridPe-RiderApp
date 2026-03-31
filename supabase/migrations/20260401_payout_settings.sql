-- Create specialized table for rider payout preferences
CREATE TABLE IF NOT EXISTS public.rider_payout_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rider_uuid UUID NOT NULL UNIQUE, -- references riders.id
  rider_id TEXT NOT NULL, -- references riders.rider_id (e.g. GRIDPE-RDR4072)
  payout_schedule TEXT DEFAULT 'twice_monthly', 
    -- values: 'quarterly', 'monthly', 'twice_monthly', 'weekly'
  minimum_balance NUMERIC DEFAULT 0,
  auto_payout_enabled BOOLEAN DEFAULT true,
  primary_bank_account_id UUID, -- references rider_bank_accounts.id
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup by public rider_id
CREATE INDEX IF NOT EXISTS idx_rider_payout_settings_rider_id 
ON public.rider_payout_settings (rider_id);

-- Simple comment for clarity
COMMENT ON TABLE public.rider_payout_settings IS 'Stores user-defined payout preferences for riders.';
