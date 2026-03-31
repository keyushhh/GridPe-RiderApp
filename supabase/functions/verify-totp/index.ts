import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const bodyText = await req.text()
    console.log(`[verify-totp] Raw request body: ${bodyText}`)

    let body
    try {
      body = JSON.parse(bodyText)
    } catch (e) {
      throw new Error(`Failed to parse request body: ${bodyText}`)
    }

    const { riderId, code } = body
    if (!riderId || !code) {
      throw new Error("Missing riderId or code in request body")
    }

    // Initialize Supabase Admin Client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log(`[verify-totp] Fetching TOTP secret for rider: ${riderId}`)

    // Fetch totp_secret from riders table
    const { data: rider, error: fetchError } = await supabase
      .from('riders')
      .select('totp_secret')
      .eq('rider_id', riderId)
      .single()

    console.log('Rider fetch result:', JSON.stringify({ data: rider, error: fetchError }))

    if (fetchError || !rider) {
      console.error(`[verify-totp] Fetch error:`, fetchError)
      throw new Error("Rider not found or TOTP not set up")
    }

    if (!rider.totp_secret) {
      throw new Error("TOTP secret not configured. Please set up authenticator first.")
    }

    console.log(`[verify-totp] Validating code for ${riderId}...`)

    // Validate the TOTP code
    const OTPAuth = await import("npm:otpauth@9.3.6")
    const totp = new OTPAuth.TOTP({
      issuer: "Grid.pe",
      label: riderId,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(rider.totp_secret)
    })

    const delta = totp.validate({ token: code, window: 1 })
    const isValid = delta !== null

    console.log(`[verify-totp] Code validation result: ${isValid} (delta: ${delta})`)

    if (!isValid) {
      return new Response(JSON.stringify({
        success: false,
        error: "Invalid code. Please check your authenticator app and try again."
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Mark TOTP as verified and enabled via SDK
    console.log(`[verify-totp] Attempting SDK update for rider: ${riderId}`)
    const { error: updateError } = await supabase
      .from('riders')
      .update({
        totp_enabled: true,
        totp_verified: true
      })
      .eq('rider_id', riderId)

    if (updateError) {
      console.error(`[verify-totp] SDK update failed (possibly schema cache error):`, updateError)
      
      // Fallback to raw SQL via RPC due to PostgREST schema cache issues
      console.log(`[verify-totp] Falling back to RPC bypass for rider: ${riderId}`)
      const { error: rpcError } = await supabase.rpc('exec_totp_verify', {
        p_rider_id: riderId
      })

      if (rpcError) {
        console.error(`[verify-totp] RPC fallback also failed:`, rpcError)
        throw new Error(`Failed to save TOTP verification with RPC: ${rpcError.message}`)
      }
      
      console.log(`[verify-totp] TOTP enabled via RPC successfully for ${riderId}`)
    } else {
      console.log(`[verify-totp] TOTP enabled via SDK successfully for ${riderId}`)
    }

    return new Response(JSON.stringify({
      success: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err: any) {
    console.error(`[verify-totp] Error:`, err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
