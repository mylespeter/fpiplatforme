// src/app/api/send-decision-email/route.ts
import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Configuration du transporteur (côté serveur uniquement)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

function formatMontant(montant: number): string {
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'USD', 
    maximumFractionDigits: 0 
  }).format(montant)
}

// Template email approbation
function getApprobationEmail(nomPromoteur: string, nomProjet: string, montantApprouve: number, commentaireComite?: string, conditions?: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; }
          .success-box { background: #ecfdf5; border-left: 4px solid #059669; padding: 20px; margin: 20px 0; border-radius: 4px; }
          .amount-box { background: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; border: 2px solid #059669; }
          .amount-box span { font-size: 28px; font-weight: bold; color: #059669; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0; }
          .conditions-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .next-steps { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Félicitations !</h1>
            <p>Votre projet a été approuvé</p>
          </div>
          <div class="content">
            <h2>Bonjour ${nomPromoteur} !</h2>
            
            <div class="success-box">
              <p><strong>✅ Bonne nouvelle !</strong> Le comité de crédit a approuvé votre projet <strong>"${nomProjet}"</strong>.</p>
            </div>
            
            <div class="amount-box">
              <p style="color: #666; margin-bottom: 5px;">Montant approuvé</p>
              <span>${formatMontant(montantApprouve)}</span>
            </div>

            ${conditions ? `
            <div class="conditions-box">
              <strong>⚠️ Conditions à remplir :</strong>
              <p>${conditions}</p>
            </div>
            ` : ''}

            ${commentaireComite ? `
            <div class="info-box">
              <strong>💬 Commentaire du comité :</strong>
              <p>${commentaireComite}</p>
            </div>
            ` : ''}

            <div class="next-steps">
              <strong>📋 Prochaines étapes :</strong>
              <ul>
                <li>Un chargé de clientèle vous contactera dans les prochains jours</li>
                <li>Préparez les documents complémentaires si nécessaire</li>
                <li>Connectez-vous à votre espace promoteur pour suivre l'avancement</li>
              </ul>
            </div>
            
            <p>Cordialement,<br><strong>L'équipe FPI Platform</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} FPI Platform. Tous droits réservés.</p>
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

// Template email rejet
function getRejetEmail(nomPromoteur: string, nomProjet: string, commentaireComite?: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; }
          .reject-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 4px; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .encouragement-box { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Décision du comité</h1>
            <p>Concernant votre projet</p>
          </div>
          <div class="content">
            <h2>Bonjour ${nomPromoteur},</h2>
            
            <div class="reject-box">
              <p><strong>Après examen approfondi, le comité de crédit n'a malheureusement pas retenu votre projet <em>"${nomProjet}"</em>.</strong></p>
            </div>

            ${commentaireComite ? `
            <div class="info-box">
              <strong>💬 Motif de la décision :</strong>
              <p>${commentaireComite}</p>
            </div>
            ` : ''}

            <div class="encouragement-box">
              <strong>💪 Ne vous découragez pas !</strong>
              <p>Cette décision ne remet pas en cause la qualité de votre projet. Nous vous encourageons à :</p>
              <ul>
                <li>Prendre en compte les commentaires du comité</li>
                <li>Retravailler certains aspects de votre dossier</li>
                <li>Nous soumettre un nouveau projet ultérieurement</li>
              </ul>
            </div>
            
            <p>Nous restons à votre disposition pour toute question.</p>
            <p>Cordialement,<br><strong>L'équipe FPI Platform</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} FPI Platform. Tous droits réservés.</p>
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

// Template email ajournement
function getAjournementEmail(nomPromoteur: string, nomProjet: string, commentaireComite?: string, conditions?: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; }
          .postpone-box { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 4px; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0; }
          .conditions-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .steps-box { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏸️ Projet ajourné</h1>
            <p>Décision du comité de crédit</p>
          </div>
          <div class="content">
            <h2>Bonjour ${nomPromoteur},</h2>
            
            <div class="postpone-box">
              <p><strong>Le comité de crédit a décidé d'ajourner la décision concernant votre projet <em>"${nomProjet}"</em>.</strong></p>
              <p>Cela signifie que votre dossier nécessite des compléments avant qu'une décision finale puisse être prise.</p>
            </div>

            ${conditions ? `
            <div class="conditions-box">
              <strong>⚠️ Éléments à fournir ou conditions à remplir :</strong>
              <p>${conditions}</p>
            </div>
            ` : ''}

            ${commentaireComite ? `
            <div class="info-box">
              <strong>💬 Commentaire du comité :</strong>
              <p>${commentaireComite}</p>
            </div>
            ` : ''}

            <div class="steps-box">
              <strong>📋 Prochaines étapes :</strong>
              <ul>
                <li>Prenez connaissance des conditions demandées</li>
                <li>Rassemblez les documents ou informations complémentaires</li>
                <li>Contactez votre chargé de clientèle pour soumettre les compléments</li>
                <li>Votre dossier sera réexaminé dès que les conditions seront remplies</li>
              </ul>
            </div>
            
            <p>Nous restons à votre disposition pour vous accompagner dans ces démarches.</p>
            <p>Cordialement,<br><strong>L'équipe FPI Platform</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} FPI Platform. Tous droits réservés.</p>
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      decision, 
      email, 
      nomPromoteur, 
      nomProjet, 
      montantApprouve, 
      commentaireComite, 
      conditions 
    } = body

    if (!email || !nomPromoteur || !nomProjet || !decision) {
      return NextResponse.json(
        { success: false, error: 'Données manquantes' },
        { status: 400 }
      )
    }

    let subject = ''
    let html = ''

    switch (decision) {
      case 'favorable':
        subject = `✅ Projet approuvé : ${nomProjet}`
        html = getApprobationEmail(nomPromoteur, nomProjet, montantApprouve || 0, commentaireComite, conditions)
        break
      case 'defavorable':
        subject = `📋 Décision concernant votre projet : ${nomProjet}`
        html = getRejetEmail(nomPromoteur, nomProjet, commentaireComite)
        break
      case 'reserve':
        subject = `⏸️ Projet ajourné : ${nomProjet}`
        html = getAjournementEmail(nomPromoteur, nomProjet, commentaireComite, conditions)
        break
      default:
        return NextResponse.json(
          { success: false, error: 'Décision invalide' },
          { status: 400 }
        )
    }

    const info = await transporter.sendMail({
      from: `"FPI Platform" <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      html
    })

    console.log('✅ Email envoyé avec succès:', info.messageId)

    return NextResponse.json({ 
      success: true, 
      messageId: info.messageId 
    })

  } catch (error: any) {
    console.error('❌ Erreur envoi email:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}