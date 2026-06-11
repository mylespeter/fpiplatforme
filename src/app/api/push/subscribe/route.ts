// app/api/push/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Créer un client Supabase avec la clé de service (contourne RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Utilise la clé de service
)

export async function POST(request: NextRequest) {
  try {
    // Récupérer l'ID utilisateur depuis le header
    const userId = request.headers.get('x-user-id')
    
    console.log('📥 [Subscribe API] Requête reçue pour userId:', userId)

    if (!userId) {
      console.error('❌ [Subscribe API] User ID manquant')
      return NextResponse.json(
        { error: 'Non autorisé - User ID manquant' }, 
        { status: 401 }
      )
    }

    // Parser le body
    const body = await request.json()
    console.log('📦 [Subscribe API] Body reçu:', JSON.stringify(body).substring(0, 100) + '...')

    const { subscription } = body

    if (!subscription || !subscription.endpoint) {
      console.error('❌ [Subscribe API] Subscription invalide:', subscription)
      return NextResponse.json(
        { error: 'Données de subscription invalides' }, 
        { status: 400 }
      )
    }

    console.log('💾 [Subscribe API] Sauvegarde dans Supabase...')

    // Insérer ou mettre à jour l'abonnement
    const { data, error } = await supabaseAdmin
      .from('push_subscriptions')
      .upsert({
        user_id: parseInt(userId),
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        user_agent: request.headers.get('user-agent') || 'unknown',
        is_active: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,endpoint',
        ignoreDuplicates: false
      })
      .select()

    if (error) {
      console.error('❌ [Subscribe API] Erreur Supabase:', error)
      return NextResponse.json(
        { error: `Erreur base de données: ${error.message}` }, 
        { status: 500 }
      )
    }

    console.log('✅ [Subscribe API] Abonnement sauvegardé avec succès')
    
    return NextResponse.json({ 
      success: true,
      message: 'Abonnement sauvegardé',
      data: data?.[0]
    })

  } catch (error: any) {
    console.error('❌ [Subscribe API] Erreur inattendue:', error)
    return NextResponse.json(
      { error: `Erreur serveur: ${error.message}` }, 
      { status: 500 }
    )
  }
}