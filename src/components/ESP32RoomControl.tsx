// components/rooms/ESP32RealtimeControl.tsx
'use client'

import { useESP32Realtime } from '@/hooks/useESP32Realtime'
import { Power, Lightbulb, DoorOpen, DoorClosed, Wifi, WifiOff, RefreshCw, UserPlus, LogOut } from 'lucide-react'
import { useState } from 'react'
import { showToast } from '@/components/ui/Toast'

interface ESP32RealtimeControlProps {
  roomNumber: '101' | '102'
}

export function ESP32RealtimeControl({ roomNumber }: ESP32RealtimeControlProps) {
  const {
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
    refresh
  } = useESP32Realtime(roomNumber)

  const [showCheckInModal, setShowCheckInModal] = useState(false)
  const [clientName, setClientName] = useState('')

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border animate-pulse">
        <div className="h-64 bg-gray-100 rounded"></div>
      </div>
    )
  }

  if (!roomState) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-red-200">
        <div className="text-center text-red-600">
          <WifiOff className="h-12 w-12 mx-auto mb-4" />
          <p>Chambre {roomNumber} - Données non disponibles</p>
        </div>
      </div>
    )
  }

  const isDoorOpen = roomState.servo_angle > 90
  const isOnline = esp32Status?.online || false

  const handleCheckIn = async () => {
    if (!clientName.trim()) {
      showToast('Entrez le nom du client', 'warning')
      return
    }
    await checkIn(clientName)
    setShowCheckInModal(false)
    setClientName('')
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* En-tête avec statut ESP32 */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-white">Chambre {roomNumber}</h3>
            <div className="flex items-center gap-2 mt-1">
              {isOnline ? (
                <span className="flex items-center gap-1 text-xs text-green-400">
                  <Wifi className="h-3 w-3" />
                  ESP32 connecté
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-yellow-400">
                  <WifiOff className="h-3 w-3" />
                  ESP32 hors ligne
                </span>
              )}
              {esp32Status?.mode === 'STA' && (
                <span className="text-xs text-gray-400">
                  {esp32Status?.wifi_ssid}
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={refresh}
            disabled={isLoading}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-white"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* État de la chambre */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">{isDoorOpen ? '🔓' : '🔒'}</div>
            <div className="text-xs text-gray-500">Porte</div>
            <div className="text-sm font-medium">{isDoorOpen ? 'Déverrouillée' : 'Verrouillée'}</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">{roomState.led_on ? '💡' : '🌙'}</div>
            <div className="text-xs text-gray-500">LED</div>
            <div className="text-sm font-medium">{roomState.led_on ? 'Allumée' : 'Éteinte'}</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">{roomState.motor_on ? '🔧' : '⭕'}</div>
            <div className="text-xs text-gray-500">Moteur</div>
            <div className="text-sm font-medium">
              {roomState.motor_on ? `${Math.round(roomState.motor_speed / 2.55)}%` : 'Arrêt'}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">{roomState.occupied ? '👤' : '🚪'}</div>
            <div className="text-xs text-gray-500">Statut</div>
            <div className="text-sm font-medium">
              {roomState.occupied ? 'Occupée' : 'Libre'}
            </div>
          </div>
        </div>

        {/* Nom du client si occupé */}
        {roomState.occupied && roomState.current_client && (
          <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 font-medium">
              Client: {roomState.current_client}
            </p>
          </div>
        )}

        {/* Boutons de contrôle */}
        <div className="space-y-3">
          {/* Contrôle porte */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={unlockDoor}
              disabled={isSending}
              className="flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
            >
              <DoorOpen className="h-4 w-4" />
              Déverrouiller
            </button>
            <button
              onClick={lockDoor}
              disabled={isSending}
              className="flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
            >
              <DoorClosed className="h-4 w-4" />
              Verrouiller
            </button>
          </div>
          
          {/* Contrôle LED */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={ledOn}
              disabled={isSending || roomState.led_on}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-colors font-medium ${
                roomState.led_on 
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : 'bg-yellow-500 hover:bg-yellow-600 text-white'
              }`}
            >
              <Lightbulb className="h-4 w-4" />
              Allumer LED
            </button>
            <button
              onClick={ledOff}
              disabled={isSending || !roomState.led_on}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-colors font-medium ${
                !roomState.led_on
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              <Lightbulb className="h-4 w-4" />
              Éteindre LED
            </button>
          </div>
          
          {/* Contrôle moteur */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => motorOn(255)}
              disabled={isSending || roomState.motor_on}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-colors font-medium ${
                roomState.motor_on
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <Power className="h-4 w-4" />
              Démarrer moteur
            </button>
            <button
              onClick={motorOff}
              disabled={isSending || !roomState.motor_on}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-colors font-medium ${
                !roomState.motor_on
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              <Power className="h-4 w-4" />
              Arrêter moteur
            </button>
          </div>

          {/* Check-in / Check-out */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t">
            {!roomState.occupied ? (
              <button
                onClick={() => setShowCheckInModal(true)}
                disabled={isSending}
                className="flex items-center justify-center gap-2 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium col-span-2"
              >
                <UserPlus className="h-4 w-4" />
                Check-in
              </button>
            ) : (
              <button
                onClick={checkOut}
                disabled={isSending}
                className="flex items-center justify-center gap-2 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium col-span-2"
              >
                <LogOut className="h-4 w-4" />
                Check-out
              </button>
            )}
          </div>
        </div>

        {isSending && (
          <div className="mt-4 text-center text-sm text-blue-600 flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            Envoi de la commande...
          </div>
        )}
      </div>

      {/* Modal Check-in */}
      {showCheckInModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Check-in Chambre {roomNumber}</h3>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Nom du client"
              className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCheckInModal(false)}
                className="flex-1 py-2 border rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleCheckIn}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}