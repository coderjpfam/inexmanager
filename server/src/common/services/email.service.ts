import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { logError, logInfo } from '../../config/winston.config';
import { EmailConfig } from '../../config/app.config';
import {
  EmailSendException,
  EmailTemplateException,
} from '../exceptions/app.exception';

interface TemplateOption {
  key: string;
  value: string;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private emailConfig: EmailConfig;
  private templateCache = new Map<string, { html: string; text: string }>();

  constructor(private configService: ConfigService) {
    this.emailConfig = this.configService.get<EmailConfig>('config.email')!;
    this.transporter = nodemailer.createTransport({
      host: this.emailConfig.host,
      port: this.emailConfig.port,
      secure: false,
      auth: {
        user: this.emailConfig.user,
        pass: this.emailConfig.pass,
      },
    });
  }

  /**
   * Load template file from templates directory (with caching)
   */
  private loadTemplate(templateName: string, extension: 'html' | 'txt'): string {
    const cacheKey = `${templateName}.${extension}`;

    // Check cache first
    if (extension === 'html' && this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName)!.html;
    }
    if (extension === 'txt' && this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName)!.text;
    }

    // Load from disk
    try {
      const templatePath = path.join(
        __dirname,
        '..',
        '..',
        'templates',
        `${templateName}.${extension}`,
      );
      const content = fs.readFileSync(templatePath, 'utf-8');

      // Cache both html and text if loading html
      if (extension === 'html') {
        const textPath = path.join(
          __dirname,
          '..',
          '..',
          'templates',
          `${templateName}.txt`,
        );
        const textContent = fs.existsSync(textPath)
          ? fs.readFileSync(textPath, 'utf-8')
          : '';
        this.templateCache.set(templateName, {
          html: content,
          text: textContent,
        });
      }

      return content;
    } catch (error) {
      logError(`Error loading template ${templateName}.${extension}`, error);
      throw new EmailTemplateException(
        `Failed to load template: ${templateName}.${extension}`,
      );
    }
  }

  /**
   * Send email
   */
  async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string,
  ): Promise<void> {
    try {
      const mailOptions = {
        from: this.emailConfig.from || this.emailConfig.user,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''),
      };

      await this.transporter.sendMail(mailOptions);
      logInfo(`Email sent successfully to ${to}`);
    } catch (error: unknown) {
      logError('Error sending email', error);
      throw new EmailSendException('Failed to send email');
    }
  }

  /**
   * Get template by ID, replace placeholders, and send email
   */
  async sendTemplatedEmail(
    templateId: string,
    to: string,
    options: TemplateOption[],
  ): Promise<void> {
    try {
      let html: string;
      let text: string;

      if (templateId === 'verify-account') {
        html = this.loadTemplate('verify-account', 'html');
        text = this.loadTemplate('verify-account', 'txt');
      } else if (templateId === 'reset-password') {
        html = this.loadTemplate('reset-password', 'html');
        text = this.loadTemplate('reset-password', 'txt');
      } else {
        throw new EmailTemplateException(
          `Template with ID "${templateId}" not found`,
        );
      }

      // Replace placeholders
      options.forEach((option) => {
        const regex = new RegExp(`{{${option.key}}}`, 'g');
        html = html.replace(regex, option.value);
        text = text.replace(regex, option.value);
      });

      // Get subject based on template
      const subject =
        templateId === 'verify-account'
          ? 'Verify Your Account - Income & Expense Manager'
          : 'Reset Your Password - Income & Expense Manager';

      await this.sendEmail(to, subject, html, text);
    } catch (error: unknown) {
      logError('Error sending templated email', error);
      throw error;
    }
  }
}
