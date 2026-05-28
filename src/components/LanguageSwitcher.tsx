'use client'

import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed top-6 right-6 z-50">
      <div className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-2 flex items-center space-x-2 shadow-lg">
        <Globe className="w-4 h-4 text-gray-300" />
        <button
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${
            language === 'en'
              ? 'bg-white text-gray-900'
              : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          EN
        </button>
        <button
          onClick={() => setLanguage('fr')}
          className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${
            language === 'fr'
              ? 'bg-white text-gray-900'
              : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          FR
        </button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;