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
    console.log(`[setup-totp] Raw request body: ${bodyText}`)

    let body
    try {
      body = JSON.parse(bodyText)
    } catch (e) {
      throw new Error(`Failed to parse request body: ${bodyText}`)
    }

    const { riderId } = body
    if (!riderId) {
      throw new Error("Missing riderId in request body")
    }

    console.log(`[setup-totp] Generating TOTP secret for rider: ${riderId}`)

    // Generate TOTP secret using OTPAuth
    const OTPAuth = await import("npm:otpauth@9.3.6")
    const totp = new OTPAuth.TOTP({
      issuer: "Grid.pe",
      label: riderId,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: new OTPAuth.Secret()
    })

    const secret = totp.secret.base32
    const otpauthUrl = totp.toString()

    console.log(`[setup-totp] Generated secret (first 4 chars): ${secret.substring(0, 4)}...`)

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

    // Test query first to check for schema cache issues
    const { data: testData, error: testError } = await supabase
      .from('riders')
      .select('id, rider_id, totp_secret')
      .eq('rider_id', riderId)
      .single()
    console.log('Rider fetch result before update:', JSON.stringify({ data: testData, error: testError }))

    // Try standard SDK update first
    console.log(`[setup-totp] Attempting SDK update for rider: ${riderId}`)
    const { error: updateError } = await supabase
      .from('riders')
      .update({
        totp_secret: secret,
        totp_verified: false,
        totp_enabled: false
      })
      .eq('rider_id', riderId)

    if (updateError) {
      console.error(`[setup-totp] SDK update failed (possibly schema cache error):`, updateError)
      
      // Fallback to raw SQL via RPC due to PostgREST schema cache issues
      console.log(`[setup-totp] Falling back to RPC bypass for rider: ${riderId}`)
      const { error: rpcError } = await supabase.rpc('exec_totp_update', {
        p_rider_id: riderId,
        p_secret: secret
      })

      if (rpcError) {
        console.error(`[setup-totp] RPC fallback also failed:`, rpcError)
        throw new Error(`Failed to save TOTP secret with RPC: ${rpcError.message}`)
      }
      
      console.log(`[setup-totp] Secret saved via RPC successfully for ${riderId}`)
    } else {
      console.log(`[setup-totp] Secret saved via SDK successfully for ${riderId}`)
    }

    return new Response(JSON.stringify({
      secret,
      otpauthUrl
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err: any) {
    console.error(`[setup-totp] Error:`, err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
