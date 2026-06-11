// app/api/esp32/status/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const deviceId = searchParams.get('device_id') || 'esp32_001'
  
  const { data } = await supabase
    .from('esp32_status')
    .select('*')
    .eq('device_id', deviceId)
    .single()
  
  return NextResponse.json(data || { online: false, device_id: deviceId })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { device_id, ip, online, mode } = body
    
    const { data, error } = await supabase
      .from('esp32_status')
      .upsert({
        device_id,
        ip,
        online,
        mode,
        last_seen: new Date().toISOString()
      })
      .select()
    
    if (error) throw error
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}