// app/api/send-verification/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendVerificationCode } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { email, username } = await request.json()

    if (!email || !username) {
      return NextResponse.json(
        { error: 'Email et nom d\'utilisateur requis' },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role, email')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier que c'est un promoteur
    if (user.role !== 'promoteur') {
      return NextResponse.json(
        { error: 'La vérification est uniquement pour les comptes promoteurs' },
        { status: 403 }
      )
    }

    // Générer un code à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

    // Supprimer les anciens codes
    await supabase
      .from('email_confirmations')
      .delete()
      .eq('email', email.toLowerCase().trim())

    // Insérer le nouveau code
    const { error: insertError } = await supabase
      .from('email_confirmations')
      .insert([{
        email: email.toLowerCase().trim(),
        code: code,
        expires_at: expiresAt
      }])

    if (insertError) {
      throw insertError
    }

    // Envoyer l'email
    const emailResult = await sendVerificationCode(
      email.toLowerCase().trim(),
      code,
      username
    )

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi de l\'email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Code envoyé avec succès'
    })

  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}