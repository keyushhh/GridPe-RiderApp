-- 1. Create Riders Table
CREATE TABLE IF NOT EXISTS public.riders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    is_online BOOLEAN DEFAULT false,
    vehicle_number TEXT,
    total_earnings NUMERIC(10, 2) DEFAULT 0,
    full_name TEXT,
    phone_number TEXT UNIQUE
);

-- 2. Update Orders Tables to link Riders
-- Add rider_id column to cash_orders
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cash_orders' AND column_name='rider_id') THEN
        ALTER TABLE public.cash_orders ADD COLUMN rider_id UUID REFERENCES public.riders(id);
    END IF;
END $$;

-- Add rider_id column to fx_orders
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fx_orders' AND column_name='rider_id') THEN
        ALTER TABLE public.fx_orders ADD COLUMN rider_id UUID REFERENCES public.riders(id);
    END IF;
END $$;

-- 3. Security: Enable RLS for Riders
ALTER TABLE public.riders ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for public.riders (Custom Header Logic)
DROP POLICY IF EXISTS "Users can insert their own rider profile" ON public.riders;
CREATE POLICY "Users can insert their own rider profile" 
ON public.riders FOR INSERT 
TO public 
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can read their own rider profile" ON public.riders;
CREATE POLICY "Users can read their own rider profile" 
ON public.riders FOR SELECT 
TO public 
USING (id::text = current_setting('request.headers', true)::json->>'x-rider-uuid');

DROP POLICY IF EXISTS "Users can update their own rider profile" ON public.riders;
CREATE POLICY "Users can update their own rider profile" 
ON public.riders FOR UPDATE 
TO public 
USING (id::text = current_setting('request.headers', true)::json->>'x-rider-uuid');

-- 5. RLS Policies for Orders visibility
-- Ensure riders can see pending orders they haven't claimed yet
DROP POLICY IF EXISTS "Riders can view available orders" ON public.cash_orders;
CREATE POLICY "Riders can view available orders" 
ON public.cash_orders FOR SELECT 
TO public 
USING (status = 'pending');

DROP POLICY IF EXISTS "Riders can update their accepted orders" ON public.cash_orders;
CREATE POLICY "Riders can update their accepted orders" 
ON public.cash_orders FOR UPDATE 
TO public 
USING (rider_id::text = current_setting('request.headers', true)::json->>'x-rider-uuid');

-- Repeat for fx_orders
DROP POLICY IF EXISTS "Riders can view available fx orders" ON public.fx_orders;
CREATE POLICY "Riders can view available fx orders" 
ON public.fx_orders FOR SELECT 
TO public 
USING (status = 'pending');

DROP POLICY IF EXISTS "Riders can update their accepted fx orders" ON public.fx_orders;
CREATE POLICY "Riders can update their accepted fx orders" 
ON public.fx_orders FOR UPDATE 
TO public 
USING (rider_id::text = current_setting('request.headers', true)::json->>'x-rider-uuid');
