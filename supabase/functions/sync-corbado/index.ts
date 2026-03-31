import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Handle CORS Preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Get the Corbado User ID and Rider ID from the request
    const { corbado_user_id, rider_id } = await req.json()

    if (!corbado_user_id || !rider_id) {
      throw new Error('Missing corbado_user_id or rider_id')
    }

    // 3. Initialize Supabase Admin (using Service Role Key to bypass RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 4. Link the Corbado ID to the Rider and mark Passkeys as enabled
    const { error } = await supabaseAdmin
      .from('riders')
      .update({ 
        corbado_user_id: corbado_user_id,
        has_passkeys: true 
      })
      .eq('id', rider_id)

    if (error) throw error

    return new Response(JSON.stringify({ success: true, message: 'Passkey synced successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400 
    })
  }
})
