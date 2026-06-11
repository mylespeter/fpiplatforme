// // app/api/verify-code/route.ts
// import { NextResponse } from 'next/server'
// import { supabase } from '@/lib/supabase'

// export async function POST(request: Request) {
//   try {
//     const { email, code } = await request.json()

//     if (!email || !code) {
//       return NextResponse.json(
//         { error: 'Email et code requis' },
//         { status: 400 }
//       )
//     }

//     // Vérifier le code
//     const { data, error: verifyError } = await supabase
//       .from('email_confirmations')
//       .select('*')
//       .eq('email', email.toLowerCase().trim())
//       .eq('code', code)
//       .gt('expires_at', new Date().toISOString())
//       .single()

//     if (verifyError || !data) {
//       return NextResponse.json(
//         { error: 'Code invalide ou expiré' },
//         { status: 400 }
//       )
//     }

//     // Marquer l'email comme vérifié
//     const { error: updateError } = await supabase
//       .from('users')
//       .update({ email_verified: true })
//       .eq('email', email.toLowerCase().trim())

//     if (updateError) {
//       throw updateError
//     }

//     // Supprimer le code utilisé
//     await supabase
//       .from('email_confirmations')
//       .delete()
//       .eq('id', data.id)

//     return NextResponse.json({
//       success: true,
//       message: 'Email vérifié avec succès'
//     })

//   } catch (error) {
//     console.error('Erreur:', error)
//     return NextResponse.json(
//       { error: 'Erreur serveur' },
//       { status: 500 }
//     )
//   }
// }

// app/api/verify-code/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email et code requis' },
        { status: 400 }
      )
    }

    // Vérifier le code
    const { data, error: verifyError } = await supabase
      .from('email_confirmations')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('code', code)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (verifyError || !data) {
      return NextResponse.json(
        { error: 'Code invalide ou expiré' },
        { status: 400 }
      )
    }

    // Marquer l'email comme vérifié
    const { error: updateError } = await supabase
      .from('users')
      .update({ email_verified: true })
      .eq('email', email.toLowerCase().trim())

    if (updateError) {
      throw updateError
    }

    // Récupérer les informations de l'utilisateur pour la connexion automatique
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (userError || !userData) {
      throw new Error('Utilisateur non trouvé')
    }

    // Supprimer le code utilisé
    await supabase
      .from('email_confirmations')
      .delete()
      .eq('id', data.id)

    // Retourner les données utilisateur pour la connexion automatique
    return NextResponse.json({
      success: true,
      message: 'Email vérifié avec succès',
      user: {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        role: userData.role,
        telephone: userData.telephone,
        genre: userData.genre,
        photo_profil: userData.photo_profil,
        created_at: userData.created_at,
        updated_at: userData.updated_at
      }
    })

  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}