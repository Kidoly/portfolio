'use client';

import React from 'react';
import { Calendar, MapPin, Building, Award, Users, Wrench } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Experience = () => {
  const { t } = useLanguage();

  const experiences = [
    {
      key: 'epsight',
      icon: Wrench,
      location: 'Nantes, France',
      technologies: ['Linux', 'Networking', 'Python', 'Bash', 'Docker', 'Ansible', 'PowerShell', 'Proxmox', 'VMware', 'Windows Server', '...'],
      typeKey: 'status.apprenticeship',
      color: 'blue',
    },
    {
      key: 'troublanc',
      icon: Building,
      location: 'Nantes, France',
      technologies: ['WordPress', 'PHP', 'JavaScript', 'Raspberry Pi', 'Python', 'Rust', 'Flutter'],
      typeKey: 'status.trainee',
      color: 'blue',
    },
    {
      key: 'kereisweb',
      icon: Users,
      location: 'Nantes, France',
      technologies: ['Sharepoint', 'Microsoft 365', 'Web Design'],
      typeKey: 'status.cdd',
      color: 'cyan',
    },
    {
      key: 'kereissecurity',
      icon: Wrench,
      location: 'Nantes, France',
      technologies: ['Encryption', 'Pentesting', 'Azure AD Connect', 'AWS'],
      typeKey: 'status.trainee',
      color: 'teal',
    },
    {
      key: 'epsi',
      icon: Award,
      location: 'Nantes, France',
      technologies: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Express', 'SQL', 'Symfony', 'Docker', 'Git'], 
      typeKey: 'status.education',
      color: 'purple',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 border-blue-500 text-white',
      cyan: 'bg-cyan-500 border-cyan-500 text-white',
      teal: 'bg-teal-500 border-teal-500 text-white',
      purple: 'bg-purple-500 border-purple-500 text-white',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getBadgeColor = (typeKey: string) => {
    const type = t(typeKey);
    const colors = {
      [t('status.apprenticeship')]: 'bg-blue-100 text-blue-800 border-blue-200',
      [t('status.cdd')]: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      [t('status.trainee')]: 'bg-teal-100 text-teal-800 border-teal-200',
      [t('status.fulltime')]: 'bg-green-100 text-green-800 border-green-200',
      [t('status.internship')]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      [t('status.education')]: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <section id="experience" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('experience.title')}</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto mb-8"></div>
          <p className="text-xl text-gray-600">{t('experience.subtitle')}</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-cyan-500 to-purple-500"></div>

            <div className="space-y-12">
              {experiences.map((exp, index) => {
                const achievements = [1, 2, 3, 4].map(i => t(`experiences.${exp.key}.achievements.${i}`));
                return (
                  <div key={index} className="relative flex items-start">
                    <div className={`absolute left-6 w-4 h-4 rounded-full border-4 ${getColorClasses(exp.color)} z-10`}></div>

                    <div className="ml-20 bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 w-full">
                      <div className="flex flex-wrap items-start justify-between mb-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`p-2 rounded-lg ${getColorClasses(exp.color)}`}>
                            <exp.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">{t(`experiences.${exp.key}.title`)}</h3>
                            <p className="text-lg text-gray-700 font-medium">{t(`experiences.${exp.key}.company`)}</p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end space-y-2">
                          <span className={`px-3 py-1 rounded-full text-sm border ${getBadgeColor(exp.typeKey)}`}>
                            {t(exp.typeKey)}
                          </span>
                          <div className="flex items-center text-gray-500 text-sm">
                            <Calendar className="w-4 h-4 mr-1" />
                            {t(`experiences.${exp.key}.period`)}
                          </div>
                          <div className="flex items-center text-gray-500 text-sm">
                            <MapPin className="w-4 h-4 mr-1" />
                            {exp.location}
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4 leading-relaxed">{t(`experiences.${exp.key}.description`)}</p>

                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">{t('experience.achievements')}</h4>
                        <ul className="space-y-1">
                          {achievements.map((achievement, idx) => (
                            <li key={idx} className="text-gray-600 flex items-start">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                              <span className="text-sm">{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">{t('experience.technologies')}</h4>
                        <div className="flex flex-wrap gap-2">
                          {exp.technologies.map((tech, idx) => (
                            <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
