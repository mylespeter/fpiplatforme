// components/messagerie/BadgeMessagesNonLus.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { MessageCircle } from 'lucide-react'

type BadgeMessagesNonLusProps = {
  projetId: number
  className?: string
}

export default function BadgeMessagesNonLus({ projetId, className = '' }: BadgeMessagesNonLusProps) {
  const { user } = useAuth()
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!user?.id) return

    const chargerCompte = async () => {
      const { count, error } = await supabase
        .from('messages_projet')
        .select('*', { count: 'exact', head: true })
        .eq('projet_id', projetId)
        .neq('expediteur_id', user.id)
        .eq('est_lu', false)

      if (!error && count !== null) {
        setCount(count)
      }
    }

    chargerCompte()

    // S'abonner aux nouveaux messages
    const channel = supabase
      .channel(`badge_messages_${projetId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages_projet',
          filter: `projet_id=eq.${projetId}`
        },
        (payload) => {
          const newMsg = payload.new as any
          if (newMsg.expediteur_id !== user.id) {
            setCount(prev => prev + 1)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projetId, user?.id])

  if (count === 0) return null

  return (
    <span className={`flex items-center justify-center w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full ${className}`}>
      {count > 9 ? '9+' : count}
    </span>
  )
}