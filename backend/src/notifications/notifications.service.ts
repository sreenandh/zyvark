import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
    private emailTransporter: nodemailer.Transporter;

    constructor() {
        // Configure SMTP transporter (Gmail, SendGrid, or any SMTP)
        const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
        const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
        const smtpUser = process.env.SMTP_USER || '';
        const smtpPass = process.env.SMTP_PASS || '';

        if (smtpUser && smtpPass) {
            this.emailTransporter = nodemailer.createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: smtpPort === 465,
                auth: { user: smtpUser, pass: smtpPass },
            });
            console.log(`📧 Email service configured (${smtpHost}:${smtpPort})`);
        } else {
            console.log('⚠️  SMTP not configured — emails will be logged to console only');
            console.log('   Set SMTP_USER and SMTP_PASS in .env to enable real emails');
        }
    }

    async sendPush(deviceToken: string, title: string, body: string, data?: any) {
        console.log(`📤 Push Notification → ${title}: ${body}`);
        return { sent: true, title, body };
    }

    async sendSms(phone: string, message: string) {
        // TODO: Integrate Twilio for real SMS
        console.log(`📱 SMS to ${phone}: ${message}`);
        return { sent: true, phone, message };
    }

    async sendEmail(to: string, subject: string, htmlBody: string) {
        if (this.emailTransporter) {
            try {
                const fromName = process.env.SMTP_FROM_NAME || 'RescueNow';
                const fromEmail = process.env.SMTP_USER;
                await this.emailTransporter.sendMail({
                    from: `"${fromName}" <${fromEmail}>`,
                    to,
                    subject,
                    html: htmlBody,
                });
                console.log(`📧 ✅ Email SENT to ${to}: ${subject}`);
                return { sent: true, to, subject };
            } catch (err) {
                console.error(`📧 ❌ Email FAILED to ${to}:`, err.message || err);
                return { sent: false, to, error: err.message };
            }
        } else {
            console.log(`📧 [STUB] Email to ${to}: ${subject}`);
            console.log(`   (Set SMTP_USER & SMTP_PASS in .env to send real emails)`);
            return { sent: false, to, reason: 'SMTP not configured' };
        }
    }

    // ── New account created ──
    async sendWelcomeNewUser(phone: string, name: string, email?: string) {
        await this.sendSms(
            phone,
            `🎉 Hi ${name}, thank you for joining RescueNow! Your account has been created. Stay safe!`,
        );

        if (email) {
            await this.sendEmail(email, '🎉 Thank You for Joining RescueNow!', `
                <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#0F1923;border-radius:16px;overflow:hidden;">
                    <div style="background:linear-gradient(135deg,#ef4444,#f97316);padding:40px 30px;text-align:center;">
                        <h1 style="color:#fff;margin:0;font-size:28px;">🚨 RescueNow</h1>
                        <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Emergency Help, One Tap Away</p>
                    </div>
                    <div style="padding:30px;">
                        <h2 style="color:#fff;margin:0 0 16px;">Welcome aboard, ${name}! 🎉</h2>
                        <p style="color:#9ca3af;line-height:1.7;margin:0 0 20px;">
                            Thank you for creating your RescueNow account. You're now part of a community that ensures help is always one tap away.
                        </p>
                        <div style="background:#1a2332;border-radius:12px;padding:20px;margin:0 0 20px;">
                            <p style="color:#fff;margin:0 0 12px;font-weight:600;">Here's what you can do:</p>
                            <p style="color:#9ca3af;margin:0;">✅ Request emergency assistance 24/7</p>
                            <p style="color:#9ca3af;margin:4px 0;">✅ Track responders in real-time</p>
                            <p style="color:#9ca3af;margin:4px 0;">✅ Rate and review your experience</p>
                        </div>
                        <p style="color:#6b7280;font-size:13px;margin:0;">Stay safe!</p>
                        <p style="color:#6b7280;font-size:13px;margin:4px 0 0;">— Team RescueNow 🚨</p>
                    </div>
                </div>
            `);
        }

        return { type: 'new_user', name, phone, email };
    }

    // ── Existing user signed in ──
    async sendWelcomeBack(phone: string, name: string, email?: string) {
        await this.sendSms(
            phone,
            `👋 Welcome back, ${name}! You've signed in to RescueNow. Stay safe!`,
        );

        if (email) {
            await this.sendEmail(email, '👋 Welcome Back to RescueNow!', `
                <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#0F1923;border-radius:16px;overflow:hidden;">
                    <div style="background:linear-gradient(135deg,#3b82f6,#06b6d4);padding:40px 30px;text-align:center;">
                        <h1 style="color:#fff;margin:0;font-size:28px;">🚨 RescueNow</h1>
                        <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Emergency Help, One Tap Away</p>
                    </div>
                    <div style="padding:30px;">
                        <h2 style="color:#fff;margin:0 0 16px;">Welcome back, ${name}! 👋</h2>
                        <p style="color:#9ca3af;line-height:1.7;margin:0 0 20px;">
                            You've successfully signed in to your RescueNow account. We're glad to see you again!
                        </p>
                        <div style="background:#1a2332;border-radius:12px;padding:20px;margin:0 0 20px;">
                            <p style="color:#9ca3af;margin:0;">Remember, help is always just one tap away. Stay safe out there! 💪</p>
                        </div>
                        <p style="color:#6b7280;font-size:13px;margin:0;">— Team RescueNow 🚨</p>
                    </div>
                </div>
            `);
        }

        return { type: 'welcome_back', name, phone, email };
    }

    async notifyProviders(providerIds: string[], title: string, body: string) {
        console.log(`📤 Notifying ${providerIds.length} providers: ${title}`);
        return { notified: providerIds.length };
    }
}
