import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { riderId, filter = 'all' } = await req.json()
    if (!riderId) throw new Error("Missing riderId")

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 1. Fetch rider UUID
    const { data: rider, error: riderError } = await supabase
      .from('riders')
      .select('id')
      .eq('rider_id', riderId)
      .single()

    if (riderError || !rider) throw new Error("Rider not found")

    // 2. Build query based on filter
    let query = supabase
      .from('rider_transactions')
      .select('*')
      .eq('rider_uuid', rider.id)
      .order('created_at', { ascending: false });

    // Filter mapping:
    // 'earnings' -> delivery_tip, bonus, referral_reward, earning
    // 'payouts' -> auto_payout, instant_withdrawal
    // 'deductions' -> type = fee OR fee > 0
    if (filter === 'earnings') {
      query = query.in('type', ['delivery_tip', 'bonus', 'referral_reward', 'earning']);
    } else if (filter === 'payouts') {
      query = query.in('type', ['auto_payout', 'instant_withdrawal']);
    } else if (filter === 'deductions') {
      // For deductions, we might want type = 'fee' or any transaction where fee > 0
      // Since supabase filter is a bit limited for OR across columns, we fetch and filter in JS if needed, 
      // but let's try a simple type-based filter first or filter by fee > 0
      query = query.or(`type.eq.fee,fee.gt.0`);
    }

    const { data: transactions, error: txError } = await query;

    if (txError) throw txError

    return new Response(JSON.stringify({ transactions: transactions || [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
