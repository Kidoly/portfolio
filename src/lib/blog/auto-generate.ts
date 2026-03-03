/**
 * Auto-generate blog metadata from markdown content.
 *
 * Two modes:
 * 1. Local analysis (always available) — regex-based extraction of tags, summary, category
 * 2. AI-powered (optional) — uses OpenAI API if OPENAI_API_KEY is configured
 */

// ─── Known tech terms dictionary ───────────────────────────────────────────
const TECH_TERMS: Record<string, string[]> = {
  // Virtualisation & Cloud
  proxmox: ['proxmox'],
  docker: ['docker', 'dockerfile', 'docker-compose'],
  kubernetes: ['kubernetes', 'k8s', 'kubectl', 'helm'],
  terraform: ['terraform', 'opentofu', 'tofu'],
  ansible: ['ansible', 'playbook'],
  vagrant: ['vagrant'],
  vmware: ['vmware', 'esxi', 'vsphere'],
  'cloud-init': ['cloud-init', 'cloudinit'],
  aws: ['aws', 'amazon', 'ec2', 's3', 'lambda'],
  azure: ['azure'],
  gcp: ['gcp', 'google cloud'],

  // OS & Systèmes
  linux: ['linux', 'gnu/linux'],
  debian: ['debian'],
  ubuntu: ['ubuntu'],
  centos: ['centos', 'rhel', 'rocky'],
  'windows-server': ['windows server', 'active directory'],
  nginx: ['nginx'],
  apache: ['apache', 'httpd'],

  // Réseaux
  vlan: ['vlan'],
  dns: ['dns', 'bind', 'dnsmasq'],
  dhcp: ['dhcp'],
  vpn: ['vpn', 'wireguard', 'openvpn', 'ipsec'],
  firewall: ['firewall', 'iptables', 'nftables', 'pfsense', 'opnsense'],
  'load-balancing': ['load balanc', 'haproxy', 'traefik'],
  ssh: ['ssh'],
  ssl: ['ssl', 'tls', 'certificat', 'letsencrypt', 'certbot'],

  // Développement
  python: ['python', 'pip', 'django', 'flask', 'fastapi'],
  rust: ['rust', 'cargo', 'rustc'],
  javascript: ['javascript', 'node.js', 'nodejs', 'npm', 'deno', 'bun'],
  typescript: ['typescript', 'tsx'],
  react: ['react', 'next.js', 'nextjs'],
  php: ['php', 'symfony', 'laravel', 'composer'],
  'c#': ['c#', 'csharp', '.net', 'dotnet', 'asp.net'],
  go: ['golang', ' go '],
  java: ['java', 'spring', 'maven', 'gradle'],

  // DevOps & CI/CD
  git: ['git', 'github', 'gitlab'],
  'ci-cd': ['ci/cd', 'pipeline', 'github actions', 'gitlab-ci'],

  // Base de données
  postgresql: ['postgresql', 'postgres', 'psql'],
  mysql: ['mysql', 'mariadb'],
  mongodb: ['mongodb', 'mongo'],
  redis: ['redis'],

  // Sécurité
  cybersecurite: ['cybersécurité', 'cybersecurity', 'pentest', 'penetration'],
  monitoring: ['monitoring', 'grafana', 'prometheus', 'zabbix', 'nagios'],
  backup: ['backup', 'sauvegarde', 'rsync', 'borg'],

  // Outils
  'qemu-kvm': ['qemu', 'kvm', 'libvirt', 'virt-'],
  lxc: ['lxc', 'lxd'],
  powershell: ['powershell'],
  bash: ['bash', 'shell', 'zsh'],
};

