import nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

interface EmailTemplate {
  id: string;
  subject: string;
  html: string;
  text?: string;
}

interface TemplateOption {
  key: string;
  value: string;
}

/**
 * Load template file from templates directory
 */
const loadTemplate = (templateName: string, extension: 'html' | 'txt'): string => {
  try {
    const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.${extension}`);
    return fs.readFileSync(templatePath, 'utf-8');
  } catch (error) {
    console.error(`Error loading template ${templateName}.${extension}:`, error);
    throw new Error(`Failed to load template: ${templateName}.${extension}`);
  }
};

/**
 * Email templates configuration
 * Templates are loaded from external files in server/src/templates/
 */
const getEmailTemplates = (): EmailTemplate[] => {
  return [
    {
      id: 'verify-account',
      subject: 'Verify Your Account - Income & Expense Manager',
      html: loadTemplate('verify-account', 'html'),
      text: loadTemplate('verify-account', 'txt'),
    },
    {
      id: 'reset-password',
      subject: 'Reset Your Password - Income & Expense Manager',
      html: loadTemplate('reset-password', 'html'),
      text: loadTemplate('reset-password', 'txt'),
    },
  ];
};

// Email templates list (loaded from external files)
export const EMAIL_TEMPLATES: EmailTemplate[] = getEmailTemplates();

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Function 1: Send email
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param html - HTML content
 * @param text - Plain text content (optional)
 */
export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<void> => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML tags for text version
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
  } catch (error: unknown) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

/**
 * Function 2: Get template by ID, replace placeholders, and send email
 * @param templateId - Template ID from EMAIL_TEMPLATES
 * @param to - Recipient email address
 * @param options - Array of key-value pairs to replace in template
 */
export const sendTemplatedEmail = async (
  templateId: string,
  to: string,
  options: TemplateOption[]
): Promise<void> => {
  try {
    // Find template by ID
    const template = EMAIL_TEMPLATES.find((t) => t.id === templateId);

    if (!template) {
      throw new Error(`Template with ID "${templateId}" not found`);
    }

    // Replace placeholders in HTML
    let html = template.html;
    let text = template.text || '';

    options.forEach((option) => {
      const regex = new RegExp(`{{${option.key}}}`, 'g');
      html = html.replace(regex, option.value);
      text = text.replace(regex, option.value);
    });

    // Send email using function 1
    await sendEmail(to, template.subject, html, text);
  } catch (error: unknown) {
    console.error('Error sending templated email:', error);
    throw error;
  }
};
