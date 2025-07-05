'use client'

import React from 'react';
import { GraduationCap, Target, Lightbulb } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const About = () => {
  const { t, language } = useLanguage();

  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('about.title')}</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto mb-8"></div>
            <p className="text-xl text-gray-600">
              {t('about.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <GraduationCap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('about.learning.title')}</h3>
                  <p className="text-gray-600">
                    {t('about.learning.description')}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-cyan-100 rounded-lg">
                  <Target className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('about.focus.title')}</h3>
                  <p className="text-gray-600">
                    {t('about.focus.description')}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-teal-100 rounded-lg">
                  <Lightbulb className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('about.innovation.title')}</h3>
                  <p className="text-gray-600">
                    {t('about.innovation.description')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-2xl">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('about.education')}</h4>
                  <p className="text-gray-600">{t('about.education.degree')}</p>
                  <p className="text-sm text-gray-500">{t('about.education.graduation')}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('about.currentRole')}</h4>
                  <p className="text-gray-600">{t('about.role.title')}</p>
                  <p className="text-sm text-gray-500">{t('about.role.company')}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('about.information.title')}</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">{t('about.information.name')}</span> Alban MARY</p>
                    <p><span className="font-medium">{t('about.information.age')}</span>{t('about.information.ageValue')}</p>
                    <p><span className="font-medium">{t('about.information.phone')}</span> +33 7 50 04 96 13</p>
                    <p><span className="font-medium">{t('about.information.email')}</span> alban.mary1@gmail.com</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('about.strengths')}</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{t('about.strength.problemSolving')}</span>
                    <span className="px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-sm">{t('about.strength.teamwork')}</span>
                    <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm">{t('about.strength.learning')}</span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">{t('about.strength.documentation')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;