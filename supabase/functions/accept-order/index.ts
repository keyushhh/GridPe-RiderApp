import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { riderId, orderId } = await req.json()
    console.log('Received riderId:', riderId)

    if (!riderId || !orderId) throw new Error("Missing riderId or orderId")

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

    console.log('Rider lookup result:', rider)

    if (riderError || !rider) throw new Error(`Rider not found for rider_id: ${riderId}`)

    // 2. Accept order (atomic transition from pending)
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status: 'accepted', 
        rider_id: rider.id,
        accepted_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .eq('status', 'pending')
      .select()
      .single()

    if (error) throw new Error("Order already accepted by another rider or doesn't exist.")

    return new Response(JSON.stringify({ success: true, order: data }), {
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
