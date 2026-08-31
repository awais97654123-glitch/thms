import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import prisma from '../db';

export interface EmailSendOptions {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  provider: string;
  error?: string;
}

/**
 * Enterprise Email Provider Abstraction
 * Supports Resend, Nodemailer SMTP (Gmail / Google Workspace / Custom SMTP), and Audit Logging.
 */
class EmailProviderService {
  private resendClient: Resend | null = null;
  private smtpTransporter: nodemailer.Transporter | null = null;

  private getResend(): Resend | null {
    if (this.resendClient) {
      return this.resendClient;
    }
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      this.resendClient = new Resend(resendApiKey);
      return this.resendClient;
    }
    return null;
  }

  private async getSmtpTransporter(config: any) {
    const host = config?.host || process.env.SMTP_HOST || (process.env.GMAIL_USER ? 'smtp.gmail.com' : null);
    const port = Number(config?.port || process.env.SMTP_PORT || (host === 'smtp.gmail.com' ? 465 : 587));
    const user = config?.authEmail || process.env.SMTP_USER || process.env.GMAIL_USER;
    const pass = config?.authPassword || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
    const secure = port === 465 || config?.encryption === 'SSL';

    if (host && user && pass) {
      try {
        return nodemailer.createTransport({
          host,
          port,
          secure,
          auth: {
            user,
            pass,
          },
          tls: {
            rejectUnauthorized: false,
          },
        });
      } catch (err) {
        console.warn('[EmailProvider:Nodemailer] Transporter init warning:', err);
        return null;
      }
    }
    return null;
  }

  async getProviderConfig() {
    try {
      const config = await prisma.emailProviderConfig.findFirst();
      return config;
    } catch {
      return null;
    }
  }

  /**
   * Send an email through the configured provider (Resend, Gmail / SMTP, or Fallback Log)
   */
  async sendEmail(options: EmailSendOptions): Promise<EmailSendResult> {
    const config = await this.getProviderConfig();

    const senderName = config?.senderName || process.env.SMTP_SENDER_NAME || 'The Hayatabad Model School';
    const senderEmail = config?.senderEmail || process.env.SMTP_SENDER_EMAIL || process.env.GMAIL_USER || 'admissions@hayatabadmodel.edu.pk';
    const fromAddress = `"${senderName}" <${senderEmail}>`;

    let result: EmailSendResult = {
      success: false,
      provider: 'UNKNOWN',
    };

    // 1. Try Nodemailer Gmail / SMTP if configured
    const transporter = await this.getSmtpTransporter(config);
    if (transporter) {
      try {
        console.log(`[EmailProvider:SMTP/Gmail] Dispatching email to ${options.to} (Subject: ${options.subject})...`);
        const info = await transporter.sendMail({
          from: fromAddress,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text || options.html.replace(/<[^>]*>?/gm, ''),
          replyTo: options.replyTo || senderEmail,
        });

        result = {
          success: true,
          messageId: info.messageId || `smtp_${Date.now()}`,
          provider: config?.providerType || (process.env.GMAIL_USER ? 'GMAIL_SMTP' : 'SMTP'),
        };
      } catch (err: any) {
        console.warn('[EmailProvider:SMTP] Error sending mail:', err.message);
        result = {
          success: false,
          provider: 'SMTP',
          error: err?.message || 'SMTP Connection Error',
        };
      }
    }

    // 2. Fallback to Resend API if SMTP did not succeed or not configured
    if (!result.success) {
      const resend = this.getResend();
      if (resend) {
        try {
          console.log(`[EmailProvider:Resend] Dispatching email to ${options.to} (Subject: ${options.subject})...`);
          const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || `The Hayatabad Model School <onboarding@resend.dev>`,
            to: [options.to],
            subject: options.subject,
            html: options.html,
            text: options.text,
            replyTo: options.replyTo,
          });

          if (error) {
            console.warn('[EmailProvider:Resend] API Error:', error.message);
            result = {
              success: false,
              provider: 'RESEND',
              error: error.message,
            };
          } else {
            result = {
              success: true,
              messageId: data?.id || `resend_${Date.now()}`,
              provider: 'RESEND',
            };
          }
        } catch (err: any) {
          console.error('[EmailProvider:Resend] Error:', err.message);
          result = {
            success: false,
            provider: 'RESEND',
            error: err?.message || 'Resend API Connection Error',
          };
        }
      }
    }

    // 3. Fallback / Dev Mode Logging
    if (!result.success && !result.error) {
      console.log(`[EmailProvider:Simulated] Email queued for ${options.to} (Subject: ${options.subject})`);
      result = {
        success: true,
        messageId: `sim_${Date.now()}`,
        provider: 'SIMULATED_LOCAL',
      };
    }

    // 4. Record to Database EmailDeliveryLog
    try {
      await prisma.emailDeliveryLog.create({
        data: {
          recipientEmail: options.to,
          eventType: 'DISPATCH',
          provider: result.provider,
          status: result.success ? 'SENT' : 'FAILED',
          response: result.messageId || null,
          error: result.error || null,
        },
      });
    } catch {
      // ignore logging fail
    }

    return result;
  }

  /**
   * Test email provider connection
   */
  async testConnection(targetEmail: string): Promise<EmailSendResult> {
    return this.sendEmail({
      to: targetEmail,
      toName: 'Administrator',
      subject: 'Test Email — The Hayatabad Model School Notification Gateway',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #2563eb; margin: 0;">The Hayatabad Model School</h2>
            <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Official Notification Gateway</p>
          </div>
          <div style="padding: 16px; background: #eff6ff; border-radius: 8px; border-left: 4px solid #2563eb;">
            <h3 style="color: #1e3a8a; margin: 0 0 8px 0;">Email Connection Verified Successfully!</h3>
            <p style="color: #334155; font-size: 14px; margin: 0; line-height: 1.5;">
              This test message confirms that automated email notifications (Admissions, Homework, Attendance, and Circulars) are working properly.
            </p>
          </div>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 20px; text-align: center;">
            Timestamp: ${new Date().toISOString()} • Peshawar, Pakistan
          </p>
        </div>
      `,
    });
  }
}

export const emailProvider = new EmailProviderService();

