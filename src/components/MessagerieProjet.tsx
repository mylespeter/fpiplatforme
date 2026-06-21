// components/messagerie/MessagerieProjet.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { 
  Send, MessageCircle, User, Shield, Check, CheckCheck,
  Loader2, X
} from 'lucide-react'

type Message = {
  id: number
  projet_id: number
  expediteur_id: number
  expediteur_type: 'promoteur' | 'technicien' | 'admin'
  contenu: string
  est_lu: boolean
  lu_a: string | null
  created_at: string
  expediteur_nom?: string
}

type MessagerieProjetProps = {
  projetId: number
  projetNom: string
  promoteurId: number
  technicienId?: number | null
  currentUserType: 'promoteur' | 'technicien' | 'admin'
  onClose?: () => void
}

// Helper pour obtenir l'ID utilisateur
const getUserId = (user: any): number | null => {
  if (!user?.id) return null
  const uid = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id
  return isNaN(uid) ? null : uid
}

export default function MessagerieProjet({
  projetId,
  projetNom,
  promoteurId,
  technicienId,
  currentUserType,
  onClose
}: MessagerieProjetProps) {
  const { user } = useAuth()
  const userId = getUserId(user)
  
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [isOpen, setIsOpen] = useState(true)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const channelRef = useRef<any>(null)

  // Charger les messages
  useEffect(() => {
    if (projetId && userId !== null) {
      chargerMessages()
      sabonnerAuxMessages()
    }
    
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [projetId, userId])

  const chargerMessages = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('messages_projet')
        .select('*')
        .eq('projet_id', projetId)
        .order('created_at', { ascending: true })

      if (error) throw error

      const messagesEnrichis = await enrichirMessages(data || [])
      setMessages(messagesEnrichis)
      
      marquerCommeLu(messagesEnrichis)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const enrichirMessages = async (msgs: any[]): Promise<Message[]> => {
    if (msgs.length === 0) return []
    
    const userIds = [...new Set(msgs.map(m => m.expediteur_id))].filter((id): id is number => id !== null)
    
    if (userIds.length === 0) {
      return msgs.map(m => ({
        ...m,
        expediteur_nom: `Utilisateur #${m.expediteur_id}`
      }))
    }
    
    const { data: users } = await supabase
      .from('users')
      .select('id, username')
      .in('id', userIds)

    const userMap = (users || []).reduce((acc: Record<number, string>, u: any) => {
      const uid = typeof u.id === 'string' ? parseInt(u.id, 10) : u.id
      acc[uid] = u.username || `Utilisateur #${uid}`
      return acc
    }, {})

    return msgs.map(m => ({
      ...m,
      expediteur_nom: userMap[m.expediteur_id] || `Utilisateur #${m.expediteur_id}`
    }))
  }

  const marquerCommeLu = (msgs: Message[]) => {
    if (!userId) return
    
    const messagesNonLus = msgs.filter(
      m => !m.est_lu && m.expediteur_id !== userId
    )
    
    if (messagesNonLus.length > 0) {
      const ids = messagesNonLus.map(m => m.id)
      supabase
        .from('messages_projet')
        .update({ est_lu: true, lu_a: new Date().toISOString() })
        .in('id', ids)
        .then(() => {
          setMessages(prev => 
            prev.map(m => 
              ids.includes(m.id) ? { ...m, est_lu: true, lu_a: new Date().toISOString() } : m
            )
          )
        })
    }
  }

  const sabonnerAuxMessages = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }

    const channel = supabase
      .channel(`messages_projet_${projetId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages_projet',
          filter: `projet_id=eq.${projetId}`
        },
        async (payload) => {
          const newMsg = payload.new as Message
          const msgEnrichi = await enrichirMessages([newMsg])
          
          setMessages(prev => [...prev, ...msgEnrichi])
          
          if (newMsg.expediteur_id !== userId) {
            await supabase
              .from('messages_projet')
              .update({ est_lu: true, lu_a: new Date().toISOString() })
              .eq('id', newMsg.id)
          }
          
          setTimeout(scrollToBottom, 100)
        }
      )
      .subscribe()

    channelRef.current = channel
  }

  const envoyerMessage = async () => {
    if (!newMessage.trim() || sending || !userId) return
    
    setSending(true)
    setError('')
    
    try {
      const { data, error } = await supabase
        .from('messages_projet')
        .insert({
          projet_id: projetId,
          expediteur_id: userId,
          expediteur_type: currentUserType,
          contenu: newMessage.trim()
        })
        .select()
        .single()

      if (error) throw error
      
      const msgEnrichi = await enrichirMessages([data])
      setMessages(prev => [...prev, ...msgEnrichi])
      setNewMessage('')
      
      setTimeout(scrollToBottom, 100)
      
      // Envoyer une notification
      const destinataireId = currentUserType === 'promoteur' ? technicienId : promoteurId
      if (destinataireId) {
        try {
          await fetch('/api/push/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: destinataireId,
              notification: {
                title: `📩 Nouveau message - ${projetNom}`,
                body: `${user?.username || 'Utilisateur'}: ${newMessage.trim().slice(0, 100)}${newMessage.trim().length > 100 ? '...' : ''}`,
                url: `/dashboard/projets/${projetId}`,
                type: 'info',
                projetId: projetId
              }
            })
          })
        } catch (pushError) {
          // Silencieux - ne pas bloquer l'envoi du message
        }
      }
      
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi')
    } finally {
      setSending(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      envoyerMessage()
    }
  }

  const getAvatar = (message: Message) => {
    const isMe = message.expediteur_id === userId
    
    if (isMe) {
      return (
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
          {user?.username?.[0]?.toUpperCase() || 'M'}
        </div>
      )
    }
    
    const isTechnicien = message.expediteur_type === 'technicien'
    return (
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
        isTechnicien ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
      }`}>
        {isTechnicien ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </div>
    )
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-[600px] w-full">
      {/* En-tête */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Discussion</h3>
              <p className="text-xs text-gray-500 truncate max-w-[200px]">{projetNom}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" /> Promoteur
          </span>
          {technicienId && (
            <>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-1">
                <Shield className="h-3 w-3" /> Technicien
              </span>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[400px] bg-gray-50/50">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Aucun message</p>
            <p className="text-xs text-gray-400">Commencez la discussion</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.expediteur_id === userId
            const isTechnicien = msg.expediteur_type === 'technicien'
            const showDate = index === 0 || 
              new Date(msg.created_at).toDateString() !== new Date(messages[index - 1].created_at).toDateString()
            
            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="text-center my-3">
                    <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                      {new Date(msg.created_at).toLocaleDateString('fr-FR', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                )}
                
                <div className={`flex items-start gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                  {getAvatar(msg)}
                  
                  <div className={`flex-1 max-w-[75%] ${isMe ? 'items-end' : ''}`}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-xs font-medium ${isMe ? 'text-gray-700' : isTechnicien ? 'text-blue-700' : 'text-green-700'}`}>
                        {isMe ? 'Moi' : msg.expediteur_nom || (isTechnicien ? 'Technicien' : 'Promoteur')}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isMe && (
                        <span className="text-[10px] text-gray-400">
                          {msg.est_lu ? <CheckCheck className="h-3 w-3 text-blue-600" /> : <Check className="h-3 w-3" />}
                        </span>
                      )}
                    </div>
                    
                    <div className={`p-3 rounded-2xl ${
                      isMe 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : isTechnicien 
                          ? 'bg-blue-50 text-gray-800 rounded-tl-none border border-blue-100'
                          : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {msg.contenu}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Erreur */}
      {error && (
        <div className="flex-shrink-0 px-4 py-2 bg-red-50 border-t border-red-100">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Zone de saisie */}
      <div className="flex-shrink-0 p-3 border-t border-gray-100 bg-white rounded-b-2xl">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écrire un message..."
            rows={1}
            className="flex-1 resize-none px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[40px] max-h-[100px]"
            style={{ height: 'auto' }}
          />
          
          <button
            onClick={envoyerMessage}
            disabled={!newMessage.trim() || sending}
            className="flex-shrink-0 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5 text-center">
          Appuyez sur <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-mono">Enter</kbd> pour envoyer
        </p>
      </div>
    </div>
  )
}