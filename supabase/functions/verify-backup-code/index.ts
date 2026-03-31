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
    console.log(`[verify-backup-code] Raw request body: ${bodyText}`)

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

    // 1. Fetch current backup_codes
    const { data: rider, error: fetchError } = await supabase
      .from('riders')
      .select('backup_codes')
      .eq('rider_id', riderId)
      .single()

    if (fetchError || !rider) throw new Error("Rider not found.")
    
    let codes = rider.backup_codes || []
    if (!Array.isArray(codes)) codes = []

    // 2. Find a matching unused code
    const index = codes.findIndex((c: any) => c.code === code && !c.used)
    
    if (index === -1) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Invalid or already used backup code" 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // 3. Mark as used and update DB
    codes[index].used = true
    const { error: updateError } = await supabase
      .from('riders')
      .update({ backup_codes: codes })
      .eq('rider_id', riderId)

    if (updateError) throw updateError

    console.log(`[verify-backup-code] Backup code verified successfully for ${riderId}`)

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err: any) {
    console.error(`[verify-backup-code] Error:`, err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
