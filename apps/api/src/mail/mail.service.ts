import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;

  constructor() {
    const apiKey = process.env['RESEND_API_KEY'] ?? '';
    this.resend = new Resend(apiKey);
    this.fromEmail = process.env['RESEND_FROM_EMAIL'] ?? 'noreply@clozesales.com';
  }

  async sendVerificationEmail(to: string, name: string, token: string): Promise<void> {
    const baseUrl = process.env['APP_BASE_URL'] ?? 'http://localhost:3000';
    const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

    try {
      await this.resend.emails.send({
        from: `Cloze <${this.fromEmail}>`,
        to,
        subject: 'Verify your email address',
        html: this.buildVerificationHtml(name, verifyUrl),
      });
      this.logger.log(`Verification email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${to}`, error);
      throw error;
    }
  }

  private buildVerificationHtml(name: string, verifyUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background-color:#111;border-radius:16px;border:1px solid rgba(255,255,255,0.06);overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 0;text-align:center;">
              <div style="font-size:24px;font-weight:700;color:#fff;letter-spacing:-0.02em;">Cloze</div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:24px 32px 32px;">
              <p style="color:#a3a3a3;font-size:15px;line-height:1.6;margin:0 0 8px;">
                Hi ${name},
              </p>
              <p style="color:#a3a3a3;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Welcome to Cloze! Please verify your email address to activate your account.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${verifyUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;font-size:14px;font-weight:600;text-decoration:none;border-radius:12px;">
                      Verify email address
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color:#525252;font-size:13px;line-height:1.5;margin:24px 0 0;">
                If you didn't create an account, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.04);">
              <p style="color:#404040;font-size:12px;margin:0;text-align:center;">
                Cloze &mdash; AI-powered sales coaching
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }
}
