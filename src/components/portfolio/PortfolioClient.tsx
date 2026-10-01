'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { useLanguage, useLocalizedDocument } from '@/contexts/LanguageContext';
import { formatPostDate } from '@/lib/blog/format';
import { PORTRAIT_SRC, PROJECT_IMAGES } from '@/config/profile';

export interface BlogPreview {
  title: string;
  url: string;
  /** ISO date, formatted in the visitor's language */
  date: string;
  cat: string;
}

/* ---------- shared bits ---------- */

function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1280px] px-6 lg:px-14 ${className}`}>{children}</div>;
}

function Label({ n, children, dark = false }: { n: string; children: ReactNode; dark?: boolean }) {
  return (
    <div className="font-plex text-[13px] lg:col-span-3">
      <span className={dark ? 'text-[#6c736e]' : undefined}>({n})</span>{' '}
      <span className={dark ? 'text-[#e4e7e4]' : undefined}>{children}</span>
    </div>
  );
}

/* ---------- header + hero (dark) ---------- */

function Hero({ age }: { age: number | null }) {
  const { dict, language, setLanguage } = useLanguage();
  const p = dict.portfolio;
  const other = language === 'fr' ? 'EN' : 'FR';
  const facts = age === null ? p.facts : [...p.facts, { k: p.age.k, v: p.age.v.replace('{n}', String(age)) }];

  return (
    <div className="bg-[#0e100f] text-[#e4e7e4] pb-16 lg:pb-24">
      <Container>
        <header className="grid grid-cols-2 lg:grid-cols-12 gap-5 items-center py-7 text-sm font-medium">
          <span className="lg:col-span-3 text-base font-semibold">
            Alban Mary<span className="text-[var(--accent)]">.</span>
          </span>
          <nav className="hidden lg:flex lg:col-span-7 gap-7">
            {p.nav.map((n, i) => (
              <a key={n} href={`#${p.navAnchors[i]}`} className="hover:text-white hover:no-underline transition-colors">
                {n}
              </a>
            ))}
          </nav>
          <button
            onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
            className="lg:col-span-2 justify-self-end border-b-2 border-[#e4e7e4] pb-0.5 font-bold cursor-pointer"
            aria-label={p.langSwitch}
          >
            {other}
          </button>
        </header>

        <div className="grid lg:grid-cols-12 gap-x-5 gap-y-10 pt-10 lg:pt-16 items-start">
          <div className="lg:col-span-8 flex flex-col gap-8 lg:gap-14">
            <h1
              className="m-0 font-extrabold leading-[0.84] tracking-[-0.055em]"
              style={{ fontSize: 'clamp(72px, 15vw, 208px)' }}
            >
              Alban<br />Mary<span className="text-[var(--accent)]">.</span>
            </h1>
            <div className="flex flex-col gap-6 max-w-[620px]">
              <p className="m-0 font-medium tracking-[-0.015em]" style={{ fontSize: 'clamp(26px, 4vw, 38px)', lineHeight: 1.12 }}>
                {p.hero.role}
              </p>
              <p className="m-0 text-[18px] leading-[1.55] text-[#9aa19c] max-w-[560px]">{p.hero.pitch}</p>
              <div className="flex flex-wrap gap-3 items-center text-[15px] font-bold pt-1">
                <a href="#projects" className="bg-[#e4e7e4] text-[#0e100f] rounded-full px-6 py-3.5 hover:bg-[var(--accent)] hover:text-[#e4e7e4] hover:no-underline transition-colors">
                  {p.hero.cta1} ↓
                </a>
                <a href="/Alban_Mary_CV.pdf" className="border-2 border-[#e4e7e4] rounded-full px-5 py-3 hover:no-underline hover:bg-[#e4e7e4] hover:text-[#0e100f] transition-colors">
                  {p.hero.cta2}
                </a>
                <a href="/blog/" className="px-2.5 py-3 border-b-2 border-[var(--accent)] hover:no-underline">
                  {p.hero.cta3}
                </a>
              </div>
            </div>
          </div>

          {/* whoami card */}
          <div className="lg:col-span-4 lg:mt-3 bg-[#161917] text-[#e4e7e4] border border-[#2c322e] font-mono text-[13px] shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
            <div className="flex justify-between px-4 py-2.5 border-b border-[#232825] text-[#6c736e]">
              <span>{p.whoamiTitle}</span>
              <span>
                <span className="text-[var(--ok)]">●</span> {p.online}
              </span>
            </div>
            {PORTRAIT_SRC && (
              <div className="relative h-[180px] mx-4 mt-4 mb-1 overflow-hidden">
                <Image src={PORTRAIT_SRC} alt={p.portrait} fill priority sizes="(min-width: 1024px) 380px, 100vw" className="object-cover" />
              </div>
            )}
            <div className="px-4 pt-3 pb-4 flex flex-col gap-2.5">
              {facts.map((f) => (
                <div key={f.k} className="grid grid-cols-[100px_1fr] gap-3">
                  <span className="text-[#6c736e]">{f.k}</span>
                  <span>{f.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

/* ---------- stats ---------- */

function Stats() {
  const { dict } = useLanguage();
  return (
    <Container className="mt-20 lg:mt-[88px]">
      <div className="grid grid-cols-2 lg:grid-cols-4 border-t-2 border-[#141414]">
        {dict.portfolio.stats.map((s) => (
          <div key={s.l} className="pt-5 pr-5 flex flex-col gap-1">
            <span className="font-extrabold tracking-[-0.04em]" style={{ fontSize: 'clamp(40px, 5vw, 56px)' }}>
              {s.v}
            </span>
            <span className="text-sm text-[#4a4a48]">{s.l}</span>
          </div>
        ))}
      </div>
    </Container>
  );
}

/* ---------- about (01) ---------- */

function About() {
  const { dict } = useLanguage();
  const p = dict.portfolio;
  return (
    <Container className="mt-28 lg:mt-36">
      <section id="about" className="grid lg:grid-cols-12 gap-5 scroll-mt-8">
        <Label n="01">{p.labels.about}</Label>
        <div className="lg:col-span-9 flex flex-col gap-10">
          {p.about.map((a) => (
            <div key={a.title} className="grid md:grid-cols-[260px_1fr] gap-5 border-t border-[#c9c5bd] pt-5">
              <h3 className="m-0 text-[28px] font-bold tracking-[-0.02em]">{a.title}</h3>
              <p className="m-0 text-[19px] leading-[1.5] text-[#4a4a48]">{a.text}</p>
            </div>
          ))}
          <div className="text-[15px] text-[#4a4a48]">
            <span className="font-bold text-[#141414]">{p.strengthsLabel} :</span> {p.strengths}
          </div>
        </div>
      </section>
    </Container>
  );
}

/* ---------- experience (02) ---------- */

function Experience() {
  const { dict } = useLanguage();
  const p = dict.portfolio;
  return (
    <Container className="mt-28 lg:mt-36">
      <section id="experience" className="grid lg:grid-cols-12 gap-5 scroll-mt-8">
        <Label n="02">{p.labels.exp}</Label>
        <div className="lg:col-span-9 flex flex-col border-b-2 border-[#141414]">
          {p.exp.map((e, i) => (
            <div key={`${e.company}-${i}`} className="border-t-2 border-[#141414] pt-6 pb-8 grid md:grid-cols-[minmax(0,1fr)_180px] gap-5">
              <div className="flex flex-col gap-3">
                <h3 className="m-0 text-[32px] font-extrabold tracking-[-0.025em] leading-[1.05]">{e.company}</h3>
                <span className="text-[18px] font-medium">{e.role}</span>
                <ul className="m-0 pl-[18px] text-[16px] leading-[1.55] text-[#4a4a48] flex flex-col gap-1 list-disc">
                  {e.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {e.tags.map((tag) => (
                    <span key={tag} className="font-mono text-[12px] bg-[#e6e3dc] px-2 py-1">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="md:text-right font-plex text-[13px] flex flex-col gap-1.5">
                <span>{e.dates}</span>
                <span className="text-[var(--accent)]">{e.type}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Container>
  );
}

/* ---------- projects (03) ---------- */

function Projects() {
  const { dict } = useLanguage();
  const p = dict.portfolio;
  return (
    <Container className="mt-28 lg:mt-36">
      <section id="projects" className="flex flex-col gap-10 scroll-mt-8">
        <div className="font-plex text-[13px]">(03) {p.labels.projects}</div>
        <div className="grid md:grid-cols-2 gap-x-5 gap-y-14">
          {p.projects.map((pr) => (
            <div key={pr.id} className="flex flex-col gap-4">
              {PROJECT_IMAGES[pr.id] && (
                <div className="relative aspect-[4/3] overflow-hidden bg-[#e6e3dc]">
                  <Image src={PROJECT_IMAGES[pr.id]!} alt={pr.shot} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                </div>
              )}
              <div className="flex justify-between items-baseline gap-4">
                <h3 className="m-0 text-[36px] font-extrabold tracking-[-0.03em]">{pr.title}</h3>
                {pr.link && (
                  <a href={pr.link} target="_blank" rel="noopener noreferrer" className="shrink-0 inline-flex items-center gap-1 text-sm font-bold border-b-2 border-[var(--accent)] hover:no-underline">
                    GitHub <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} aria-hidden />
                  </a>
                )}
              </div>
              <p className="m-0 text-[17px] leading-[1.5] text-[#4a4a48] max-w-[520px]">{pr.text}</p>
              <div className="flex flex-wrap gap-1.5">
                {pr.tags.map((tag) => (
                  <span key={tag} className="font-mono text-[12px] bg-[#e6e3dc] px-2 py-1">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </Container>
  );
}

/* ---------- infrastructure (04) - dark ---------- */

function Infrastructure() {
  const { dict } = useLanguage();
  const p = dict.portfolio;
  return (
    <section id="infra" className="mt-28 lg:mt-36 bg-[#0e100f] text-[#e4e7e4] scroll-mt-8">
      <Container className="py-16 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-5">
          <Label n="04" dark>
            {p.labels.infra}
          </Label>
          <div className="lg:col-span-9 flex flex-col gap-12">
            <p className="m-0 font-medium tracking-[-0.02em]" style={{ fontSize: 'clamp(28px, 4vw, 40px)', lineHeight: 1.1 }}>
              {p.infraIntro}
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {p.infraStats.map((s) => (
                <div key={s.l} className="flex flex-col gap-1 border-t border-[#2c322e]">
                  <span className="font-extrabold tracking-[-0.03em] pt-3" style={{ fontSize: 'clamp(32px, 4vw, 44px)' }}>
                    {s.v}
                  </span>
                  <span className="text-sm text-[#9aa19c]">{s.l}</span>
                </div>
              ))}
            </div>
            <div className="border border-[#232825] bg-[#131614] font-mono text-[14px]">
              <div className="flex justify-between px-5 py-2.5 border-b border-[#232825] text-[#6c736e]">
                <span>{p.infraTitle}</span>
                <span>{p.infraPath}</span>
              </div>
              {p.infra.map((s) => (
                <div key={s.name} className="px-5 py-3 border-b border-[#1c201d] grid grid-cols-[130px_1fr_50px] lg:grid-cols-[200px_1fr_60px] gap-2">
                  <span>{s.name}</span>
                  <span className="text-[#9aa19c]">{s.role}</span>
                  <span className="text-[var(--ok)] whitespace-nowrap">● {p.up}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ---------- skills (05) ---------- */

function Skills() {
  const { dict } = useLanguage();
  const p = dict.portfolio;
  return (
    <Container className="mt-28 lg:mt-36">
      <section id="skills" className="grid lg:grid-cols-12 gap-5 scroll-mt-8">
        <Label n="05">{p.labels.skills}</Label>
        <div className="lg:col-span-9 flex flex-col gap-9">
          {p.skills.map((g) => (
            <div key={g.name} className="grid md:grid-cols-[260px_1fr] gap-5 border-t border-[#c9c5bd] pt-4">
              <span className="text-[15px] font-bold">{g.name}</span>
              <span className="text-[28px] leading-[1.25] font-medium tracking-[-0.015em]">{g.items.join(', ')}</span>
            </div>
          ))}
        </div>
      </section>
    </Container>
  );
}

/* ---------- blog (06) ---------- */

function Blog({ posts }: { posts: BlogPreview[] }) {
  const { dict, language } = useLanguage();
  const p = dict.portfolio;
  return (
    <Container className="mt-28 lg:mt-36">
      <section className="grid lg:grid-cols-12 gap-5">
        <Label n="06">{p.labels.blog}</Label>
        <div className="lg:col-span-9 flex flex-col gap-6">
          <p className="m-0 text-[28px] leading-[1.25] font-medium tracking-[-0.015em]">{p.blogIntro}</p>
          <div className="flex flex-col border-b-2 border-[#141414]">
            {posts.map((post) => (
              <a
                key={post.url}
                href={post.url}
                className="grid grid-cols-[1fr_auto] lg:grid-cols-[140px_minmax(0,1fr)_150px_24px] gap-x-5 gap-y-2 items-baseline py-5 border-t-2 border-[#141414] hover:text-[var(--accent)] hover:no-underline transition-colors"
              >
                <span className="font-plex text-[12px] text-[#8a8680] order-1">{formatPostDate(post.date, language)}</span>
                <span className="text-[22px] font-bold tracking-[-0.015em] leading-[1.2] col-span-2 lg:col-span-1 order-3 lg:order-2">
                  {post.title}
                </span>
                <span className="font-mono text-[12px] bg-[#e6e3dc] text-[#141414] px-2 py-1 justify-self-start order-2 lg:order-3">
                  {post.cat}
                </span>
                <span className="text-[var(--accent)] justify-self-end hidden lg:flex items-center order-4"><ArrowUpRight className="w-4 h-4" strokeWidth={2.5} aria-hidden /></span>
              </a>
            ))}
          </div>
          <a href="/blog/" className="self-start font-bold border-b-2 border-[var(--accent)] pb-1 hover:no-underline">
            {p.blogCta} →
          </a>
        </div>
      </section>
    </Container>
  );
}

/* ---------- contact (07) ---------- */

function Contact() {
  const { dict, t } = useLanguage();
  const p = dict.portfolio;
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: null, message: '' });
    try {
      if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim() || !consent) {
        throw new Error('required');
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) throw new Error('invalid email');

      const res = await fetch('/api/send-email/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, consent, website: honeypot }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'failed');

      setStatus({ type: 'success', message: t('contact.success') });
      setForm({ name: '', email: '', subject: '', message: '' });
      setConsent(false);
    } catch {
      setStatus({ type: 'error', message: t('contact.error') });
    } finally {
      setSubmitting(false);
    }
  };

  const field = 'bg-transparent border-0 border-b border-[#141414] py-2.5 text-[17px] outline-none focus:border-[var(--accent)] transition-colors';

  return (
    <Container className="mt-28 lg:mt-36 pb-20">
      <section id="contact" className="grid lg:grid-cols-12 gap-5 scroll-mt-8">
        <div className="lg:col-span-12 flex flex-col gap-5">
          <div className="font-plex text-[13px]">(07) {p.labels.contact}</div>
          <h2 className="m-0 font-extrabold tracking-[-0.05em] max-w-[1100px]" style={{ fontSize: 'clamp(44px, 9vw, 112px)', lineHeight: 0.9 }}>
            {p.contact.title}
          </h2>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-5 pt-6 lg:pt-10">
          <p className="m-0 text-[19px] leading-[1.5] text-[#4a4a48]">{p.contact.text}</p>
          <a href="mailto:alban.mary1@gmail.com" className="text-[26px] font-bold border-b-[3px] border-[var(--accent)] self-start hover:no-underline break-all">
            alban.mary1@gmail.com
          </a>
          <div className="flex gap-6 text-[15px] font-medium">
            <a href="https://www.linkedin.com/in/alban-mary/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1">LinkedIn <ArrowUpRight className="w-4 h-4" aria-hidden /></a>
            <a href="https://github.com/Kidoly" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1">GitHub <ArrowUpRight className="w-4 h-4" aria-hidden /></a>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="lg:col-span-6 lg:col-start-7 flex flex-col gap-5 pt-6 lg:pt-10 text-sm">
          <div className="grid md:grid-cols-2 gap-5">
            <label className="flex flex-col gap-1.5 font-medium">
              {p.form.name}
              <input className={field} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required disabled={submitting} />
            </label>
            <label className="flex flex-col gap-1.5 font-medium">
              {p.form.email}
              <input type="email" className={field} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required disabled={submitting} />
            </label>
          </div>
          <label className="flex flex-col gap-1.5 font-medium">
            {p.form.subject}
            <input className={field} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required disabled={submitting} />
          </label>
          <label className="flex flex-col gap-1.5 font-medium">
            {p.form.message}
            <textarea rows={4} className={`${field} resize-y`} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required disabled={submitting} />
          </label>

          {/* honeypot: off-screen, left empty by people, filled by naive bots */}
          <div className="absolute -left-[9999px] w-px h-px overflow-hidden" aria-hidden="true">
            <input type="text" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" />
          </div>

          <label className="flex items-start gap-3 text-[14px] leading-[1.5] text-[#4a4a48]">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              required
              disabled={submitting}
              className="mt-[3px] w-4 h-4 shrink-0 accent-[#141414] cursor-pointer"
            />
            <span>
              {p.form.consent}{' '}
              <a href="/confidentialite/" className="text-[#141414] font-medium border-b border-[var(--accent)] hover:no-underline">
                {p.form.privacy}
              </a>
            </span>
          </label>

          {status.type && (
            <p className={`text-sm ${status.type === 'success' ? 'text-green-700' : 'text-red-600'}`}>{status.message}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="self-start bg-[#141414] text-[#f3f1ec] rounded-full px-7 py-4 font-bold text-[15px] cursor-pointer hover:bg-[var(--accent)] transition-colors disabled:opacity-60"
          >
            {submitting ? t('contact.sending') : `${p.form.send} →`}
          </button>
        </form>
      </section>
    </Container>
  );
}

/* ---------- footer ---------- */

function Footer() {
  const { dict } = useLanguage();
  const p = dict.portfolio;
  return (
    <Container>
      <footer className="py-6 border-t border-[#c9c5bd] text-[13px] flex justify-between">
        <span>{p.footer.copyright}</span>
        <span>{p.footer.location}</span>
      </footer>
    </Container>
  );
}

/* ---------- page ---------- */

export default function PortfolioClient({ posts, age }: { posts: BlogPreview[]; age: number | null }) {
  const { dict } = useLanguage();
  useLocalizedDocument(dict.portfolio.meta);

  return (
    <main className="bg-[#f3f1ec] text-[#141414] font-sans">
      <Hero age={age} />
      <Stats />
      <About />
      <Experience />
      <Projects />
      <Infrastructure />
      <Skills />
      <Blog posts={posts} />
      <Contact />
      <Footer />
    </main>
  );
}
