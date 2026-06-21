// app/api/messages/notify/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { destinataireId, titre, message, projetId, lien } = await request.json()

    if (!destinataireId) {
      return NextResponse.json({ error: 'Destinataire requis' }, { status: 400 })
    }

    // Enregistrer la notification en base
    await supabase
      .from('notifications')
      .insert({
        user_id: destinataireId,
        type: 'info',
        titre: titre || '📩 Nouveau message',
        message: message,
        lien: lien || '/dashboard',
        projet_id: projetId,
        icone: 'MessageCircle',
        est_lue: false
      })

    // Envoyer la notification push
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/push/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: destinataireId,
        notification: {
          title: titre || '📩 Nouveau message',
          body: message,
          url: lien || '/dashboard',
          type: 'info',
          projetId: projetId,
          requireInteraction: true,
          vibrate: [200, 100, 200]
        }
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur notification message:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}