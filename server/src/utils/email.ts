import nodemailer from 'nodemailer';

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

// Email templates list
export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'verify-account',
    subject: 'Verify Your Account - Income & Expense Manager',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Account</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2563EB 0%, #10B981 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Income & Expense Manager</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #2563EB;">Verify Your Account</h2>
          <p>Hello {{name}},</p>
          <p>Thank you for signing up! Please verify your account by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{verifyLink}}" style="background: #2563EB; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Account</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #2563EB;">{{verifyLink}}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 12px;">© ${new Date().getFullYear()} Income & Expense Manager. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
    text: `Hello {{name}},\n\nThank you for signing up! Please verify your account by visiting: {{verifyLink}}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, please ignore this email.`,
  },
  {
    id: 'reset-password',
    subject: 'Reset Your Password - Income & Expense Manager',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2563EB 0%, #10B981 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Income & Expense Manager</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #2563EB;">Reset Your Password</h2>
          <p>Hello {{name}},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{resetLink}}" style="background: #2563EB; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #2563EB;">{{resetLink}}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 12px;">© ${new Date().getFullYear()} Income & Expense Manager. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
    text: `Hello {{name}},\n\nWe received a request to reset your password. Visit this link to reset: {{resetLink}}\n\nThis link will expire in 1 hour.\n\nIf you didn't request a password reset, please ignore this email.`,
  },
];

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
  } catch (error) {
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
  } catch (error) {
    console.error('Error sending templated email:', error);
    throw error;
  }
};
