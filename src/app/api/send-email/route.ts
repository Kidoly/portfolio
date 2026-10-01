import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { cleanText, createRateLimiter, EMAIL_RE, getClientIp, readJsonBody } from '@/lib/security/request-guard';

const perIpLimit = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 3 }); // 3 messages / 15 min per IP
const globalLimit = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 30 }); // 30 sent messages / hour overall

function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false',
  },
});

const TOO_MANY = { error: 'Trop de requêtes. Veuillez patienter avant d\'envoyer un nouveau message.' };

export async function POST(request: NextRequest) {
  try {
    const body = await readJsonBody(request, 16 * 1024);
    if ('error' in body) return body.error;
    const { data } = body;

    // Honeypot field for bots: pretend success, send nothing
    if (data.website) {
      return NextResponse.json({ success: true, message: 'Email envoyé avec succès.' });
    }

    if (!perIpLimit(getClientIp(request))) {
      return NextResponse.json(TOO_MANY, { status: 429 });
    }

    if (data.consent !== true) {
      return NextResponse.json(
        { error: 'Merci d\'accepter l\'utilisation de vos données pour répondre à votre demande.' },
        { status: 400 }
      );
    }

    // Validation: strings only, bounded lengths, single-line fields for headers
    const name = cleanText(data.name, 100, { singleLine: true });
    const email = cleanText(data.email, 254, { singleLine: true });
    const subject = cleanText(data.subject, 150, { singleLine: true });
    const message = cleanText(data.message, 5000);
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis (nom ≤ 100, sujet ≤ 150, message ≤ 5000 caractères).' },
        { status: 400 }
      );
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: 'Adresse email invalide.' },
        { status: 400 }
      );
    }

    if (!globalLimit('contact')) {
      return NextResponse.json(TOO_MANY, { status: 429 });
    }

    // Sanitization against HTML injection in email clients
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);

    const SMTP_FROM = process.env.SMTP_FROM || process.env.SMTP_USER;
    const CONTACT_EMAIL = process.env.CONTACT_EMAIL || process.env.SMTP_USER;

    // Send main email to you
    await transporter.sendMail({
      from: `"Portfolio Contact" <${SMTP_FROM}>`,
      to: CONTACT_EMAIL,
      replyTo: email,
      subject: `[Portfolio] ${subject}`,
      text: `Nouveau message de ${name} (${email}):\n\n${message}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1e3a5f; color: white; padding: 20px 24px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">Nouveau message - Portfolio</h2>
          </div>
          <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="margin: 0 0 8px;"><strong>De :</strong> ${safeName}</p>
            <p style="margin: 0 0 8px;"><strong>Email :</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
            <p style="margin: 0 0 16px;"><strong>Sujet :</strong> ${safeSubject}</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
            <div style="white-space: pre-wrap; color: #374151;">${safeMessage}</div>
          </div>
        </div>
      `,
    });

    // Confirmation to the visitor. It carries no visitor-supplied text, so the
    // form cannot be used to send arbitrary content to a third-party address.
    try {
      await transporter.sendMail({
        from: `"Alban Mary" <${SMTP_FROM}>`,
        to: email,
        subject: 'Merci pour votre message !',
        text: `Bonjour,\n\nMerci pour votre message. Je vous répondrai dans les plus brefs délais.\n\nCordialement,\nAlban Mary\nhttps://albanmary.com`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1e3a5f; color: white; padding: 20px 24px; border-radius: 8px 8px 0 0;">
              <h2 style="margin: 0;">Merci pour votre message !</h2>
            </div>
            <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              <p>Bonjour,</p>
              <p>J&apos;ai bien reçu votre message et je vous répondrai dans les plus brefs délais.</p>
              <p style="margin-top: 24px;">Cordialement,<br/><strong>Alban Mary</strong></p>
              <p style="margin-top: 16px;"><a href="https://albanmary.com" style="color: #2563eb;">albanmary.com</a></p>
            </div>
          </div>
        `,
      });
    } catch {
      // Confirmation is nice-to-have, don't fail the whole request
      console.warn('Failed to send confirmation email');
    }

    return NextResponse.json({ success: true, message: 'Email envoyé avec succès.' });
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de l'email. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
