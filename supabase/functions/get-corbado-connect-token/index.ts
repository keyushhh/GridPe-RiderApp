import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const projectId = Deno.env.get("CORBADO_PROJECT_ID")
    const apiSecret = Deno.env.get("CORBADO_API_SECRET")
    
    console.log(`[INIT] Starting edge function. CORBADO_PROJECT_ID: ${projectId ? projectId : 'UNDEFINED'}`)

    if (!projectId || !apiSecret) {
      throw new Error("Missing CORBADO_PROJECT_ID or CORBADO_API_SECRET edge function secrets.")
    }

    const basicAuth = btoa(`${projectId}:${apiSecret}`)
    const authHeader = `Basic ${basicAuth}`

    const bodyText = await req.text()
    console.log(`[INIT] Raw request body: ${bodyText}`)
    
    let body;
    try {
      body = JSON.parse(bodyText)
    } catch (e) {
      throw new Error(`Failed to parse request JSON body: ${bodyText}`)
    }

    const { dynamicRiderId } = body

    if (!dynamicRiderId || typeof dynamicRiderId !== 'string' || dynamicRiderId.trim() === '') {
      console.error("[ERROR] dynamicRiderId is undefined, not a string, or empty")
      throw new Error("Missing dynamicRiderId in request body")
    }

    console.log(`[STEP 1] Creating/Fetching Corbado user for dynamicRiderId: ${dynamicRiderId}`)
    
    // Step 1: Create User
    const createUserUrl = `https://backendapi.cloud.corbado.io/v2/users`
    console.log(`[API CALL] POST ${createUserUrl}`)
    
    const createUserRes = await fetch(createUserUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        remoteIdentifier: dynamicRiderId,
        fullName: dynamicRiderId,
        status: "pending"
      }),
    })

    const createUserStatus = createUserRes.status
    const createUserResponseText = await createUserRes.text()
    console.log(`[API RESPONSE] Status: ${createUserStatus}, Body: ${createUserResponseText}`)

    let createUserJson: any = {}
    try {
      createUserJson = JSON.parse(createUserResponseText)
    } catch (e) {
      console.log(`[JSON PARSE ERROR] Could not parse step 1 response as JSON.`)
    }

    if (createUserStatus >= 200 && createUserStatus < 300) {
      console.log(`[SUCCESS] Corbado user created successfully`)
    } else if (createUserStatus === 409) {
      console.log(`[CONFLICT] Corbado user already exists (409). Ignoring and proceeding...`)
    } else {
      throw new Error(`Corbado API Error (Step 1). Status: ${createUserStatus}. Body: ${createUserResponseText}`)
    }

    console.log(`[STEP 2] Generating connect token for customerIdentifier: ${dynamicRiderId}`)

    // Step 2: Generate connect token for passkey-append
    const connectTokenUrl = `https://backendapi.cloud.corbado.io/v2/connectTokens`
    console.log(`[API CALL] POST ${connectTokenUrl}`)

    const connectTokenBody = JSON.stringify({
      type: "passkey-append",
      data: {
        displayName: dynamicRiderId,
        identifier: dynamicRiderId
      },
      maxLifetimeInSeconds: 3600
    })

    console.log("Step 2 request body:", connectTokenBody)

    const tokenRes = await fetch(connectTokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: connectTokenBody
    })

    const tokenStatus = tokenRes.status
    const tokenResponseText = await tokenRes.text()
    console.log(`[API RESPONSE] Status: ${tokenStatus}, Body: ${tokenResponseText}`)

    let tokenJson: any = {}
    try {
      tokenJson = JSON.parse(tokenResponseText)
    } catch (e) {
      console.log(`[JSON PARSE ERROR] Could not parse step 2 response as JSON.`)
    }

    if (tokenStatus < 200 || tokenStatus >= 300) {
      throw new Error(`Corbado API Error (Step 2). Status: ${tokenStatus}. Body: ${tokenResponseText}`)
    }

    console.log("[SUCCESS] Connect token generated successfully.")

    return new Response(JSON.stringify({ 
      connectToken: tokenJson.secret
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (e: any) {
    console.error('[CATCH BLOCK ERROR]', e.message)
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
