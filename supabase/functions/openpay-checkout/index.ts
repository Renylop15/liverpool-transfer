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
    const body = await req.json();

    // 🚨 LLAVES DE SANDBOX
    const MERCHANT_ID = "mmiruuvaltiosz1xkyye"; 
    const PRIVATE_KEY = "sk_3ab0983a6e8740918045fa2acabc09ec"; 
    const authBase64 = btoa(PRIVATE_KEY + ":");

    // =========================================================
    // ACCIÓN 1: VERIFICAR UN PAGO EXISTENTE (Cuando regresan a la página)
    // =========================================================
    if (body.action === 'verify') {
      const transactionId = body.transaction_id;
      
      const verifyResponse = await fetch(`https://api.openpay.mx/v1/${MERCHANT_ID}/charges/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${authBase64}`,
          'Content-Type': 'application/json'
        }
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error('Error al verificar transacción');
      }

      // Le avisa a Angular que el pago fue 'completed'
      return new Response(
        JSON.stringify({ status: verifyData.status }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

// =========================================================
    // ACCIÓN 2: CREAR UN NUEVO CHECKOUT
    // =========================================================
    const openpayPayload = {
      amount: body.monto,
      description: body.descripcion, // Se queda limpio para el cliente
      order_id: body.reserva_id,     // Usamos el ID de Supabase como número de orden
      currency: "MXN",
      customer: { name: body.nombre, email: body.email },
      send_email: false,
      redirect_url: body.redirectUrl || "https://igdsmxcity.vancity.mx/reserva" 
    };

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