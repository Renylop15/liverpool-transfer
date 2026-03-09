import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { monto, nombre, email, descripcion } = await req.json()

    // 🔑 TUS LLAVES (Asegúrate de que tus llaves reales estén aquí)
    const MERCHANT_ID = "m9tls2avkrnkk9ijxjpt"; 
    const PRIVATE_KEY = "sk_039ca482b80044d5a0e27c0a57392358"; 

    const authBase64 = btoa(PRIVATE_KEY + ":");

    const openpayPayload = {
      amount: monto,
      description: descripcion,
      order_id: "vancity-" + Date.now(),
      currency: "MXN",
      customer: {
        name: nombre,
        email: email
      },
      send_email: false,
      // ESTA ES LA LÍNEA CORREGIDA (Nota los backticks ` y la coma al final)
      redirect_url: `http://localhost:4200/reserva`
    };

    const openpayResponse = await fetch(`https://sandbox-api.openpay.mx/v1/${MERCHANT_ID}/checkouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authBase64}`
      },
      body: JSON.stringify(openpayPayload)
    });

    const openpayData = await openpayResponse.json();

    if (!openpayResponse.ok) {
      throw new Error(openpayData.description || 'Error al conectar con OpenPay');
    }

    return new Response(
      JSON.stringify({ checkoutLink: openpayData.checkout_link }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})