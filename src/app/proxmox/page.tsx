import type { CSSProperties } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import BlogNav from '@/components/blog/BlogNav';
import LegalLinks from '@/components/legal/LegalLinks';
import RevealObserver from '@/components/motion/RevealObserver';
import { getPostSummary, getPostsByTag } from '@/lib/blog/posts';
import { formatPostDate } from '@/lib/blog/format';
import { CONTACT_EMAIL } from '@/config/legal';

const PAGE_URL = 'https://albanmary.com/proxmox';
const TITLE = 'Ingénieur Proxmox VE à Nantes : cluster, Ceph, HA';
const DESCRIPTION =
  'Alban Mary, ingénieur systèmes et réseaux à Nantes : Proxmox VE en cluster haute disponibilité, Ceph, SDN, sauvegardes PBS, templates Cloud-Init et Terraform.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: `${TITLE} - Alban Mary`,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'profile',
    siteName: 'Alban Mary',
    locale: 'fr_FR',
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, creator: '@kidoly' },
};

export const dynamic = 'force-dynamic';

const CONTAINER = 'mx-auto w-full max-w-[1280px] px-6 lg:px-14';

const SKILLS = [
  {
    title: 'Cluster & haute disponibilité',
    text: 'Clusters Proxmox à plusieurs nœuds : quorum, groupes HA et bascule automatique des VM, stockage distribué Ceph.',
  },
  {
    title: 'Réseau',
    text: 'SDN Proxmox (zones VXLAN / EVPN, VNets), pare-feu OPNsense virtualisés et tunnels IPsec entre sites.',
  },
  {
    title: 'Sauvegarde & PRA',
    text: 'Proxmox Backup Server, réplication des VM critiques vers un site de secours, plan de bascule avec objectifs RPO / RTO.',
  },
  {
    title: 'Automatisation',
    text: 'Templates Debian 13 Cloud-Init, VM déployées avec Terraform / OpenTofu, configuration avec Ansible.',
  },
];

const FIELD = [
  {
    where: 'Epsight',
    when: 'Alternance, depuis 2024',
    text: 'Environ 500 VM hébergées sur deux datacenters, sous Proxmox VE avec Ceph étendu entre les sites et sous VMware : support N2/N3, Infrastructure as Code et portail de PRA Veeam.',
  },
  {
    where: 'Homelab',
    when: 'Auto-hébergé',
    text: 'Administré seul : cluster Proxmox VE de 3 nœuds avec Ceph sur 10 GbE, Proxmox Backup Server, pare-feu OPNsense, GitLab CI/CD et Ansible.',
  },
  {
    where: 'Projet multi-sites',
    when: 'EPSI Nantes',
    text: 'En équipe de 3 : architecture d’une quinzaine de VM sur un cluster Proxmox 3 nœuds (Ceph, SDN, HA), reliée en IPsec à trois autres sites, avec PRA.',
  },
];

