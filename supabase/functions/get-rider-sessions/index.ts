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
    console.log(`[get-rider-sessions] Raw request body: ${bodyText}`)

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

    console.log(`[get-rider-sessions] Fetching sessions for rider: ${riderId}`)

    // Fetch last 5 sessions
    const { data: sessions, error: fetchError } = await supabase
      .from('rider_sessions')
      .select('*')
      .eq('rider_id', riderId)
      .order('last_login_at', { ascending: false })
      .limit(5)

    if (fetchError) throw fetchError

    console.log(`[get-rider-sessions] Successfully fetched ${sessions?.length || 0} sessions for ${riderId}`)

    return new Response(JSON.stringify({
      sessions
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err: any) {
    console.error(`[get-rider-sessions] Error:`, err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
