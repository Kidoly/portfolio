'use client'

import React from 'react';
import { Network, Server, Shield, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

const Hero = () => {
  const { t } = useLanguage();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white relative overflow-hidden">
      {/* Language Switcher */}
      <LanguageSwitcher />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 right-20 w-96 h-96 bg-cyan-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-screen text-center">
        <div className="mb-8 flex space-x-6">
          <div className="p-4 bg-blue-600/20 rounded-full backdrop-blur-sm border border-blue-400/30 animate-bounce">
            <Network className="w-8 h-8 text-blue-300" />
          </div>
          <div className="p-4 bg-cyan-600/20 rounded-full backdrop-blur-sm border border-cyan-400/30 animate-bounce delay-200">
            <Server className="w-8 h-8 text-cyan-300" />
          </div>
          <div className="p-4 bg-teal-600/20 rounded-full backdrop-blur-sm border border-teal-400/30 animate-bounce delay-400">
            <Shield className="w-8 h-8 text-teal-300" />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
          {t('hero.title')}
        </h1>
        
        <p className="text-xl md:text-2xl text-blue-100 mb-4 font-light">
          {t('hero.subtitle')}
        </p>
        
        <p className="text-lg text-slate-300 max-w-2xl mb-12 leading-relaxed">
          {t('hero.description')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <button 
            onClick={() => scrollToSection('projects')}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
          >
            {t('hero.viewWork')}
          </button>
          <a 
            href="/Alban_Mary_CV.pdf" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-8 py-4 border-2 border-blue-400 hover:bg-blue-400 hover:text-slate-900 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105">
            {t('hero.downloadResume')}
          </a>
        </div>

        <div 
          className="animate-bounce cursor-pointer"
          onClick={() => scrollToSection('about')}
        >
          <ChevronDown className="w-8 h-8 text-blue-300" />
        </div>
      </div>
    </section>
  );
};

export default Hero;