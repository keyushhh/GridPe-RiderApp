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
    console.log(`[regenerate-backup-codes] Raw request body: ${bodyText}`)

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

    // Helper to generate a backup code: XXXX-XXXX
    const generateCode = () => {
      const part = () => Math.floor(1000 + Math.random() * 9000).toString()
      return `${part()}-${part()}`
    }

    // Generate 8 new codes
    const newCodes = Array.from({ length: 8 }, () => ({
      code: generateCode(),
      used: false
    }))

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

    // Update backup_codes in riders table
    const { error: updateError } = await supabase
      .from('riders')
      .update({ backup_codes: newCodes })
      .eq('rider_id', riderId)

    if (updateError) throw updateError

    console.log(`[regenerate-backup-codes] Backup codes regenerated successfully for ${riderId}`)

    return new Response(JSON.stringify({ 
      success: true, 
      backupCodes: newCodes 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err: any) {
    console.error(`[regenerate-backup-codes] Error:`, err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
