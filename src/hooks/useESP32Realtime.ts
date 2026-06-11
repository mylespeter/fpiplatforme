// hooks/useESP32Realtime.ts
import { useState, useEffect } from 'react'
import { esp32Service } from '@/lib/esp32-service'
import { showToast } from '@/components/ui/Toast'

interface RoomState {
  room_number: string
  occupied: boolean
  current_client: string | null
  led_on: boolean
  motor_on: boolean
  motor_speed: number
  servo_angle: number
  updated_at: string
}

export function useESP32Realtime(roomNumber: '101' | '102') {
  const [roomState, setRoomState] = useState<RoomState | null>(null)
  const [esp32Status, setEsp32Status] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  // Charger l'état initial
  useEffect(() => {
    loadInitialState()
  }, [roomNumber])

  // S'abonner aux changements en temps réel
  useEffect(() => {
    const subscription = esp32Service.subscribeToRoom(roomNumber, (newState) => {
      setRoomState(newState)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [roomNumber])

  const loadInitialState = async () => {
    setIsLoading(true)
    const room = await esp32Service.getRoomStatus(roomNumber)
    const status = await esp32Service.getESP32Status()
    setRoomState(room)
    setEsp32Status(status)
    setIsLoading(false)
  }

  const sendCommand = async (action: any, params?: any) => {
    setIsSending(true)
    const result = await esp32Service.sendCommand({
      room: roomNumber,
      action,
      params
    })
    
    if (result.success) {
      showToast(`Commande envoyée avec succès`, 'success')
    } else {
      showToast(`Erreur: ${result.error}`, 'error')
    }
    
    setIsSending(false)
    return result.success
  }

  const unlockDoor = () => sendCommand('unlock_door')
  const lockDoor = () => sendCommand('lock_door')
  const ledOn = () => sendCommand('led_on')
  const ledOff = () => sendCommand('led_off')
  const motorOn = (speed?: number) => sendCommand('motor_on', { speed })
  const motorOff = () => sendCommand('motor_off')
  const checkIn = (clientName: string) => sendCommand('checkin', { client_name: clientName })
  const checkOut = () => sendCommand('checkout')

  return {
    roomState,
    esp32Status,
    isLoading,
    isSending,
    unlockDoor,
    lockDoor,
    ledOn,
    ledOff,
    motorOn,
    motorOff,
    checkIn,
    checkOut,
    refresh: loadInitialState
  }
}