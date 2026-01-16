import { serve } from "std/http/server.ts"
import { createClient } from "@supabase/supabase-js"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      console.error('Error getting user:', userError)
      throw new Error('Unauthorized')
    }

    console.log('User authenticated:', user.id)

    const { order_id, amount } = await req.json()
    const serverKey = Deno.env.get('MIDTRANS_SERVER_KEY')
    const isProd = Deno.env.get('MIDTRANS_IS_PRODUCTION') === 'true'

    if (!serverKey) {
      console.error('MIDTRANS_SERVER_KEY is not set')
      throw new Error('Midtrans server key is not configured')
    }

    const auth = btoa(serverKey + ':')
    const url = isProd
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions'

    console.log('Fetching Midtrans token from:', url)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        transaction_details: {
          order_id,
          gross_amount: amount
        },
        enabled_payments: ['bank_transfer'],
        customer_details: {
          email: user.email,
        }
      })
    })

    const data = await response.json()
    console.log('Midtrans response:', data)

    if (!response.ok) {
      console.error('Midtrans API error:', data)
      throw new Error(data.error_messages?.[0] || 'Failed to generate payment token')
    }

    console.log('Inserting transaction record...')
    const { error: dbError } = await supabaseClient
      .from('payment_transactions')
      .insert({
        user_id: user.id,
        order_id,
        amount,
        status: 'pending'
      })

    if (dbError) {
      console.error('Database error:', dbError)
      throw dbError
    }

    console.log('Success! Returning token.')

    return new Response(JSON.stringify({
      token: data.token,
      is_production: isProd
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: unknown) {
    console.error('Function error:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return new Response(JSON.stringify({
      error: errorMessage,
      details: String(error)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
