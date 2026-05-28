import nodemailer from 'nodemailer';
import { BlogComment } from './comments';
import { generateReviewToken } from './comment-token';

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    tls: { rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false' },
  });
}

export async function sendCommentNotification(comment: BlogComment): Promise<void> {
  const siteUrl = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const notifyEmail = process.env.COMMENT_NOTIFY_EMAIL || process.env.CONTACT_EMAIL;
  if (!notifyEmail) return;

  const approveToken = generateReviewToken(comment.id, 'approve');
  const rejectToken  = generateReviewToken(comment.id, 'reject');

  const approveUrl = `${siteUrl}/api/admin/comments/${comment.id}/review/?token=${approveToken}`;
  const rejectUrl  = `${siteUrl}/api/admin/comments/${comment.id}/review/?token=${rejectToken}`;

  const safeName    = escapeHtml(comment.authorName);
  const safeContent = escapeHtml(comment.content);
  const safeSlug    = escapeHtml(comment.postSlug);
  const postUrl     = `${siteUrl}/blog/${comment.postSlug}`;

  await getTransporter().sendMail({
    from: `"Portfolio" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: notifyEmail,
    subject: `[Portfolio] Nouveau commentaire de ${comment.authorName}`,
    text: [
      `Nouveau commentaire sur : ${postUrl}`,
      `Auteur : ${comment.authorName}`,
      comment.authorEmail ? `Email : ${comment.authorEmail}` : '',
      ``,
      comment.content,
      ``,
      `✓ Approuver : ${approveUrl}`,
      `✗ Rejeter   : ${rejectUrl}`,
    ].filter(Boolean).join('\n'),
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1e3a5f;color:white;padding:20px 24px;border-radius:8px 8px 0 0">
          <h2 style="margin:0">Nouveau commentaire</h2>
          <p style="margin:6px 0 0;opacity:.8;font-size:14px">
            sur <a href="${postUrl}" style="color:#93c5fd">/blog/${safeSlug}</a>
          </p>
        </div>
        <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
          <p style="margin:0 0 4px"><strong>${safeName}</strong>${comment.authorEmail ? ` &lt;${escapeHtml(comment.authorEmail)}&gt;` : ''}</p>
          <blockquote style="border-left:3px solid #e5e7eb;margin:12px 0;padding:8px 16px;color:#374151;white-space:pre-wrap">${safeContent}</blockquote>
          <div style="margin-top:24px;display:flex;gap:12px">
            <a href="${approveUrl}" style="background:#16a34a;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">✓ Approuver</a>
            <a href="${rejectUrl}"  style="background:#dc2626;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">✗ Rejeter</a>
          </div>
          <p style="margin-top:16px;font-size:12px;color:#9ca3af">Ces liens expirent dans 7 jours.</p>
        </div>
      </div>
    `,
  });
}
