// components/messagerie/BadgeMessagesCount.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

type BadgeMessagesCountProps = {
  className?: string
}

const getUserId = (user: any): number | null => {
  if (!user?.id) return null
  const uid = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id
  return isNaN(uid) ? null : uid
}

export default function BadgeMessagesCount({ className = '' }: BadgeMessagesCountProps) {
  const { user } = useAuth()
  const userId = getUserId(user)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!userId) return

    const chargerCompte = async () => {
      const { count: total, error } = await supabase
        .from('messages_projet')
        .select('*', { count: 'exact', head: true })
        .neq('expediteur_id', userId)
        .eq('est_lu', false)

      if (!error && total !== null) {
        setCount(total)
      }
    }

    chargerCompte()

    const channel = supabase
      .channel('badge_messages_global')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages_projet',
        },
        (payload) => {
          const newMsg = payload.new as any
          if (newMsg.expediteur_id !== userId) {
            setCount(prev => prev + 1)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  if (count === 0) return null

  return (
    <span className={`flex items-center justify-center min-w-[20px] h-[20px] bg-red-500 text-white text-[10px] font-bold rounded-full px-1 ${className}`}>
      {count > 99 ? '99+' : count}
    </span>
  )
}