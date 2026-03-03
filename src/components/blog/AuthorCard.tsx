import Link from 'next/link';
import { Briefcase, Github, Linkedin, ArrowRight } from 'lucide-react';

export default function AuthorCard() {
  return (
    <div className="mt-14 rounded-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-8 md:p-10 text-white">
      <div className="flex flex-col md:flex-row gap-6 md:items-center">
        {/* Avatar / Icon */}
        <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-400/30 flex items-center justify-center shrink-0">
          <span className="text-2xl font-bold text-blue-300">AM</span>
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-bold mb-1">Alban Mary</h3>
          <p className="text-blue-200 text-sm mb-4">
            Développeur Web & Administrateur Systèmes — Étudiant à l&apos;EPSI Nantes.
            Je partage ici mes connaissances sur l&apos;infra, le dev et la cybersécurité.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-white text-slate-900 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-50 transition"
            >
              <Briefcase className="w-4 h-4" />
              Voir mon portfolio
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="https://github.com/Kidoly"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-white/20 transition"
            >
              <Github className="w-4 h-4" />
              GitHub
            </Link>
            <Link
              href="https://www.linkedin.com/in/alban-mary/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-white/20 transition"
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
