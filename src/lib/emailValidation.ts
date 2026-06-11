// lib/emailValidation.ts
import { validate } from 'deep-email-validator'

export async function checkEmailExists(email: string): Promise<{
  exists: boolean;
  message: string;
}> {
  try {
    const result = await validate({
      email: email,
      validateRegex: true,
      validateMx: true,      // Vérifie les enregistrements MX
      validateTypo: false,
      validateDisposable: true, // Bloque les emails jetables
      validateSMTP: false,   // Mettre true pour vérifier SMTP (plus lent)
    })

    if (!result.valid) {
      return {
        exists: false,
        message: result.reason || 'Email invalide'
      }
    }

    return {
      exists: true,
      message: 'Email valide'
    }
  } catch (error) {
    return {
      exists: false,
      message: 'Impossible de vérifier l\'email'
    }
  }
}