'use client'

import { useState, useEffect } from 'react'
import { 
  CreditCard, Smartphone, Building2, Shield, CheckCircle, 
  AlertCircle, Wifi, QrCode, Loader2, ArrowLeft, DollarSign,
  Banknote
} from 'lucide-react'

const FRAIS_DOSSIER = 500

type Props = {
  montant: number
  reference: string
  onRetour: () => void
  onPaiementComplete: (data: PaiementData) => void
  submitting: boolean
}

export type PaiementData = {
  methode: 'mobile_money' | 'carte' | 'virement'
  operateur?: 'orange' | 'mtn' | 'airtel'
  numero?: string
  nom_banque?: string
  reference: string
  date_paiement: string
}

const operateurs = [
  { id: 'orange', nom: 'Orange Money', couleur: 'bg-orange-500', code: 'OM' },
  { id: 'mtn', nom: 'MTN Mobile Money', couleur: 'bg-yellow-500', code: 'MoMo' },
  { id: 'airtel', nom: 'Airtel Money', couleur: 'bg-red-500', code: 'AM' }
]

const banques = [
  'Rawbank', 'BCDC', 'TMB', 'Equity BCDC', 'Afriland', 
  'Sofibanque', 'FBN Bank', 'Access Bank', 'UBA', 'Standard Bank'
]

