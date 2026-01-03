import { serve } from "std/http/server.ts"
import { createClient } from "@supabase/supabase-js"
import { crypto } from "std/crypto/mod.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const body = await req.json()
        const { order_id, status_code, gross_amount, signature_key, transaction_status } = body

        const serverKey = Deno.env.get('MIDTRANS_SERVER_KEY')

        // Validate signature
        const input = order_id + status_code + gross_amount + serverKey
        const encoder = new TextEncoder()
        const data = encoder.encode(input)
        const hashBuffer = await crypto.subtle.digest("SHA-512", data)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

        if (hashHex !== signature_key) {
            return new Response(JSON.stringify({ error: 'Invalid signature' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 403,
            })
        }

        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Update transaction status
        const { data: transaction, error: fetchError } = await supabaseAdmin
            .from('payment_transactions')
            .select('user_id')
            .eq('order_id', order_id)
            .single()

        if (fetchError || !transaction) throw new Error('Transaction not found')

        const { error: updateError } = await supabaseAdmin
            .from('payment_transactions')
            .update({ status: transaction_status, updated_at: new NOW() })
            .eq('order_id', order_id)

        if (updateError) throw updateError

        // If payment is successful, activate subscription
        if (transaction_status === 'settlement' || transaction_status === 'capture') {
            const { error: subError } = await supabaseAdmin
                .from('user_subscriptions')
                .upsert({
                    user_id: transaction.user_id,
                    status: 'active',
                    start_date: new Date().toISOString(),
                    expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    updated_at: new Date().toISOString()
                })

            if (subError) throw subError
        }

        return new Response(JSON.stringify({ message: 'Success' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})

// Helper for NOW() equivalent in JS if needed, but easier to use ISO string
