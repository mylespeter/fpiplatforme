// lib/email.ts
import nodemailer from 'nodemailer'

// Log la configuration au démarrage
console.log('📧 Configuration email:', {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || '587',
  user: process.env.SMTP_USER ? `${process.env.SMTP_USER.substring(0, 5)}...` : 'NON DÉFINI',
  pass: process.env.SMTP_PASS ? '***défini***' : 'NON DÉFINI'
})

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  logger: true,
  debug: true,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000
})

// Vérifier la connexion au démarrage
transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ Erreur de connexion SMTP:', error)
  } else {
    console.log('✅ Serveur SMTP prêt à envoyer des emails')
  }
})

export async function sendVerificationCode(to: string, code: string, username: string) {
  console.log('📧 ========== ENVOI CODE DE VÉRIFICATION ==========')
  console.log('📧 À:', to)
  console.log('📧 Utilisateur:', username)
  console.log('📧 Code:', code)
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; }
          .code-box { background: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; border: 2px dashed #667eea; }
          .code-box span { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏗️ FPI Platform</h1>
            <p>Vérification de votre compte Promoteur</p>
          </div>
          <div class="content">
            <h2>Bonjour ${username} !</h2>
            <p>Voici votre code de vérification pour finaliser votre inscription :</p>
            
            <div class="code-box">
              <span>${code}</span>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important :</strong>
              <ul>
                <li>Ce code expire dans <strong>15 minutes</strong></li>
                <li>Ne partagez ce code avec personne</li>
              </ul>
            </div>
            
            <p>Cordialement,<br><strong>L'équipe FPI Platform</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} FPI Platform. Tous droits réservés.</p>
          </div>
        </div>
      </body>
    </html>
  `

  try {
    const info = await transporter.sendMail({
      from: `"FPI Platform" <${process.env.SMTP_USER}>`,
      to,
      subject: 'Code de vérification - FPI Platform',
      html
    })
    
    console.log('✅ Email envoyé avec succès!')
    console.log('✅ Message ID:', info.messageId)
    return { success: true, messageId: info.messageId }
    
  } catch (error: any) {
    console.error('❌ Erreur envoi email:', error.message)
    return { success: false, error: error.message }
  }
}