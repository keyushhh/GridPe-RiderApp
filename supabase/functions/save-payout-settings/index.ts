import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { 
      riderId, 
      payoutSchedule, 
      minimumBalance, 
      autoPayoutEnabled, 
      primaryBankId 
    } = await req.json()

    if (!riderId) throw new Error("Missing riderId")

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 1. Fetch rider UUID (riders.id) from riderId (GRIDPE-RDR4072)
    const { data: rider, error: riderError } = await supabase
      .from('riders')
      .select('id')
      .eq('rider_id', riderId)
      .single()

    if (riderError || !rider) throw new Error("Rider not found")
    const riderUuid = rider.id

    // 2. Handle Primary Bank swap in rider_bank_accounts
    if (primaryBankId) {
      console.log(`Setting bank ${primaryBankId} as primary for rider ${riderUuid}`);
      
      // Step A: Reset all existing primary status
      const { error: resetError } = await supabase
        .from('rider_bank_accounts')
        .update({ is_primary: false })
        .eq('rider_id', riderUuid);
      
      if (resetError) throw resetError;

      // Step B: Set new primary
      const { error: setError } = await supabase
        .from('rider_bank_accounts')
        .update({ is_primary: true })
        .eq('id', primaryBankId);
      
      if (setError) throw setError;
    }

    // 3. Upsert into rider_payout_settings
    const { error: upsertError } = await supabase
      .from('rider_payout_settings')
      .upsert({
        rider_uuid: riderUuid,
        rider_id: riderId,
        payout_schedule: payoutSchedule,
        minimum_balance: minimumBalance,
        auto_payout_enabled: autoPayoutEnabled,
        primary_bank_account_id: primaryBankId,
        updated_at: new Date().toISOString()
      }, { onConflict: 'rider_uuid' })

    if (upsertError) throw upsertError

    return new Response(JSON.stringify({ success: true }), {
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
