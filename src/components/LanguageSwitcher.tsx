'use client'

import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed top-6 right-6 z-50">
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-2 flex items-center space-x-2">
        <Globe className="w-4 h-4 text-white" />
        <button
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${
            language === 'en'
              ? 'bg-white text-gray-900'
              : 'text-white hover:bg-white/20'
          }`}
        >
          EN
        </button>
        <button
          onClick={() => setLanguage('fr')}
          className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${
            language === 'fr'
              ? 'bg-white text-gray-900'
              : 'text-white hover:bg-white/20'
          }`}
        >
          FR
        </button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;