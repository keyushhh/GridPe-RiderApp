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
    console.log(`[log-rider-session] Raw request body: ${bodyText}`)

    let body
    try {
      body = JSON.parse(bodyText)
    } catch (e) {
      throw new Error(`Failed to parse request body: ${bodyText}`)
    }

    const { riderId, deviceName } = body
    if (!riderId) {
      throw new Error("Missing riderId in request body")
    }

    // IP address detection from headers - Updated as per user request
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
      || req.headers.get('cf-connecting-ip') 
      || 'Unknown'

    console.log(`[log-rider-session] Logging session for rider: ${riderId}, IP: ${ipAddress}`)

    // Get approximate location from IP
    let location = 'Unknown'
    if (ipAddress !== 'Unknown' && ipAddress !== '127.0.0.1') {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ipAddress}`)
        const geo = await geoRes.json()
        if (geo.status === 'success') {
          location = `${geo.city}, ${geo.country}`
        }
      } catch (err) {
        console.error(`[log-rider-session] GeoLookup failed:`, err)
      }
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

    // 1. Set all existing sessions for this rider to is_current = false
    const { error: updateError } = await supabase
      .from('rider_sessions')
      .update({ is_current: false })
      .eq('rider_id', riderId)
    
    if (updateError) console.error(`[log-rider-session] Warning: Failed to unset current session:`, updateError)

    // 2. Insert new session
    const { error: insertError } = await supabase
      .from('rider_sessions')
      .insert({
        rider_id: riderId,
        device_name: deviceName || 'Unknown Device',
        ip_address: ipAddress,
        location: location,
        is_current: true
      })

    if (insertError) throw insertError

    // 3. Keep only last 5 sessions (using a direct query through rpc or manual cleanup)
    const { data: recentSessions } = await supabase
      .from('rider_sessions')
      .select('id')
      .eq('rider_id', riderId)
      .order('last_login_at', { ascending: false })
      .limit(5)

    if (recentSessions && recentSessions.length >= 5) {
      const keepIds = recentSessions.map(s => s.id)
      const { error: deleteError } = await supabase
        .from('rider_sessions')
        .delete()
        .eq('rider_id', riderId)
        .not('id', 'in', `(${keepIds.join(',')})`)
      
      if (deleteError) console.error(`[log-rider-session] Warning: Deletion of old sessions failed:`, deleteError)
    }

    console.log(`[log-rider-session] Session successfully logged for ${riderId}`)

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err: any) {
    console.error(`[log-rider-session] Error:`, err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
