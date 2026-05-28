import { NextRequest, NextResponse } from 'next/server';
import { verifyReviewToken } from '@/lib/blog/comment-token';
import { updateComment, getCommentsByPost, getAllComments } from '@/lib/blog/comments';

const siteUrl = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

function page(title: string, body: string) {
  return new NextResponse(
    `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${title}</title>
    <style>body{font-family:sans-serif;max-width:480px;margin:80px auto;padding:0 16px;text-align:center}
    h2{margin-bottom:8px}a{color:#2563eb}</style></head>
    <body>${body}</body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = new URL(request.url).searchParams.get('token');

  if (!token) {
    return page('Lien invalide', '<h2>❌ Lien invalide</h2><p>Token manquant.</p>');
  }

  const verified = verifyReviewToken(token);
  if (!verified) {
    return page('Lien expiré', '<h2>⏰ Lien expiré ou invalide</h2><p>Ce lien a expiré (7 jours) ou est incorrect.<br>Connecte-toi à <a href="' + siteUrl + '/admin/comments">l\'admin</a> pour modérer.</p>');
  }

  if (verified.commentId !== id) {
    return page('Lien invalide', '<h2>❌ Lien invalide</h2>');
  }

  const status = verified.action === 'approve' ? 'approved' : 'rejected';
  const comment = updateComment(id, { status });

  if (!comment) {
    return page('Introuvable', '<h2>❌ Commentaire introuvable</h2><p>Il a peut-être déjà été supprimé.</p>');
  }

  const verb = verified.action === 'approve' ? 'approuvé' : 'rejeté';
  const color = verified.action === 'approve' ? '#16a34a' : '#dc2626';
  const icon  = verified.action === 'approve' ? '✓' : '✗';

  return page(
    `Commentaire ${verb}`,
    `<h2 style="color:${color}">${icon} Commentaire ${verb}</h2>
     <p>Le commentaire de <strong>${comment.authorName}</strong> sur <em>${comment.postSlug}</em> a été ${verb}.</p>
     <p><a href="${siteUrl}/admin/comments">Gérer tous les commentaires →</a></p>`
  );
}