// ─── Category mapping ──────────────────────────────────────────────────────
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Virtualisation': ['proxmox', 'vmware', 'vm ', 'virtual', 'hyperviseur', 'template', 'clone', 'qemu', 'kvm'],
  'Conteneurisation': ['docker', 'container', 'conteneur', 'kubernetes', 'k8s', 'pod'],
  'Réseaux': ['vlan', 'dns', 'dhcp', 'vpn', 'firewall', 'routage', 'switch', 'réseau', 'network', 'bridge', 'subnet'],
  'Cybersécurité': ['sécurité', 'security', 'pentest', 'vulnerability', 'exploit', 'cve', 'cryptage', 'chiffrement'],
  'DevOps': ['ci/cd', 'pipeline', 'deploy', 'terraform', 'ansible', 'automation', 'infrastructure as code'],
  'Développement': ['api', 'framework', 'application', 'développement', 'code', 'programmation', 'react', 'next.js'],
  'Administration Système': ['serveur', 'server', 'admin', 'configuration', 'installation', 'linux', 'windows server', 'active directory'],
  'Cloud': ['aws', 'azure', 'gcp', 'cloud', 's3', 'lambda'],
  'Base de données': ['database', 'base de données', 'sql', 'postgresql', 'mysql', 'mongodb', 'redis'],
  'Monitoring': ['monitoring', 'grafana', 'prometheus', 'zabbix', 'alerting', 'log'],
};

// ─── Local analysis functions ──────────────────────────────────────────────

function normalizeForSearch(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function extractTags(content: string, title: string): string[] {
  const searchText = normalizeForSearch(`${title} ${content}`);
  const foundTags: Set<string> = new Set();

  for (const [tag, keywords] of Object.entries(TECH_TERMS)) {
    for (const keyword of keywords) {
      if (searchText.includes(normalizeForSearch(keyword))) {
        foundTags.add(tag);
        break;
      }
    }
  }

  // Also extract from code block languages (```bash, ```python, etc.)
  const codeBlockLangs = content.match(/```(\w+)/g);
  if (codeBlockLangs) {
    for (const match of codeBlockLangs) {
      const lang = match.replace('```', '').toLowerCase();
      if (['bash', 'shell', 'sh', 'zsh'].includes(lang)) {
        foundTags.add('bash');
      } else if (['py', 'python'].includes(lang)) {
        foundTags.add('python');
      } else if (['js', 'javascript'].includes(lang)) {
        foundTags.add('javascript');
      } else if (['ts', 'typescript'].includes(lang)) {
        foundTags.add('typescript');
      } else if (['yaml', 'yml'].includes(lang)) {
        foundTags.add('yaml');
      } else if (['json'].includes(lang)) {
        foundTags.add('json');
      } else if (['sql'].includes(lang)) {
        foundTags.add('sql');
      } else if (['dockerfile'].includes(lang)) {
        foundTags.add('docker');
      } else if (['powershell', 'ps1'].includes(lang)) {
        foundTags.add('powershell');
      }
    }
  }

  return Array.from(foundTags).slice(0, 8); // Max 8 tags
}

export function extractCategory(content: string, title: string): string {
  const searchText = normalizeForSearch(`${title} ${content}`);
  const scores: Record<string, number> = {};

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    scores[category] = 0;
    for (const keyword of keywords) {
      const normalizedKeyword = normalizeForSearch(keyword);
      // Count occurrences
      const regex = new RegExp(normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = searchText.match(regex);
      if (matches) {
        scores[category] += matches.length;
      }
    }
  }

  // Return the category with the highest score
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return sorted[0] && sorted[0][1] > 0 ? sorted[0][0] : 'General';
}

export function extractDescription(content: string, maxLength = 155): string {
  // Find the first meaningful paragraph (not a heading, not code, not empty)
  const lines = content.split('\n');
  let description = '';

  let inCodeBlock = false;
  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;
    if (line.startsWith('#')) continue;
    if (line.startsWith('>')) continue;
    if (line.startsWith('---')) continue;
    if (line.startsWith('![')) continue;
    if (line.trim().startsWith('{.is-')) continue;
    if (line.trim().startsWith('<')) continue;

    const cleaned = line
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();

    if (cleaned.length > 20) {
      description = cleaned;
      break;
    }
  }

  if (!description) {
    // Fallback: use the first heading content
    const firstHeading = content.match(/^#+\s+(.+)$/m);
    if (firstHeading) {
      description = firstHeading[1];
    }
  }

  if (description.length > maxLength) {
    description = description.substring(0, maxLength - 3).replace(/\s+\S*$/, '') + '...';
  }

  return description;
}

