import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { riderId, amount } = await req.json()
    if (!riderId) throw new Error("Missing riderId")
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

    // 2. Validations
    if (rider.wallet_balance < 500) {
      return new Response(JSON.stringify({ success: false, error: "Balance too low" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    if (amount < 500 || amount > 15000) {
      return new Response(JSON.stringify({ success: false, error: "Invalid amount (Min ₹500, Max ₹15,000)" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    if (amount > rider.wallet_balance) {
      return new Response(JSON.stringify({ success: false, error: "Insufficient balance" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // 3. Processing
    const fee = 20
    const tds = 0
    const finalAmount = amount - fee - tds
    const newBalance = Number(rider.wallet_balance) - amount

    // 4. Atomic Deduct from wallet
    const { error: updateError } = await supabase
      .from('riders')
      .update({ wallet_balance: newBalance })
      .eq('id', rider.id)

    if (updateError) throw updateError

    // 5. Fetch primary bank account
    const { data: primaryBank, error: bankError } = await supabase
      .from('rider_bank_accounts')
      .select('id, bank_name, account_number_masked')
      .eq('rider_id', rider.id)
      .eq('is_primary', true)
      .limit(1)
      .single()

    if (bankError) throw new Error("Primary bank account not found. Please set one up first.")

    // 6. Insert transaction record (with snapshot)
    const referenceId = `IW-${Date.now()}`
    const { error: txError } = await supabase
      .from('rider_transactions')
      .insert({
        rider_uuid: rider.id,
        rider_id: riderId,
        type: 'instant_withdrawal',
        amount: amount,
        fee: fee,
        tds: tds,
        final_amount: finalAmount,
        status: 'completed',
        bank_account_id: primaryBank.id,
        description: `Instant withdrawal to ${primaryBank.bank_name}`,
        reference_id: referenceId,
        wallet_balance_snapshot: rider.wallet_balance // Save the snapshot
      })

    if (txError) throw txError

    // 7. Return success
    return new Response(JSON.stringify({ 
      success: true, 
      newBalance, 
      finalAmount, 
      fee, 
      tds,
      referenceId,
      bankName: primaryBank.bank_name,
      accountMasked: primaryBank.account_number_masked
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
