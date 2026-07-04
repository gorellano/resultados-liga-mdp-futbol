import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import webpush from 'npm:web-push';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.14.0';

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;

webpush.setVapidDetails(
  'mailto:contacto@costaygol.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    });
  }

  try {
    const { match_id, home_team_id, away_team_id, home_name, away_name, result, is_edit, division_id, title } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Obtener suscripciones para los equipos local y visitante
    // Y que la division_id coincida con la del partido o sea null (todas)
    const { data: subscriptions, error } = await supabaseAdmin
      .from('push_subscriptions')
      .select('endpoint, keys')
      .in('team_id', [home_team_id, away_team_id])
      .or(`division_id.is.null,division_id.eq.${division_id || '00000000-0000-0000-0000-000000000000'}`);

    if (error) {
      throw error;
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ message: 'No subscribers found' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Deduplicar por endpoint (para no mandar dos veces si un hincha está suscrito a ambos)
    const uniqueSubs = new Map();
    subscriptions.forEach(sub => uniqueSubs.set(sub.endpoint, sub));

    const notificationPayload = JSON.stringify({
      title: title || (is_edit ? '¡Resultado Actualizado!' : '¡Resultado Cargado!'),
      body: `${home_name} ${result} ${away_name}`,
      icon: '/logo_costa_y_gol.png',
      url: '/'
    });

    const sendPromises = Array.from(uniqueSubs.values()).map(sub => 
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: sub.keys },
        notificationPayload
      ).catch((e) => {
        console.error('Error enviando a', sub.endpoint, e);
        // Si el endpoint expiró, deberíamos borrarlo de la BD
        if (e.statusCode === 410 || e.statusCode === 404) {
           return supabaseAdmin.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
        }
      })
    );

    await Promise.all(sendPromises);

    return new Response(JSON.stringify({ success: true, count: uniqueSubs.size }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (err) {
    console.error('Error general:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});
