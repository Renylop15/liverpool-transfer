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
    // NUEVO: Ahora recibimos la URL de redirección desde Angular
    const { monto, nombre, email, descripcion, redirectUrl } = await req.json()

    // 🚨 1. PON TUS LLAVES DE SANDBOX AQUÍ (Las encuentras en el panel de Openpay activando el Modo Pruebas)
    const MERCHANT_ID = "mmiruuvaltiosz1xkyye"; 
    const PRIVATE_KEY = "sk_3ab0983a6e8740918045fa2acabc09ec"; 

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
      // 🚨 2. REDIRECCIÓN DINÁMICA
      redirect_url: redirectUrl || "https://igdsmxcity.vancity.mx/reserva" 
    };

    // 🚨 3. CAMBIAMOS LA URL A "sandbox-api.openpay.mx"
    const openpayResponse = await fetch(`https://api.openpay.mx/v1/${MERCHANT_ID}/checkouts`, {
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