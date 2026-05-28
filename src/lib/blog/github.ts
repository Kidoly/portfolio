const GITHUB_TOKEN  = process.env.GITHUB_TOKEN  || '';
const GITHUB_REPO   = process.env.GITHUB_REPO   || ''; // e.g. "kidoly/portfolio"
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

export function isGitHubSyncEnabled() {
  return !!(GITHUB_TOKEN && GITHUB_REPO);
}

async function getFileSha(apiUrl: string): Promise<string | undefined> {
  const res = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
    },
  });
  if (!res.ok) return undefined;
  const data = await res.json();
  return data.sha as string;
}

interface GitHubAuthor { name: string; email: string }

export async function commitFile(opts: {
  path: string;
  content: string;
  message: string;
  author: GitHubAuthor;
}): Promise<boolean> {
  if (!isGitHubSyncEnabled()) return false;
  const [owner, repo] = GITHUB_REPO.split('/');
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${opts.path}`;

  try {
    const sha = await getFileSha(apiUrl);
    const res = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: opts.message,
        content: Buffer.from(opts.content).toString('base64'),
        branch: GITHUB_BRANCH,
        sha,
        committer: opts.author,
      }),
    });
    if (!res.ok) console.error('[github] commitFile failed:', await res.text());
    return res.ok;
  } catch (err) {
    console.error('[github] commitFile error:', err);
    return false;
  }
}

export async function deleteFile(opts: {
  path: string;
  message: string;
  author: GitHubAuthor;
}): Promise<boolean> {
  if (!isGitHubSyncEnabled()) return false;
  const [owner, repo] = GITHUB_REPO.split('/');
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${opts.path}`;

  try {
    const sha = await getFileSha(apiUrl);
    if (!sha) return false;

    const res = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: opts.message,
        sha,
        branch: GITHUB_BRANCH,
        committer: opts.author,
      }),
    });
    if (!res.ok) console.error('[github] deleteFile failed:', await res.text());
    return res.ok;
  } catch (err) {
    console.error('[github] deleteFile error:', err);
    return false;
  }
}
