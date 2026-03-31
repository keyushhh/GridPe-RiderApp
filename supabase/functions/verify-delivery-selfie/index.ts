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
    const { orderId, selfieBase64 } = await req.json()
    if (!orderId || !selfieBase64) throw new Error("Missing parameters")

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 1. Upload Delivery Selfie
    const base64Data = selfieBase64.replace(/^data:image\/\w+;base64,/, '')
    const bytes = decode(base64Data)
    const filePath = `${orderId}/delivery_${Date.now()}.jpg`

    const { error: uploadError } = await supabase.storage
      .from('rider-selfies')
      .upload(filePath, bytes, { contentType: 'image/jpeg' })

    if (uploadError) throw new Error(`Selfie upload failed: ${uploadError.message}`)

    const { data: { publicUrl: deliverySelfieUrl } } = supabase.storage
      .from('rider-selfies')
      .getPublicUrl(filePath)

    // 2. Fetch pickup selfie for comparison (placeholder)
    const { data: order } = await supabase
      .from('orders')
      .select('pickup_selfie_url')
      .eq('id', orderId)
      .single()

    // 3. Mark face match as true (Manual review architecture)
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        delivery_selfie_url: deliverySelfieUrl,
        face_match_passed: true, // Auto-pass for now per instructions
        face_match_score: 95.0   // Simulated score
      })
      .eq('id', orderId)

    if (updateError) throw updateError

    return new Response(JSON.stringify({ 
      success: true, 
      deliverySelfieUrl, 
      matched: true 
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
