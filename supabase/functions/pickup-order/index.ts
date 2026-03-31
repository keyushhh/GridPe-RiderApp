import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { decode } from "https://deno.land/std@0.177.0/encoding/base64.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { riderId, orderId, selfieBase64 } = await req.json()
    if (!riderId || !orderId || !selfieBase64) throw new Error("Missing parameters")

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 1. Fetch rider UUID
    const { data: rider } = await supabase.from('riders').select('id').eq('rider_id', riderId).single()
    if (!rider) throw new Error("Rider not found")

    // 2. Upload Selfie to Storage
    const base64Data = selfieBase64.replace(/^data:image\/\w+;base64,/, '')
    const bytes = decode(base64Data)
    const filePath = `${orderId}/pickup_${Date.now()}.jpg`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('rider-selfies')
      .upload(filePath, bytes, { contentType: 'image/jpeg' })

    if (uploadError) throw new Error(`Selfie upload failed: ${uploadError.message}`)

    const { data: { publicUrl } } = supabase.storage.from('rider-selfies').getPublicUrl(filePath)

    // 3. Mark picked up
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: 'picked_up',
        pickup_selfie_url: publicUrl,
        picked_up_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .eq('rider_id', rider.id)

    if (updateError) throw updateError

    return new Response(JSON.stringify({ success: true, selfieUrl: publicUrl }), {
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
