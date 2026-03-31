import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { riderId } = await req.json()
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

    // 2. Fetch payout settings
    const { data: settings, error: settingsError } = await supabase
      .from('rider_payout_settings')
      .select('*')
      .eq('rider_uuid', riderUuid) // Fix: use rider_uuid to match the settings table
      .maybeSingle()

    if (settingsError) throw settingsError

    // 3. Fetch ALL bank accounts for this rider (using UUID column rider_id)
    const { data: bankAccounts, error: bankError } = await supabase
      .from('rider_bank_accounts')
      .select('id, bank_name, account_number_masked, account_holder_name, is_primary, verification_status')
      .eq('rider_id', riderUuid) // As per user instruction, the UUID column is called rider_id
      .order('is_primary', { ascending: false })

    if (bankError) throw bankError

    // 4. Identify primary bank
    const primaryBank = bankAccounts?.find(b => b.is_primary) || null

    // 5. Return combined result with defaults
    const result = {
      settings: settings || {
        payout_schedule: 'twice_monthly',
        minimum_balance: 0,
        auto_payout_enabled: true,
        primary_bank_account_id: primaryBank?.id || null
      },
      primaryBank,
      allBankAccounts: bankAccounts || []
    }

    return new Response(JSON.stringify(result), {
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
