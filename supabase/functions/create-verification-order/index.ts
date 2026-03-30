import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    // 1. Parse the bank details and rider_id from the Rider App
    const { account_holder_name, bank_name, account_number, ifsc_code, rider_id } = await req.json()

    if (!bank_name || !account_number || !ifsc_code || !rider_id) {
      throw new Error('Missing required details (bank details or rider_id)')
    }

    // 2. Create the Razorpay Order
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 100, // ₹1.00 in paise
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
        notes: { 
          rider_id: rider_id,
          account_holder_name,
          bank_name,
          ifsc_code
        }
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Razorpay Error: ${errorData.error?.description || 'Unknown error'}`)
    }

    const order = await response.json()

    // 3. Use the Service Role Key to bypass RLS for this insert
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data, error: dbError } = await supabaseAdmin
      .from('rider_bank_accounts')
      .insert({
        rider_id: rider_id,
        account_holder_name: account_holder_name,
        bank_name: bank_name,
        account_number_masked: account_number.slice(-4).padStart(account_number.length, 'X'),
        ifsc_code: ifsc_code,
        razorpay_order_id: order.id,
        verification_status: 'pending'
      })
      .select()
      .single()

    if (dbError) throw new Error(`Database Error: ${dbError.message}`)

    return new Response(JSON.stringify({ order, accountId: data.id }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      status: 400 
    })
  }
})
