// lib/esp32-service.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface ESP32Command {
  room: '101' | '102'
  action: 'unlock_door' | 'lock_door' | 'led_on' | 'led_off' | 'motor_on' | 'motor_off' | 'checkin' | 'checkout'
  params?: {
    speed?: number
    client_name?: string
    checkin_time?: string
  }
}

class ESP32Service {
  
  // Envoyer une commande via Supabase
  async sendCommand(command: ESP32Command): Promise<{ success: boolean; commandId?: string; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('room_commands')
        .insert({
          device_id: 'esp32_001',
          room_number: command.room,
          action: command.action,
          params: command.params || {},
          executed: false,
          created_at: new Date().toISOString()
        })
        .select()
      
      if (error) throw error
      
      return { 
        success: true, 
        commandId: data[0].id 
      }
      
    } catch (error: any) {
      console.error('Erreur envoi commande:', error)
      return { success: false, error: error.message }
    }
  }

  // Récupérer le statut en temps réel d'une chambre
  subscribeToRoom(roomNumber: '101' | '102', callback: (room: any) => void) {
    return supabase
      .channel(`room_${roomNumber}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `room_number=eq.${roomNumber}`
        },
        (payload) => {
          callback(payload.new)
        }
      )
      .subscribe()
  }

  // Récupérer le statut actuel d'une chambre
  async getRoomStatus(roomNumber: '101' | '102') {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_number', roomNumber)
      .single()
    
    if (error) return null
    return data
  }

  // Récupérer le statut de l'ESP32
  async getESP32Status() {
    const { data, error } = await supabase
      .from('esp32_status')
      .select('*')
      .eq('device_id', 'esp32_001')
      .single()
    
    if (error) return null
    return data
  }

  // Commandes spécifiques
  async unlockDoor(room: '101' | '102') {
    return this.sendCommand({ room, action: 'unlock_door' })
  }

  async lockDoor(room: '101' | '102') {
    return this.sendCommand({ room, action: 'lock_door' })
  }

  async ledOn(room: '101' | '102') {
    return this.sendCommand({ room, action: 'led_on' })
  }

  async ledOff(room: '101' | '102') {
    return this.sendCommand({ room, action: 'led_off' })
  }

  async motorOn(room: '101' | '102', speed?: number) {
    return this.sendCommand({ room, action: 'motor_on', params: { speed: speed || 255 } })
  }

  async motorOff(room: '101' | '102') {
    return this.sendCommand({ room, action: 'motor_off' })
  }

  async checkIn(room: '101' | '102', clientName: string) {
    return this.sendCommand({ 
      room, 
      action: 'checkin', 
      params: { 
        client_name: clientName,
        checkin_time: new Date().toISOString()
      } 
    })
  }

  async checkOut(room: '101' | '102') {
    return this.sendCommand({ room, action: 'checkout' })
  }
}

export const esp32Service = new ESP32Service()