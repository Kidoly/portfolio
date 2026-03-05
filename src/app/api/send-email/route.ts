import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Adresse email invalide.' },
        { status: 400 }
      );
    }

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
            <h2 style="margin: 0;">Nouveau message — Portfolio</h2>
          </div>
          <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="margin: 0 0 8px;"><strong>De :</strong> ${name}</p>
            <p style="margin: 0 0 8px;"><strong>Email :</strong> <a href="mailto:${email}">${email}</a></p>
            <p style="margin: 0 0 16px;"><strong>Sujet :</strong> ${subject}</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
            <div style="white-space: pre-wrap; color: #374151;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          </div>
        </div>
      `,
    });

    // Send confirmation email to the visitor
    try {
      await transporter.sendMail({
        from: `"Alban Mary" <${SMTP_FROM}>`,
        to: email,
        subject: 'Merci pour votre message !',
        text: `Bonjour ${name},\n\nMerci pour votre message. Je vous répondrai dans les plus brefs délais.\n\nCordialement,\nAlban Mary\nhttps://albanmary.com`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1e3a5f; color: white; padding: 20px 24px; border-radius: 8px 8px 0 0;">
              <h2 style="margin: 0;">Merci pour votre message !</h2>
            </div>
            <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              <p>Bonjour ${name},</p>
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