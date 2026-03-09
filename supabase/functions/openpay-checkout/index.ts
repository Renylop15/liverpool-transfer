import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Esto permite que tu página de Angular pueda platicar con este servidor sin bloqueos de seguridad
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Manejo del escudo de seguridad del navegador (Pre-flight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Recibir los datos de la reserva desde tu Angular
    const { monto, nombre, email, descripcion } = await req.json()


    const MERCHANT_ID = "m9tls2avkrnkk9ijxjpt"; 
    const PRIVATE_KEY = "sk_039ca482b80044d5a0e27c0a57392358"; 

    // 3. Crear el código secreto (Base64) que exige OpenPay
    const authBase64 = btoa(PRIVATE_KEY + ":");

    // 4. Preparar la "Factura" para mandarla a BBVA
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
      // A dónde mandaremos al cliente cuando termine de pagar con éxito:
      redirect_url: "http://localhost:4200/" 
    };

    // 5. Tocar la puerta de OpenPay y pedir el link de cobro
    const openpayResponse = await fetch(`https://sandbox-api.openpay.mx/v1/${MERCHANT_ID}/checkouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authBase64}`
      },
      body: JSON.stringify(openpayPayload)
    });

    const openpayData = await openpayResponse.json();

    // 6. Si el banco rechaza la petición, activamos la alarma
    if (!openpayResponse.ok) {
      throw new Error(openpayData.description || 'Error al conectar con OpenPay');
    }

    // 7. Si todo sale bien, devolver el Link de Cobro a tu página
    return new Response(
      JSON.stringify({ checkoutLink: openpayData.checkout_link }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    // Si algo explota, le avisamos a Angular
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})