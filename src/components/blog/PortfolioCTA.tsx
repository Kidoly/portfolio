import Link from 'next/link';
import { ArrowRight, Briefcase, Mail } from 'lucide-react';

export default function PortfolioCTA() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
        <Briefcase className="w-5 h-5 text-blue-600" />
      </div>
      <h3 className="font-bold text-gray-900 mb-2">Besoin d&apos;un dev ?</h3>
      <p className="text-sm text-gray-500 mb-4">
        Développeur web, sysadmin et passionné de cybersécurité — découvrez mon parcours et mes projets.
      </p>
      <div className="flex flex-col gap-2">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition w-full"
        >
          Voir mon portfolio
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/#contact"
          className="inline-flex items-center justify-center gap-2 text-gray-700 bg-gray-50 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition w-full"
        >
          <Mail className="w-4 h-4" />
          Me contacter
        </Link>
      </div>
    </div>
  );
}
