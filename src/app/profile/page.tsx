// app/profile/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { User, Camera, Save, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

export default function ProfilePage() {
  const { user, updateUser, loading: authLoading } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    telephone: '',
    genre: '',
    photo_profil: ''
  })

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        telephone: user.telephone || '',
        genre: user.genre || '',
        photo_profil: user.photo_profil || ''
      })
      setImageLoading(true)
      setImageError(false)
    }
  }, [user])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-2 text-sm text-gray-500">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const roleLabels: Record<string, string> = {
    promoteur: 'Promoteur',
    technique: 'Agent Technique',
    credit: 'Agent de Crédit',
    admin: 'Administrateur'
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('La photo ne doit pas dépasser 5MB')
      return
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage('Format non supporté. Utilisez JPG, PNG, GIF ou WebP')
      return
    }

    try {
      setLoading(true)
      setErrorMessage('')
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`

      const { error } = await supabase.storage
        .from('profiles')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(fileName)

      setFormData({ ...formData, photo_profil: publicUrl })
      setImageLoading(true)
      setImageError(false)
      setSuccessMessage('Photo mise à jour')

    } catch (error: any) {
      console.error('Erreur upload:', error)
      setErrorMessage(error.message === 'Bucket not found' 
        ? 'Stockage non configuré. Contactez l\'administrateur.'
        : 'Erreur lors du téléchargement')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const { error } = await supabase
        .from('users')
        .update({
          username: formData.username,
          telephone: formData.telephone || null,
          genre: formData.genre || null,
          photo_profil: formData.photo_profil || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      updateUser({
        ...user,
        username: formData.username,
        telephone: formData.telephone || null,
        genre: (formData.genre === 'M' || formData.genre === 'F') ? formData.genre : null,
        photo_profil: formData.photo_profil || null,
        updated_at: new Date().toISOString()
      })

      setSuccessMessage('Profil mis à jour avec succès')
      setIsEditing(false)

    } catch (error) {
      console.error('Erreur mise à jour:', error)
      setErrorMessage('Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        telephone: user.telephone || '',
        genre: user.genre || '',
        photo_profil: user.photo_profil || ''
      })
    }
    setIsEditing(false)
    setErrorMessage('')
    setSuccessMessage('')
  }

  return (
    <div className="h- flex flex-col  p-4">
      <div className="max-w-lg mx-auto w-full flex-1 flex flex-col min-h-0">
        {/* Messages - hauteur fixe */}
        <div className="flex-shrink-0 space-y-2 mb-3">
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
              <p className="text-xs text-green-700">{successMessage}</p>
            </div>
          )}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-700">{errorMessage}</p>
            </div>
          )}
        </div>

        {/* Carte principale - scrollable uniquement si nécessaire */}
        <div className="flex-1 flex flex-col min-h-0 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* En-tête - compact */}
          <div className="flex-shrink-0 bg-gradient-to-r from-gray-50 to-gray-100 p-4">
            <div className="flex items-center gap-3">
              {/* Photo de profil - plus petite */}
              <div className="relative flex-shrink-0">
                {formData.photo_profil && !imageError ? (
                  <div className="relative w-16 h-16">
                    {imageLoading && (
                      <div className="absolute inset-0 bg-gray-200 rounded-full flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      </div>
                    )}
                    <img
                      src={formData.photo_profil}
                      alt={user.username}
                      className={`w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm ${
                        imageLoading ? 'opacity-0' : 'opacity-100'
                      } transition-opacity duration-300`}
                      onLoad={() => setImageLoading(false)}
                      onError={() => {
                        setImageLoading(false)
                        setImageError(true)
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-white shadow-sm flex items-center justify-center">
                    {imageLoading && formData.photo_profil ? (
                      <Loader2 className="h-6 w-6 animate-spin text-primary/60" />
                    ) : (
                      <User className="h-7 w-7 text-primary" />
                    )}
                  </div>
                )}
                
                {isEditing && (
                  <label className="absolute -bottom-1 -right-1 bg-primary text-white p-1.5 rounded-full cursor-pointer shadow-md hover:bg-primary/90 transition-colors">
                    <Camera className="h-3 w-3" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Infos utilisateur */}
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-gray-900 truncate">{user.username}</h2>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {roleLabels[user.role] || user.role}
                </span>
              </div>
            </div>
          </div>

          {/* Formulaire - scrollable si contenu trop long */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">
                Informations personnelles
              </h3>
              {!isEditing ? (
                <button
                  onClick={() => {
                    setIsEditing(true)
                    setErrorMessage('')
                    setSuccessMessage('')
                  }}
                  className="text-xs text-primary hover:text-primary/80 font-medium"
                >
                  Modifier
                </button>
              ) : (
                <button
                  onClick={handleCancel}
                  className="text-xs text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Annuler
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Username */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="mt-0.5 text-xs text-gray-400">Non modifiable</p>
              </div>

              {/* Téléphone + Genre en ligne */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="+243 XXX XXX XXX"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Genre
                  </label>
                  <select
                    name="genre"
                    value={formData.genre}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50 disabled:text-gray-500 transition-colors bg-white"
                  >
                    <option value="">Non spécifié</option>
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                </div>
              </div>

              {/* Informations système - compact */}
              <div className="pt-3 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-400">Membre depuis</p>
                    <p className="text-xs font-medium text-gray-700">
                      {new Date(user.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'short'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Dernière modification</p>
                    <p className="text-xs font-medium text-gray-700">
                      {new Date(user.updated_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Bouton sauvegarder - fixe en bas */}
          {isEditing && (
            <div className="flex-shrink-0 p-4 pt-0">
              <button
                type="submit"
                disabled={loading}
                onClick={handleSubmit}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Enregistrer les modifications
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}