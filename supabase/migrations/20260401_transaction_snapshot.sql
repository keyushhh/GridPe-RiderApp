-- Update transaction table to capture wallet snapshots
ALTER TABLE public.rider_transactions 
ADD COLUMN IF NOT EXISTS wallet_balance_snapshot NUMERIC DEFAULT 0;

-- Insert test data for GRIDPE-RDR4072
DO $$
DECLARE
  v_rider_uuid UUID;
BEGIN
  -- 1. Get the rider UUID
  SELECT id INTO v_rider_uuid FROM riders WHERE rider_id = 'GRIDPE-RDR4072';
  
  IF v_rider_uuid IS NOT NULL THEN
    -- Clear existing test data if any for this rider to avoid duplicates in dev
    DELETE FROM rider_transactions WHERE rider_id = 'GRIDPE-RDR4072';

    INSERT INTO rider_transactions 
      (rider_uuid, rider_id, type, amount, fee, tds, final_amount, 
       status, description, reference_id, created_at, wallet_balance_snapshot)
    VALUES
      (v_rider_uuid, 'GRIDPE-RDR4072', 'auto_payout', 25000, 0, 0, 24000,
       'completed', 'Auto payout for 06 Nov - 12 Nov', 'AP-001', now() - interval '5 days', 0),
      (v_rider_uuid, 'GRIDPE-RDR4072', 'instant_withdrawal', 10000, 20, 0, 9980,
       'pending', 'Instant payout processing', 'IW-002', now() - interval '3 days', 25000),
      (v_rider_uuid, 'GRIDPE-RDR4072', 'instant_withdrawal', 10000, 20, 0, 9980,
       'failed', 'Instant payout failed', 'IW-003', now() - interval '2 days', 15000),
      (v_rider_uuid, 'GRIDPE-RDR4072', 'delivery_tip', 24, 0, 0, 24,
       'completed', 'Delivery tip for 12 Nov', 'TIP-004', now() - interval '1 day', 0),
      (v_rider_uuid, 'GRIDPE-RDR4072', 'bonus', 2400, 0, 0, 2400,
       'completed', 'Milestone bonus for 12 Nov', 'BON-005', now() - interval '1 day', 0),
      (v_rider_uuid, 'GRIDPE-RDR4072', 'referral_reward', 2000, 0, 0, 2000,
       'completed', 'Referral reward for GRDPE-RDR-123', 'REF-006', now() - interval '12 hours', 0);
  END IF;
END $$;
