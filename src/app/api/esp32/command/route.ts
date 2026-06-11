// app/api/esp32/command/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  try {
    const { roomNumber, action, params } = await request.json()
    
    // Enregistrer la commande dans Supabase
    const { data, error } = await supabase
      .from('room_commands')
      .insert({
        device_id: 'esp32_001',
        room_number: roomNumber,
        action: action,
        params: params || {},
        executed: false,
        created_at: new Date().toISOString()
      })
      .select()
    
    if (error) throw error
    
    return NextResponse.json({ 
      success: true, 
      message: 'Commande envoyée',
      command_id: data[0].id 
    })
    
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}