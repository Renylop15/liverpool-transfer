import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Manejo de pre-vuelo CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const event = await req.json()

    // 1. Verificación inicial de OpenPay (Solo ocurre cuando das de alta el Webhook)
    if (event.type === 'verification') {
      console.log('Verificación de Webhook recibida:', event.verification_code)
      return new Response(event.verification_code, { status: 200 })
    }

    // 2. Escuchar solo cargos exitosos
   if (event.type === 'charge.succeeded') {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const transaction = event.transaction;
      
      // Recuperamos el ID oculto de la reserva y la descripción
      const reservaId = transaction.order_id;
      const descripcion = transaction.description || '';

      console.log(`💰 Pago exitoso detectado. ID: ${reservaId} - ${descripcion}`);

      if (!reservaId) {
         throw new Error('No se encontró el ID de la reserva en el webhook');
      }

      // Actualizamos usando el ID ÚNICO en lugar del correo (100% exacto)
      if (descripcion.includes('Traslado Ejecutivo')) {
        await supabase.from('reservas').update({ estatus: 'PAGADO' }).eq('id', reservaId);
      } 
      else if (descripcion.includes('Shared Tickets') || descripcion.includes('Private Ride') || descripcion.includes('Experience')) {
        await supabase.from('reservas_experiencias').update({ estatus: 'PAGADO' }).eq('id', reservaId);
      }
      else if (descripcion.includes('Servicio Chofer')) {
        await supabase.from('reservas_chofer').update({ estatus: 'PAGADO' }).eq('id', reservaId);
      }
    }

    return new Response(JSON.stringify({ received: true }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 200 
    })

  } catch (error) {
    console.error('Error en Webhook:', error.message)
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 400 
    })
  }
})