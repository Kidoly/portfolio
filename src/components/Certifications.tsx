'use client'

import React from 'react';
import { Calendar, MapPin, Building, Award, Users, Wrench } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Certifications = () => {
  const { t, language } = useLanguage();

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 text-white',
      cyan: 'bg-cyan-500 text-white',
      teal: 'bg-teal-500 text-white',
      purple: 'bg-purple-500 text-white'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getProgressColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-500',
      cyan: 'bg-cyan-500',
      teal: 'bg-teal-500',
      purple: 'bg-purple-500'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getBgColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-50',
      cyan: 'bg-cyan-50',
      teal: 'bg-teal-50',
      purple: 'bg-purple-50'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <section id="certifications" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('certifications.title')}</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto mb-8"></div>
          <p className="text-xl text-gray-600">
            {t('certifications.subtitle')}
          </p>
        </div>
                {/* Skills Summary */}
        <div className="mt-16 bg-white p-8 rounded-xl shadow-lg max-w-4xl mx-auto">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">{t('experience.competencies')}</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Wrench className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">{t('experience.networking')}</h4>
              <p className="text-sm text-gray-600">{t('experience.networking.desc')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Building className="w-8 h-8 text-cyan-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">{t('experience.systems')}</h4>
              <p className="text-sm text-gray-600">{t('experience.systems.desc')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="w-8 h-8 text-teal-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">{t('experience.security')}</h4>
              <p className="text-sm text-gray-600">{t('experience.security.desc')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">{t('experience.cloud')}</h4>
              <p className="text-sm text-gray-600">{t('experience.cloud.desc')}</p>
            </div>
          </div>
        </div>
        <br></br>
        <br></br>

        {/* Additional Skills Cloud */}
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            {language === 'fr' ? 'Technologies' : 'Technologies'}
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              'WordPress', 'Flutter', 'Git', 'GitHub', 'VS Code', 'Figma',
              'Wireshark', 'Kali Linux', 'Metasploit', 'Burp Suite',
              'VMware', 'VirtualBox', 'Raspberry Pi', 'Arduino',
              'MongoDB', 'MySQL', 'Redis', 'Elasticsearch'
            ].map((tech, index) => (
              <span 
                key={index} 
                className="px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 text-gray-800 rounded-full text-sm font-medium hover:from-blue-200 hover:to-cyan-200 transition-all duration-200 cursor-default"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Experience Summary */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-8 rounded-xl shadow-lg">
          <div className="text-center">
            <h3 className="text-2xl font-semibold mb-4">
              {language === 'fr' ? '3 Ans d\'Expérience' : '3 Years of Experience'}
            </h3>
            <p className="text-blue-100 mb-6">
              {language === 'fr' 
                ? 'Développement continu de compétences techniques et professionnelles à travers des projets académiques et professionnels.'
                : 'Continuous development of technical and professional skills through academic and professional projects.'
              }
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">15+</div>
                <div className="text-blue-100">{language === 'fr' ? 'Projets Réalisés' : 'Projects Completed'}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">10+</div>
                <div className="text-blue-100">{language === 'fr' ? 'Technologies Maîtrisées' : 'Technologies Mastered'}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">3</div>
                <div className="text-blue-100">{language === 'fr' ? 'Stages Professionnels' : 'Professional Internships'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Certifications;