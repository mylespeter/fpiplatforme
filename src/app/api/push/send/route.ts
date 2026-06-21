// app/api/push/send/route.ts
import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Configurer VAPID une seule fois
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    'mailto:undeplex@gmail.com',
    vapidPublicKey,
    vapidPrivateKey
  )
  console.log('✅ [Send API] VAPID configuré')
} else {
  console.error('❌ [Send API] Clés VAPID manquantes')
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    console.log('📥 [Send API] Envoi notification pour userId:', userId)

    if (!userId) {
      return NextResponse.json({ error: 'User ID manquant' }, { status: 401 })
    }

    const { notification } = await request.json()

    // 1. Récupérer les abonnements
    console.log('🔍 [Send API] Recherche des abonnements...')
    const { data: subscriptions, error: subError } = await supabaseAdmin
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', parseInt(userId))
      .eq('is_active', true)

    if (subError) {
      console.error('❌ [Send API] Erreur récupération abonnements:', subError)
      return NextResponse.json({ error: subError.message }, { status: 500 })
    }

    console.log(`📊 [Send API] ${subscriptions?.length || 0} abonnements trouvés`)

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Aucun abonnement trouvé',
        push: { sent: 0, total: 0 }
      })
    }

    // 2. Préparer le payload
    const payload = JSON.stringify({
      title: notification.title || 'SONAS Notification',
      body: notification.body || 'Vous avez une nouvelle notification',
      url: notification.url || '/dashboard',
      icon: notification.icon || '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      type: notification.type || 'info',
      projetId: notification.projetId,
      requireInteraction: notification.requireInteraction || false,
      vibrate: notification.vibrate || [200, 100, 200],
      timestamp: Date.now()
    })

    console.log('📨 [Send API] Payload:', payload.substring(0, 100) + '...')

    // 3. Envoyer les notifications
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth
              }
            },
            payload
          )
          return { endpoint: sub.endpoint.substring(0, 30), success: true }
        } catch (error: any) {
          console.error('❌ [Send API] Erreur envoi:', error.statusCode, error.message)
          
          // Nettoyer les abonnements invalides
          if (error.statusCode === 410 || error.statusCode === 404) {
            console.log('🗑️ [Send API] Suppression abonnement invalide')
            await supabaseAdmin
              .from('push_subscriptions')
              .delete()
              .match({ endpoint: sub.endpoint })
          }
          
          return { 
            endpoint: sub.endpoint.substring(0, 30), 
            success: false, 
            error: error.message 
          }
        }
      })
    )

    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length
    const failCount = results.length - successCount

    console.log(`✅ [Send API] Résultat: ${successCount} envoyées, ${failCount} échouées`)

    return NextResponse.json({
      success: successCount > 0,
      message: `${successCount}/${results.length} notifications envoyées`,
      push: {
        sent: successCount,
        total: results.length,
        failed: failCount,
        details: results.map(r => r.status === 'fulfilled' ? r.value : { success: false })
      }
    })

  } catch (error: any) {
    console.error('❌ [Send API] Erreur générale:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}