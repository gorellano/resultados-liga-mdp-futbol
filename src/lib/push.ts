import { supabase } from './supabase';

// This public VAPID key needs to be configured later.
// For now, it's a placeholder or pulled from env.
const PUBLIC_VAPID_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'REPLACE_ME_WITH_REAL_VAPID_KEY';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export type SubscriptionDetails = {
  team_id: string;
  division_id: string | null;
};

export async function subscribeToTeamAndDivisions(teamId: string, divisionIds: string[] | null): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.error('Push notifications are not supported by the browser.');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      console.warn('No service worker registered.');
      return false;
    }
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      if (PUBLIC_VAPID_KEY === 'REPLACE_ME_WITH_REAL_VAPID_KEY') {
         console.warn('VAPID key not configured. Cannot subscribe to push.');
         return false;
      }
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
      });
    }

    const subJson = subscription.toJSON();
    if (!subJson.endpoint || !subJson.keys) return false;

    // Primero borramos cualquier suscripción anterior para este equipo en este endpoint
    await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', subJson.endpoint)
      .eq('team_id', teamId);

    // Si divisionIds es null o vacío y explicitly null, asumimos "Todas" -> insertamos 1 row con null
    if (!divisionIds || divisionIds.length === 0) {
      const { error } = await supabase.from('push_subscriptions').insert({
        endpoint: subJson.endpoint,
        keys: subJson.keys,
        team_id: teamId,
        division_id: null
      });
      if (error) throw error;
    } else {
      // Insertamos una fila por cada división seleccionada
      const rows = divisionIds.map(divId => ({
        endpoint: subJson.endpoint,
        keys: subJson.keys!,
        team_id: teamId,
        division_id: divId
      }));
      const { error } = await supabase.from('push_subscriptions').insert(rows);
      if (error) throw error;
    }

    return true;
  } catch (error) {
    console.error('Failed to subscribe:', error);
    return false;
  }
}

export async function unsubscribeFromTeam(teamId: string): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false;
  
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return false;
    
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      const subJson = subscription.toJSON();
      if (!subJson.endpoint) return false;

      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', subJson.endpoint)
        .eq('team_id', teamId);

      if (error) {
        console.error('Error removing push subscription:', error);
        return false;
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to unsubscribe:', error);
    return false;
  }
}

// Devuelve un Map con key=teamId y value=array de divisionIds (o null si son todas)
export async function getSubscribedTeamsAndDivisions(): Promise<Map<string, string[] | null>> {
   if (!('serviceWorker' in navigator)) return new Map();
   
   try {
     const registration = await navigator.serviceWorker.getRegistration();
     if (!registration) return new Map();
     
     const subscription = await registration.pushManager.getSubscription();
     
     if (subscription) {
       const subJson = subscription.toJSON();
       if (!subJson.endpoint) return new Map();
 
       const { data, error } = await supabase
         .from('push_subscriptions')
         .select('team_id, division_id')
         .eq('endpoint', subJson.endpoint);
 
       if (error) {
         console.error('Error fetching push subscriptions:', error);
         return new Map();
       }
       
       const result = new Map<string, string[] | null>();
       for (const sub of data) {
          const tId = sub.team_id;
          const dId = sub.division_id;

          if (!result.has(tId)) {
             if (dId === null) {
                result.set(tId, null); // Null significa todas
             } else {
                result.set(tId, [dId]);
             }
          } else {
             const existing = result.get(tId);
             if (existing !== undefined && existing !== null && dId !== null) {
                existing.push(dId);
             } else if (dId === null) {
                result.set(tId, null); // Se pisa por "todas"
             }
          }
       }
       return result;
     }
     return new Map();
   } catch (error) {
     console.error('Failed to get subscribed teams:', error);
     return new Map();
   }
}
