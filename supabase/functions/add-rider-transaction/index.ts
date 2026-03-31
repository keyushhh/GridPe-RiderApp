import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { riderId, type, amount, description, referenceId, metadata = {} } = await req.json()
    if (!riderId) throw new Error("Missing riderId")
    if (!type) throw new Error("Missing type")
    if (!amount) throw new Error("Missing amount")

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 1. Fetch rider
    const { data: rider, error: riderError } = await supabase
      .from('riders')
      .select('id, wallet_balance')
      .eq('rider_id', riderId)
      .single()

    if (riderError || !rider) throw new Error("Rider not found")

    // 2. Insert transaction
    const { data: txData, error: txError } = await supabase
      .from('rider_transactions')
      .insert({
        rider_uuid: rider.id,
        rider_id: riderId,
        type: type,
        amount: amount,
        fee: 0,
        tds: 0,
        final_amount: amount,
        status: 'completed',
        description: description,
        reference_id: referenceId || `${type.toUpperCase()}-${Date.now()}`,
        metadata: metadata
      })
      .select()
      .single()

    if (txError) throw txError

    // 3. Update wallet balance if it's an earning/bonus/referral
    if (['bonus', 'referral_reward', 'delivery_tip', 'earning'].includes(type)) {
      const newBalance = Number(rider.wallet_balance) + Number(amount)
      const { error: updateError } = await supabase
        .from('riders')
        .update({ wallet_balance: newBalance })
        .eq('id', rider.id)
      
      if (updateError) throw updateError
    }

    return new Response(JSON.stringify({ success: true, transactionId: txData.id }), {
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
