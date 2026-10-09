import { Request, Response, NextFunction } from 'express';

import EmailService from '../../services/email/email.service';
import logger from '../../utils/logger';

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  language?: 'en' | 'nl';
}

// Submit contact form
const submitContactForm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, phone, subject, message, language = 'en' } = req.body as ContactFormData;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      res.status(400).json({
        success: false,
        message: language === 'nl' 
          ? 'Vul alle verplichte velden in' 
          : 'Please fill in all required fields',
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: language === 'nl' 
          ? 'Ongeldig e-mailadres' 
          : 'Invalid email address',
      });
      return;
    }

    // Send email to admin
    const emailResult = await EmailService.sendContactFormEmail({
      name,
      email,
      phone,
      subject,
      message,
      language,
    });

    if (!emailResult.ok) {
      logger.error(`Contact form email delivery failed. provider=${emailResult.provider} error=${emailResult.error || 'unknown'}`);
      res.status(502).json({
        success: false,
        message: language === 'nl'
          ? 'Uw bericht kon niet worden verzonden. Probeer het opnieuw.'
          : 'We could not send your message right now. Please try again.',
      });
      return;
    }

    logger.info(`Contact form submitted by ${name} (${email})`);

    res.status(200).json({
      success: true,
      message: language === 'nl' 
        ? 'Uw bericht is succesvol verzonden. We nemen zo snel mogelijk contact met u op.' 
        : 'Your message has been sent successfully. We will contact you as soon as possible.',
    });
  } catch (error) {
    logger.error('Contact form submission failed:', error);
    next(error);
  }
};

const ContactController = {
  submitContactForm,
};

export default ContactController;
