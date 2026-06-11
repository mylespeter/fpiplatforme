// app/api/push/unsubscribe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    console.log('📥 [Unsubscribe API] Requête reçue pour userId:', userId)

    if (!userId) {
      return NextResponse.json({ error: 'User ID manquant' }, { status: 401 })
    }

    const { endpoint } = await request.json()

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint manquant' }, { status: 400 })
    }

    console.log('🗑️ [Unsubscribe API] Suppression de l\'abonnement...')

    const { error } = await supabaseAdmin
      .from('push_subscriptions')
      .delete()
      .match({ 
        user_id: parseInt(userId), 
        endpoint: endpoint 
      })

    if (error) {
      console.error('❌ [Unsubscribe API] Erreur:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ [Unsubscribe API] Abonnement supprimé')
    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('❌ [Unsubscribe API] Erreur:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}