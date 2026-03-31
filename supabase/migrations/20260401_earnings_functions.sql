-- Weekly earnings summary
CREATE OR REPLACE FUNCTION get_rider_weekly_earnings(
  p_rider_uuid UUID,
  p_week_start DATE,
  p_week_end DATE
)
RETURNS TABLE (
  total_earnings NUMERIC,
  order_earnings NUMERIC,
  total_tips NUMERIC,
  delivery_count INTEGER,
  total_hours NUMERIC
) AS $$
  SELECT
    COALESCE(SUM(rider_earnings + COALESCE(delivery_tip, 0)), 0) as total_earnings,
    COALESCE(SUM(rider_earnings), 0) as order_earnings,
    COALESCE(SUM(delivery_tip), 0) as total_tips,
    COUNT(*)::INTEGER as delivery_count,
    0::NUMERIC as total_hours -- placeholder until shift tracking is added
  FROM public.orders
  WHERE rider_id = p_rider_uuid
    AND status = 'delivered'
    AND delivered_at >= p_week_start::timestamptz
    AND delivered_at < (p_week_end + 1)::timestamptz
$$ LANGUAGE sql SECURITY DEFINER;

-- Daily earnings for a week (grouped by day)
CREATE OR REPLACE FUNCTION get_rider_daily_earnings(
  p_rider_uuid UUID,
  p_week_start DATE,
  p_week_end DATE
)
RETURNS TABLE (
  day DATE,
  total_earnings NUMERIC,
  order_earnings NUMERIC,
  total_tips NUMERIC,
  delivery_count INTEGER
) AS $$
  SELECT
    DATE(delivered_at AT TIME ZONE 'Asia/Kolkata') as day,
    COALESCE(SUM(rider_earnings + COALESCE(delivery_tip, 0)), 0) as total_earnings,
    COALESCE(SUM(rider_earnings), 0) as order_earnings,
    COALESCE(SUM(delivery_tip), 0) as total_tips,
    COUNT(*)::INTEGER as delivery_count
  FROM public.orders
  WHERE rider_id = p_rider_uuid
    AND status = 'delivered'
    AND delivered_at >= p_week_start::timestamptz
    AND delivered_at < (p_week_end + 1)::timestamptz
  GROUP BY DATE(delivered_at AT TIME ZONE 'Asia/Kolkata')
  ORDER BY day DESC
$$ LANGUAGE sql SECURITY DEFINER;

-- Last N weeks summary list
CREATE OR REPLACE FUNCTION get_rider_weeks_summary(
  p_rider_uuid UUID,
  p_weeks INTEGER DEFAULT 12
)
RETURNS TABLE (
  week_start DATE,
  week_end DATE,
  total_earnings NUMERIC,
  delivery_count INTEGER
) AS $$
  SELECT
    DATE_TRUNC('week', delivered_at AT TIME ZONE 'Asia/Kolkata')::DATE as week_start,
    (DATE_TRUNC('week', delivered_at AT TIME ZONE 'Asia/Kolkata') + INTERVAL '6 days')::DATE as week_end,
    COALESCE(SUM(rider_earnings + COALESCE(delivery_tip, 0)), 0) as total_earnings,
    COUNT(*)::INTEGER as delivery_count
  FROM public.orders
  WHERE rider_id = p_rider_uuid
    AND status = 'delivered'
    AND delivered_at >= NOW() - (p_weeks || ' weeks')::INTERVAL
  GROUP BY DATE_TRUNC('week', delivered_at AT TIME ZONE 'Asia/Kolkata')
  ORDER BY week_start DESC
$$ LANGUAGE sql SECURITY DEFINER;

-- Add wallet_balance to riders if missing
ALTER TABLE public.riders ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC DEFAULT 0;
