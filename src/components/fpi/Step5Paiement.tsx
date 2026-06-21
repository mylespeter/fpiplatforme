'use client'

import { useState } from 'react'
import { 
  CreditCard, Smartphone, Building2, CheckCircle, 
  AlertCircle, Loader2, ArrowLeft, Shield
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
  operateur?: 'orange' | 'mpesa' | 'airtel'
  numero?: string
  nom_banque?: string
  reference: string
  date_paiement: string
}

const operateurs = [
  { id: 'orange', nom: 'Orange Money' },
  { id: 'mpesa', nom: 'M-Pesa' },
  { id: 'airtel', nom: 'Airtel Money' }
]

const banques = [
  'Rawbank', 'BCDC', 'TMB', 'Equity BCDC', 'UBA'
]

export default function Step5Paiement({ 
  montant = FRAIS_DOSSIER, 
  reference,
  onRetour,
  onPaiementComplete,
  submitting
}: Props) {
  const [step, setStep] = useState<'method' | 'details' | 'processing'>('method')
  const [methode, setMethode] = useState<'mobile_money' | 'carte' | 'virement'>('mobile_money')
  const [operateur, setOperateur] = useState<'orange' | 'mpesa' | 'airtel'>('orange')
  const [numero, setNumero] = useState('')
  const [numeroCarte, setNumeroCarte] = useState('')
  const [dateExpiration, setDateExpiration] = useState('')
  const [cvv, setCvv] = useState('')
  const [nomBanque, setNomBanque] = useState('')
  const [paiementError, setPaiementError] = useState('')

  const formatMontant = (m: number) => 
    new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'USD', 
      maximumFractionDigits: 0 
    }).format(m)

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
    
    // Simulation rapide du traitement (2 secondes)
    setTimeout(() => {
      onPaiementComplete({
        methode,
        operateur: methode === 'mobile_money' ? operateur : undefined,
        numero: methode === 'mobile_money' ? numero : methode === 'carte' ? numeroCarte : undefined,
        nom_banque: methode === 'virement' ? nomBanque : undefined,
        reference,
        date_paiement: new Date().toISOString()
      })
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* Bannière info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
        <h3 className="text-sm font-semibold text-yellow-900 mb-1">
          Paiement des Frais de Dossier
        </h3>
        <p className="text-xs text-yellow-700">
          Le paiement des frais de dossier est obligatoire pour finaliser votre demande
        </p>
      </div>

      {/* Étape 1: Choix méthode */}
      {step === 'method' && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Montant à payer</span>
              <span className="text-xl font-bold text-gray-900">{formatMontant(montant)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Choisissez votre méthode de paiement
            </label>
            
            {[
              { id: 'mobile_money', icon: Smartphone, label: 'Mobile Money', desc: 'Orange, MTN, Airtel' },
              { id: 'carte', icon: CreditCard, label: 'Carte Bancaire', desc: 'Visa, Mastercard' },
              { id: 'virement', icon: Building2, label: 'Virement Bancaire', desc: 'Banques partenaires' }
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethode(m.id as typeof methode)}
                className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                  methode === m.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <m.icon className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{m.label}</p>
                    <p className="text-xs text-gray-500">{m.desc}</p>
                  </div>
                  {methode === m.id && <CheckCircle className="h-5 w-5 text-primary" />}
                </div>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setStep('details')}
            className="w-full py-2.5 bg-primary text-white font-medium rounded-xl"
          >
            Continuer
          </button>
        </div>
      )}

      {/* Étape 2: Détails */}
      {step === 'details' && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Montant à payer</p>
            <p className="text-2xl font-bold">{formatMontant(montant)}</p>
          </div>

          {methode === 'mobile_money' && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {operateurs.map(op => (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => setOperateur(op.id as typeof operateur)}
                    className={`p-2 rounded-xl border text-xs font-medium ${
                      operateur === op.id ? 'border-primary bg-primary/5' : 'border-gray-200'
                    }`}
                  >
                    {op.nom}
                  </button>
                ))}
              </div>
              <input
                type="tel"
                value={numero}
                onChange={(e) => setNumero(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Ex: 0812345678"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
              />
            </div>
          )}

          {methode === 'carte' && (
            <div className="space-y-3">
              <input
                type="text"
                value={numeroCarte}
                onChange={(e) => setNumeroCarte(formatCardNumber(e.target.value).slice(0, 19))}
                placeholder="1234 5678 9012 3456"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={dateExpiration}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '')
                    if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2, 4)
                    setDateExpiration(val.slice(0, 5))
                  }}
                  placeholder="MM/AA"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
                />
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  placeholder="CVV"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
                />
              </div>
            </div>
          )}

          {methode === 'virement' && (
            <div className="grid grid-cols-2 gap-2">
              {banques.map(banque => (
                <button
                  key={banque}
                  type="button"
                  onClick={() => setNomBanque(banque)}
                  className={`p-2 rounded-xl border text-xs ${
                    nomBanque === banque ? 'border-primary bg-primary/5' : 'border-gray-200'
                  }`}
                >
                  {banque}
                </button>
              ))}
            </div>
          )}

          {paiementError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-2 flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 text-red-500" />
              {paiementError}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setStep('method'); setPaiementError('') }}
              className="flex items-center gap-1 px-3 py-2 border text-sm rounded-xl"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </button>
            <button
              type="button"
              onClick={demarrerPaiement}
              className="flex-1 py-2 bg-primary text-white text-sm font-medium rounded-xl"
            >
              Payer {formatMontant(montant)}
            </button>
          </div>
        </div>
      )}

      {/* Étape 3: Traitement */}
      {step === 'processing' && (
        <div className="text-center space-y-4 py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">Paiement en cours</h3>
            <p className="text-sm text-gray-500 mt-1">
              {methode === 'mobile_money' 
                ? `Veuillez confirmer sur votre téléphone ${numero}`
                : 'Vérification de vos informations bancaires...'}
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-500" />
            <p className="text-xs text-blue-700">Paiement sécurisé - SSL</p>
          </div>
        </div>
      )}
    </div>
  )
}