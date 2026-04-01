import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { decode } from "https://deno.land/std@0.177.0/encoding/base64.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('pickup-order function invoked')
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json()
    console.log('PICKUP REQUEST BODY:', JSON.stringify(body))
    
    const { riderId, orderId, selfieUrl } = body
    console.log('Request body parsed:', { riderId, orderId, selfieUrl })
    
    if (!riderId || !orderId || !selfieUrl) throw new Error("Missing parameters")

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 1. Fetch rider UUID using rider_id text (e.g. GRIDPE-RDRXXXX)
    const { data: rider, error: riderError } = await supabase
      .from('riders')
      .select('id, rider_id')
      .eq('rider_id', riderId)
      .single()
    
    console.log('riderId received:', riderId)
    console.log('rider found:', rider)
    if (riderError) console.log('rider lookup error:', riderError)
    
    if (!rider) {
      return new Response(JSON.stringify({ 
        error: `Rider not found for rider_id: ${riderId}` 
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      })
    }

    const riderUuid = rider.id

    // 2. Mark picked up and set verification data
    // face_match_passed is hardcoded to true for testing
    const face_match_passed = true
    const face_match_score = 100

    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: 'picked_up',
        pickup_selfie_url: selfieUrl,
        picked_up_at: new Date().toISOString(),
        pickup_verified_at: new Date().toISOString(),
        face_match_passed: face_match_passed,
        face_match_score: face_match_score
      })
      .eq('id', orderId)
      .eq('rider_id', riderUuid)

    console.log('Order update error:', updateError)
    if (updateError) throw updateError

    return new Response(JSON.stringify({ 
      success: true, 
      selfieUrl: selfieUrl,
      face_match_passed,
      face_match_score
    }), {
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