export default function Step5Paiement({ 
  montant = FRAIS_DOSSIER, 
  reference,
  onRetour,
  onPaiementComplete,
  submitting
}: Props) {
  const [step, setStep] = useState<'method' | 'details' | 'processing' | 'confirmation'>('method')
  const [methode, setMethode] = useState<'mobile_money' | 'carte' | 'virement'>('mobile_money')
  const [operateur, setOperateur] = useState<'orange' | 'mtn' | 'airtel'>('orange')
  const [numero, setNumero] = useState('')
  const [numeroCarte, setNumeroCarte] = useState('')
  const [dateExpiration, setDateExpiration] = useState('')
  const [cvv, setCvv] = useState('')
  const [nomBanque, setNomBanque] = useState('')
  const [progressPaiement, setProgressPaiement] = useState(0)
  const [showOTP, setShowOTP] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [paiementError, setPaiementError] = useState('')
  const [countdown, setCountdown] = useState(0)

  // Animation de progression du paiement
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (step === 'processing' && progressPaiement < 100) {
      timer = setInterval(() => {
        setProgressPaiement(prev => {
          const newProgress = prev + Math.random() * 15
          if (newProgress >= 100) {
            clearInterval(timer)
            setTimeout(() => {
              setStep('confirmation')
              setShowOTP(true)
              setCountdown(120)
            }, 500)
            return 100
          }
          return newProgress
        })
      }, 800)
    }
    return () => clearInterval(timer)
  }, [step, progressPaiement])

  // Compte à rebours OTP
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0 && showOTP) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setPaiementError('Code expiré. Veuillez réessayer.')
            setShowOTP(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [countdown, showOTP])

  const formatMontant = (m: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(m)

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const parts = []
    for (let i = 0; i < v.length; i += 4) {
      parts.push(v.substring(i, i + 4))
    }
    return parts.slice(0, 4).join(' ')
  }

  const demarrerPaiement = () => {
    if (methode === 'mobile_money' && !numero) {
      setPaiementError('Veuillez entrer un numéro de téléphone')
      return
    }
    if (methode === 'carte' && (!numeroCarte || !dateExpiration || !cvv)) {
      setPaiementError('Veuillez remplir tous les champs de la carte')
      return
    }
    if (methode === 'virement' && !nomBanque) {
      setPaiementError('Veuillez sélectionner une banque')
      return
    }
    
    setPaiementError('')
    setStep('processing')
    setProgressPaiement(0)
  }

  const validerPaiement = () => {
    if (otpCode.length !== 6) {
      setPaiementError('Code invalide. Veuillez entrer les 6 chiffres.')
      return
    }
    
    // Appeler le callback avec les données de paiement
    onPaiementComplete({
      methode,
      operateur: methode === 'mobile_money' ? operateur : undefined,
      numero: methode === 'mobile_money' ? numero : methode === 'carte' ? numeroCarte : undefined,
      nom_banque: methode === 'virement' ? nomBanque : undefined,
      reference,
      date_paiement: new Date().toISOString()
    })
  }

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-yellow-900 mb-1">
          Paiement des Frais de Dossier
        </h3>
        <p className="text-xs text-yellow-700">
          Le paiement des frais de dossier est obligatoire pour finaliser votre demande
        </p>
      </div>

      {step === 'method' && (
        <div className="space-y-6">
          {/* Résumé du montant */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Montant à payer</span>
              <span className="text-xl font-bold text-gray-900">{formatMontant(montant)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Référence</span>
              <span className="font-mono text-xs text-gray-500">{reference}</span>
            </div>
          </div>

          {/* Choix méthode de paiement */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Choisissez votre méthode de paiement
            </label>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setMethode('mobile_money')}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  methode === 'mobile_money' 
                    ? 'border-primary bg-primary/5 shadow-sm' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Mobile Money</p>
                    <p className="text-xs text-gray-500">Orange, MTN, Airtel</p>
                  </div>
                  {methode === 'mobile_money' && (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  )}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMethode('carte')}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  methode === 'carte' 
                    ? 'border-primary bg-primary/5 shadow-sm' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Carte Bancaire</p>
                    <p className="text-xs text-gray-500">Visa, Mastercard</p>
                  </div>
                  {methode === 'carte' && (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  )}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMethode('virement')}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  methode === 'virement' 
                    ? 'border-primary bg-primary/5 shadow-sm' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Virement Bancaire</p>
                    <p className="text-xs text-gray-500">Toutes les banques partenaires</p>
                  </div>
                  {methode === 'virement' && (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  )}
                </div>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setStep('details')}
            className="w-full py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors"
          >
            Continuer
          </button>
        </div>
      )}

      {step === 'details' && (
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Montant à payer</p>
            <p className="text-3xl font-bold text-gray-900">{formatMontant(montant)}</p>
            <p className="text-xs text-gray-500 mt-1">Réf: {reference}</p>
          </div>

          {/* Formulaire Mobile Money */}
          {methode === 'mobile_money' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Opérateur</label>
                <div className="grid grid-cols-3 gap-2">
                  {operateurs.map(op => (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => setOperateur(op.id as typeof operateur)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        operateur === op.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full ${op.couleur} mx-auto mb-1 flex items-center justify-center`}>
                        <Smartphone className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-xs font-medium">{op.nom}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Numéro de téléphone
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Ex: 0812345678"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Vous recevrez une demande de confirmation sur votre téléphone
                </p>
              </div>
            </div>
          )}

          {/* Formulaire Carte Bancaire */}
          {methode === 'carte' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Numéro de carte
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={numeroCarte}
                    onChange={(e) => setNumeroCarte(formatCardNumber(e.target.value).slice(0, 19))}
                    placeholder="1234 5678 9012 3456"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Expiration
                  </label>
                  <input
                    type="text"
                    value={dateExpiration}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, '')
                      if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2, 4)
                      setDateExpiration(val.slice(0, 5))
                    }}
                    placeholder="MM/AA"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">CVV</label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    placeholder="123"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Formulaire Virement */}
          {methode === 'virement' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Votre banque
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {banques.map(banque => (
                  <button
                    key={banque}
                    type="button"
                    onClick={() => setNomBanque(banque)}
                    className={`p-3 rounded-xl border text-left text-sm transition-all ${
                      nomBanque === banque
                        ? 'border-primary bg-primary/5 font-medium'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Building2 className="h-4 w-4 inline mr-2 text-gray-400" />
                    {banque}
                  </button>
                ))}
              </div>
            </div>
          )}

          {paiementError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-xs text-red-700">{paiementError}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setStep('method')
                setPaiementError('')
              }}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm rounded-xl hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </button>
            <button
              type="button"
              onClick={demarrerPaiement}
              className="flex-1 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors"
            >
              Payer {formatMontant(montant)}
            </button>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-yellow-50 flex items-center justify-center mx-auto mb-4">
              <Banknote className="h-10 w-10 text-yellow-500 animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Paiement en cours</h3>
            <p className="text-sm text-gray-500 mb-4">
              {methode === 'mobile_money' 
                ? `Veuillez confirmer le paiement sur votre téléphone ${numero}`
                : 'Vérification de vos informations bancaires...'}
            </p>

            <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
              <div 
                className="bg-primary h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPaiement}%` }}
              />
            </div>
            <p className="text-xs text-gray-400">{Math.round(progressPaiement)}%</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-blue-700">Paiement sécurisé</p>
              <p className="text-xs text-blue-600 mt-0.5">
                Vos informations sont cryptées et protégées par le protocole SSL
              </p>
            </div>
          </div>
        </div>
      )}

      {step === 'confirmation' && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <QrCode className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Confirmez le paiement
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Un code de validation a été envoyé
            </p>
          </div>

          {showOTP ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code de validation
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-2xl tracking-[0.5em] font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">
                    Code valable {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCountdown(120)
                      setPaiementError('')
                    }}
                    disabled={countdown > 0}
                    className="text-xs text-primary hover:underline disabled:text-gray-400 disabled:no-underline"
                  >
                    Renvoyer le code
                  </button>
                </div>
              </div>

              {paiementError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="text-xs text-red-700">{paiementError}</p>
                </div>
              )}

              <button
                type="button"
                onClick={validerPaiement}
                disabled={submitting}
                className="w-full py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Validation...
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5" />
                    Valider le paiement
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="text-sm text-gray-500 mt-2">Envoi du code de validation...</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}