-- Add missing columns to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS picked_up_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS face_match_score NUMERIC,
ADD COLUMN IF NOT EXISTS face_match_passed BOOLEAN DEFAULT false;

-- RPC for atomic order completion
CREATE OR REPLACE FUNCTION complete_order(
  p_order_id UUID,
  p_rider_uuid UUID,
  p_otp TEXT,
  p_delivery_selfie_url TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_earnings NUMERIC;
  v_tip NUMERIC;
  v_total NUMERIC;
BEGIN
  -- Fetch and validate order
  SELECT * INTO v_order FROM orders 
  WHERE id = p_order_id 
    AND rider_id = p_rider_uuid 
    AND status = 'picked_up'
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not found or invalid status');
  END IF;
  
  -- Validate OTP
  IF v_order.otp_code != p_otp THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid OTP');
  END IF;
  
  -- Calculate earnings
  v_earnings := COALESCE(v_order.rider_earnings, 0);
  v_tip := COALESCE(v_order.delivery_tip, 0);
  v_total := v_earnings + v_tip;
  
  -- Mark order delivered
  UPDATE orders SET
    status = 'delivered',
    delivered_at = now(),
    delivery_selfie_url = p_delivery_selfie_url
  WHERE id = p_order_id;
  
  -- Update rider wallet
  UPDATE riders SET
    wallet_balance = wallet_balance + v_total,
    total_earnings = total_earnings + v_total
  WHERE id = p_rider_uuid;
  
  -- Insert earnings transaction
  INSERT INTO rider_transactions (
    rider_uuid, rider_id, type, amount, fee, tds, 
    final_amount, status, description, reference_id
  )
  SELECT 
    p_rider_uuid, r.rider_id, 'earning', v_total, 0, 0,
    v_total, 'completed', 
    'Delivery earnings for order ' || p_order_id::text,
    'ORD-' || p_order_id::text
  FROM riders r WHERE r.id = p_rider_uuid;
  
  -- Insert tip transaction separately if tip > 0
  IF v_tip > 0 THEN
    INSERT INTO rider_transactions (
      rider_uuid, rider_id, type, amount, fee, tds,
      final_amount, status, description, reference_id
    )
    SELECT
      p_rider_uuid, r.rider_id, 'delivery_tip', v_tip, 0, 0,
      v_tip, 'completed',
      'Customer tip for order ' || p_order_id::text,
      'TIP-' || p_order_id::text
    FROM riders r WHERE r.id = p_rider_uuid;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'earnings', v_earnings,
    'tip', v_tip,
    'totalEarned', v_total
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
