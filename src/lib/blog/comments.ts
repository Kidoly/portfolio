import fs from 'fs';
import path from 'path';

export type CommentStatus = 'pending' | 'approved' | 'rejected';

export interface BlogComment {
  id: string;
  postSlug: string;
  authorName: string;
  authorEmail?: string;
  content: string;
  status: CommentStatus;
  createdAt: string;
  updatedAt: string;
  ip?: string;
}

const COMMENTS_DIR = path.join(process.cwd(), 'content', 'comments');
const COMMENTS_FILE = path.join(COMMENTS_DIR, 'comments.json');

function ensureStorage() {
  if (!fs.existsSync(COMMENTS_DIR)) {
    fs.mkdirSync(COMMENTS_DIR, { recursive: true });
  }

  if (!fs.existsSync(COMMENTS_FILE)) {
    fs.writeFileSync(COMMENTS_FILE, '[]', 'utf-8');
  }
}

function readAll(): BlogComment[] {
  ensureStorage();
  const raw = fs.readFileSync(COMMENTS_FILE, 'utf-8');

  try {
    const parsed = JSON.parse(raw) as BlogComment[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(comments: BlogComment[]) {
  ensureStorage();
  fs.writeFileSync(COMMENTS_FILE, JSON.stringify(comments, null, 2), 'utf-8');
}

export function generateCommentId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getAllComments(): BlogComment[] {
  return readAll().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getCommentsByPost(
  postSlug: string,
  status: CommentStatus | 'all' = 'approved'
): BlogComment[] {
  return getAllComments().filter((comment) => {
    if (comment.postSlug !== postSlug) return false;
    if (status === 'all') return true;
    return comment.status === status;
  });
}

export function saveComment(comment: BlogComment): BlogComment {
  const comments = readAll();
  comments.push(comment);
  writeAll(comments);
  return comment;
}

export function updateComment(
  id: string,
  updates: Partial<Pick<BlogComment, 'status' | 'content' | 'authorName'>>
): BlogComment | null {
  const comments = readAll();
  const index = comments.findIndex((c) => c.id === id);
  if (index === -1) return null;

  const current = comments[index];
  const updated: BlogComment = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  comments[index] = updated;
  writeAll(comments);
  return updated;
}

export function deleteComment(id: string): boolean {
  const comments = readAll();
  const next = comments.filter((c) => c.id !== id);
  if (next.length === comments.length) return false;

  writeAll(next);
  return true;
}