export function generateSeoTitle(title: string): string {
  // Clean emojis and keep it under 60 chars
  const cleaned = title.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim();
  const suffix = ' | Alban Mary';
  if (cleaned.length + suffix.length <= 60) {
    return cleaned + suffix;
  }
  return cleaned.substring(0, 60 - suffix.length - 3) + '...' + suffix;
}

export function generateSeoDescription(content: string, title: string): string {
  // Create a search-engine-optimized description
  const desc = extractDescription(content, 155);
  if (desc) return desc;
  // Fallback
  const cleanTitle = title.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim();
  return `Guide complet : ${cleanTitle}. Tutoriel détaillé avec exemples pratiques.`;
}

export interface GeneratedMetadata {
  description: string;
  tags: string[];
  category: string;
  seoTitle: string;
  seoDescription: string;
  source: 'local' | 'ai';
}

/**
 * Local content analysis — always works, no API key needed.
 */
export function analyzeContentLocally(content: string, title: string): GeneratedMetadata {
  return {
    description: extractDescription(content),
    tags: extractTags(content, title),
    category: extractCategory(content, title),
    seoTitle: generateSeoTitle(title),
    seoDescription: generateSeoDescription(content, title),
    source: 'local',
  };
}

/**
 * AI-powered analysis via OpenAI — much better results.
 * Falls back to local analysis if AI is unavailable.
 */
export async function analyzeContentWithAI(
  content: string,
  title: string,
  locale: string = 'fr'
): Promise<GeneratedMetadata> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return analyzeContentLocally(content, title);
  }

  try {
    const prompt = `Tu es un expert SEO et blogging technique. Analyse cet article de blog technique et génère les métadonnées optimisées pour le SEO.

Titre de l'article : "${title}"

Contenu (Markdown) :
${content.substring(0, 4000)}

Réponds UNIQUEMENT en JSON valide avec cette structure exacte :
{
  "description": "Résumé de l'article en 1-2 phrases, max 155 caractères, optimisé pour le SEO. En ${locale === 'fr' ? 'français' : 'anglais'}.",
  "tags": ["tag1", "tag2", "tag3", "...max 8 tags techniques pertinents en lowercase"],
  "category": "Une catégorie parmi: Virtualisation, Conteneurisation, Réseaux, Cybersécurité, DevOps, Développement, Administration Système, Cloud, Base de données, Monitoring, ou General",
  "seoTitle": "Titre SEO optimisé max 60 caractères avec le mot-clé principal. En ${locale === 'fr' ? 'français' : 'anglais'}.",
  "seoDescription": "Meta description SEO max 155 caractères, engageante et contenant les mots-clés. En ${locale === 'fr' ? 'français' : 'anglais'}."
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Tu es un assistant qui génère des métadonnées SEO pour des articles techniques. Réponds uniquement en JSON valide.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.statusText);
      return analyzeContentLocally(content, title);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim();

    if (!text) {
      return analyzeContentLocally(content, title);
    }

    // Parse JSON (handle potential markdown code block wrapping)
    const jsonStr = text.replace(/^```json?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
    const parsed = JSON.parse(jsonStr);

    return {
      description: parsed.description || extractDescription(content),
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 8).map((t: string) => t.toLowerCase()) : extractTags(content, title),
      category: parsed.category || extractCategory(content, title),
      seoTitle: parsed.seoTitle || generateSeoTitle(title),
      seoDescription: parsed.seoDescription || generateSeoDescription(content, title),
      source: 'ai',
    };
  } catch (error) {
    console.error('AI analysis failed, falling back to local:', error);
    return analyzeContentLocally(content, title);
  }
}
