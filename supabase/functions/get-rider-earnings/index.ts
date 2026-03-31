import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { riderId, type, weekStart, weekEnd, date } = await req.json()

    if (!riderId) throw new Error("Missing riderId")

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 1. Fetch rider UUID and wallet balance
    const { data: rider, error: riderError } = await supabase
      .from('riders')
      .select('id, wallet_balance')
      .eq('rider_id', riderId)
      .single()

    if (riderError || !rider) throw new Error("Rider not found")
    const riderUuid = rider.id

    let result: any = {}

    // Helper to format DATE for Postgres
    const formatDate = (d: Date) => d.toISOString().split('T')[0]

    // IST Helper (Asia/Kolkata +5:30)
    const getISTDate = (d: Date = new Date()) => {
      return new Date(d.getTime() + (5.5 * 60 * 60 * 1000))
    }

    if (type === 'overview') {
      // Current Mon-Sun week in IST
      const now = new Date()
      // Adjust to IST
      const istNow = getISTDate(now)
      const day = istNow.getUTCDay() // 0=Sun, 1=Mon...
      const diffSinceMon = (day === 0 ? 6 : day - 1)
      
      const mon = new Date(istNow)
      mon.setUTCDate(istNow.getUTCDate() - diffSinceMon)
      mon.setUTCHours(0, 0, 0, 0)
      
      const sun = new Date(mon)
      sun.setUTCDate(mon.getUTCDate() + 6)
      sun.setUTCHours(23, 59, 59, 999)

      const pStart = formatDate(mon)
      const pEnd = formatDate(sun)

      const { data, error } = await supabase.rpc('get_rider_weekly_earnings', {
        p_rider_uuid: riderUuid,
        p_week_start: pStart,
        p_week_end: pEnd
      })

      if (error) throw error
      const summary = data[0] || { total_earnings: 0, order_earnings: 0, total_tips: 0, delivery_count: 0, total_hours: 0 }

      result = {
        totalEarnings: summary.total_earnings,
        orderEarnings: summary.order_earnings,
        totalTips: summary.total_tips,
        deliveryCount: summary.delivery_count,
        avgPerHour: summary.total_hours > 0 ? (summary.total_earnings / summary.total_hours) : 0,
        walletBalance: rider.wallet_balance || 0,
        weekStart: pStart,
        weekEnd: pEnd
      }
    } else if (type === 'weekly') {
      const { data, error } = await supabase.rpc('get_rider_weekly_earnings', {
        p_rider_uuid: riderUuid,
        p_week_start: weekStart,
        p_week_end: weekEnd
      })
      if (error) throw error
      result = data[0] || { total_earnings: 0, order_earnings: 0, total_tips: 0, delivery_count: 0, total_hours: 0 }
    } else if (type === 'daily') {
      const { data, error } = await supabase.rpc('get_rider_daily_earnings', {
        p_rider_uuid: riderUuid,
        p_week_start: weekStart,
        p_week_end: weekEnd
      })
      if (error) throw error
      result = data || []
    } else if (type === 'day-detail') {
      const { data, error } = await supabase.rpc('get_rider_weekly_earnings', {
        p_rider_uuid: riderUuid,
        p_week_start: date,
        p_week_end: date
      })
      if (error) throw error
      result = data[0] || { total_earnings: 0, order_earnings: 0, total_tips: 0, delivery_count: 0, total_hours: 0 }
    } else if (type === 'weeks-list') {
      const { data, error } = await supabase.rpc('get_rider_weeks_summary', {
        p_rider_uuid: riderUuid,
        p_weeks: 12
      })
      if (error) throw error
      result = data || []
    }

    return new Response(JSON.stringify(result), {
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