export default function ProxmoxPage() {
  const posts = getPostsByTag('proxmox').map(getPostSummary);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${PAGE_URL}/#webpage`,
    url: PAGE_URL,
    name: TITLE,
    description: DESCRIPTION,
    inLanguage: 'fr',
    isPartOf: { '@type': 'WebSite', '@id': 'https://albanmary.com/#website' },
    mainEntity: { '@id': 'https://albanmary.com/#person' },
    about: {
      '@type': 'SoftwareApplication',
      name: 'Proxmox Virtual Environment',
      applicationCategory: 'Virtualisation',
      url: 'https://www.proxmox.com/en/products/proxmox-virtual-environment/overview',
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://albanmary.com' },
        { '@type': 'ListItem', position: 2, name: 'Proxmox', item: PAGE_URL },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <main className="bg-[#f3f1ec] text-[#141414] font-sans min-h-screen">
        <RevealObserver />
        {/* Dark hero */}
        <div className="bg-[#0e100f] text-[#e4e7e4] pb-16 lg:pb-20">
          <BlogNav articlesActive={false} />
          <div className={CONTAINER}>
            <div className="grid lg:grid-cols-12 gap-x-5 gap-y-8 pt-10 lg:pt-16 items-end">
              <div className="lg:col-span-8 flex flex-col gap-5">
                <span className="font-mono text-[13px] text-[#7d8580] typing" style={{ '--steps': 14 } as CSSProperties}>
                  $ pvecm status
                </span>
                <h1
                  className="m-0 font-extrabold leading-[0.86] tracking-[-0.055em]"
                  style={{ fontSize: 'clamp(56px, 13vw, 168px)' }}
                >
                  Proxmox
                  <br />
                  VE<span className="text-[var(--accent-on-dark)] cursor-blink">.</span>
                </h1>
              </div>
              <p className="lg:col-span-4 m-0 text-[18px] leading-[1.55] text-[#9aa19c]">
                Ingénieur systèmes &amp; réseaux en alternance chez Epsight, je monte et j’exploite des
                infrastructures virtualisées sous Proxmox VE, à Nantes.
              </p>
            </div>
            <p
              className="m-0 pt-10 lg:pt-14 font-medium tracking-[-0.015em] max-w-[900px]"
              style={{ fontSize: 'clamp(26px, 4vw, 38px)', lineHeight: 1.12 }}
            >
              Administration et ingénierie Proxmox : cluster haute disponibilité, Ceph, SDN, sauvegardes et
              déploiements automatisés.
            </p>
          </div>
        </div>

        <div className={CONTAINER}>
          {/* (01) What I do */}
          <section className="grid lg:grid-cols-12 gap-5 pt-20 lg:pt-[88px]">
            <h2 className="m-0 font-plex text-[13px] font-normal lg:col-span-3">(01) Ce que je fais</h2>
            <div className="lg:col-span-9 flex flex-col gap-10">
              {SKILLS.map((s) => (
                <div key={s.title} data-reveal className="grid md:grid-cols-[260px_1fr] gap-5 border-t border-[#c9c5bd] pt-5">
                  <h3 className="m-0 text-[28px] font-bold tracking-[-0.02em] leading-[1.1]">{s.title}</h3>
                  <p className="m-0 text-[19px] leading-[1.5] text-[#4a4a48]">{s.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* (02) Where */}
          <section className="grid lg:grid-cols-12 gap-5 pt-24 lg:pt-28">
            <h2 className="m-0 font-plex text-[13px] font-normal lg:col-span-3">(02) Sur le terrain</h2>
            <div className="lg:col-span-9 flex flex-col border-b-2 border-[#141414]">
              {FIELD.map((f) => (
                <div key={f.where} data-reveal className="border-t-2 border-[#141414] pt-6 pb-8 grid md:grid-cols-[minmax(0,1fr)_180px] gap-5">
                  <div className="flex flex-col gap-3">
                    <h3 className="m-0 text-[32px] font-extrabold tracking-[-0.025em] leading-[1.05]">{f.where}</h3>
                    <p className="m-0 text-[17px] leading-[1.55] text-[#4a4a48] max-w-[620px]">{f.text}</p>
                  </div>
                  <span className="md:text-right font-plex text-[13px] text-[var(--accent)]">{f.when}</span>
                </div>
              ))}
            </div>
          </section>

          {/* (03) Articles */}
          {posts.length > 0 && (
            <section className="grid lg:grid-cols-12 gap-5 pt-24 lg:pt-28">
              <h2 className="m-0 font-plex text-[13px] font-normal lg:col-span-3">(03) Articles Proxmox</h2>
              <div className="lg:col-span-9 flex flex-col border-b-2 border-[#141414]">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}/`}
                    data-reveal
                    className="group grid grid-cols-1 sm:grid-cols-[130px_minmax(0,1fr)_110px] gap-x-6 gap-y-3 items-start py-7 -mx-5 px-5 border-t-2 border-[#141414] hover:bg-[#e9e6df] hover:no-underline transition-colors"
                  >
                    <span className="font-plex text-[12px] text-[#68655f] pt-1.5">
                      {formatPostDate(post.publishedAt || post.updatedAt)}
                    </span>
                    <div className="flex flex-col gap-2.5">
                      <h3 className="m-0 text-[24px] font-bold tracking-[-0.02em] leading-[1.15]">{post.title}</h3>
                      <span className="text-[16px] leading-[1.55] text-[#4a4a48] max-w-[620px]">{post.description}</span>
                    </div>
                    <span className="sm:justify-self-end pt-1.5 font-bold text-[15px] whitespace-nowrap border-b-2 border-[var(--accent)] pb-0.5 self-start">
                      Lire <span className="inline-block motion-safe:transition-transform motion-safe:group-hover:translate-x-1">→</span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* (04) Contact */}
          <section className="grid lg:grid-cols-12 gap-5 pt-24 lg:pt-28 pb-20">
            <h2 className="m-0 font-plex text-[13px] font-normal lg:col-span-3">(04) Contact</h2>
            <div data-reveal className="lg:col-span-9 flex flex-col gap-6">
              <p className="m-0 text-[28px] leading-[1.25] font-medium tracking-[-0.015em] max-w-[760px]">
                Un poste, une alternance ou un projet autour de Proxmox ? Écrivez-moi, je réponds sous 48 h.
              </p>
              <div className="flex flex-wrap gap-x-8 gap-y-4 items-center">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-[22px] font-bold border-b-[3px] border-[var(--accent)] hover:no-underline break-all"
                >
                  {CONTACT_EMAIL}
                </a>
                <a href="/#contact" className="font-bold border-b-2 border-[#141414] pb-0.5 hover:no-underline">
                  Formulaire de contact →
                </a>
              </div>
            </div>
          </section>
        </div>

        <div className={CONTAINER}>
          <footer className="py-6 border-t border-[#c9c5bd] text-[13px] flex flex-wrap justify-between gap-x-5 gap-y-2">
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <span>© 2026 Alban Mary</span>
              <LegalLinks />
            </div>
            <div className="flex gap-5">
              <a href="https://github.com/Kidoly" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1">
                GitHub <ArrowUpRight className="w-3.5 h-3.5" aria-hidden />
              </a>
              <a href="https://www.linkedin.com/in/alban-mary/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1">
                LinkedIn <ArrowUpRight className="w-3.5 h-3.5" aria-hidden />
              </a>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}
