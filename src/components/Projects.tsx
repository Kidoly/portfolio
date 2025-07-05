'use client'

import React from 'react';
import { ExternalLink, Github, Monitor, Plane, Users, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Projects = () => {
  const { t } = useLanguage();

  const projects = [
    {
      title: t('projects.monitorflow.title'),
      description: t('projects.monitorflow.description'),
      technologies: ['Rust', 'Flutter', 'Next.js'],
      icon: Monitor,
      color: 'blue',
      image: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=600',
      highlights: [
        t('projects.monitorflow.achievement1'),
        t('projects.monitorflow.achievement2'),
        t('projects.monitorflow.achievement3')
      ],
      githubUrl: 'https://github.com/Kidoly/monitorflowmodule'
    },
    {
      title: t('projects.drone.title'),
      description: t('projects.drone.description'),
      technologies: ['Node.js', 'Python', 'XBOX Controller', 'Websockets'],
      icon: Plane,
      color: 'cyan',
      image: 'https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg?auto=compress&cs=tinysrgb&w=600',
      highlights: [
        t('projects.drone.achievement1'),
        t('projects.drone.achievement2'),
        t('projects.drone.achievement3')
      ],
      githubUrl: 'https://github.com/Kidoly/Drone'
    },
    {
      title: t('projects.astraso.title'),
      description: t('projects.astraso.description'),
      technologies: ['HTML5', 'CSS3', 'Symfony', 'Social Network'],
      icon: Users,
      color: 'teal',
      image: 'https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=600',
      highlights: [
        t('projects.astraso.achievement1'),
        t('projects.astraso.achievement2'),
        t('projects.astraso.achievement3')
      ],
      githubUrl: 'https://github.com/Kidoly/Astraso'
    },
    {
      title: t('projects.security.title'),
      description: t('projects.security.description'),
      technologies: ['Cybersecurity', 'Penetration Testing', 'Encryption', 'Security Awareness'],
      icon: Shield,
      color: 'purple',
      image: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=600',
      highlights: [
        t('projects.security.achievement1'),
        t('projects.security.achievement2'),
        t('projects.security.achievement3')
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 text-white',
      cyan: 'bg-cyan-500 text-white',
      teal: 'bg-teal-500 text-white',
      purple: 'bg-purple-500 text-white'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getBorderColor = (color: string) => {
    const colors = {
      blue: 'border-blue-200',
      cyan: 'border-cyan-200',
      teal: 'border-teal-200',
      purple: 'border-purple-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <section id="projects" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('projects.title')}</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto mb-8"></div>
          <p className="text-xl text-gray-600">
            {t('projects.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <div key={index} className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 ${getBorderColor(project.color)} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2`}>
              <div className="relative">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-48 object-cover"
                />
                <div className={`absolute top-4 left-4 p-3 rounded-lg ${getColorClasses(project.color)}`}>
                  <project.icon className="w-6 h-6" />
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{project.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{project.description}</p>
                
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">{t('projects.achievements')}</h4>
                  <ul className="space-y-1">
                    {project.highlights.map((highlight, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">{t('projects.technologies')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-3">
                  {project.githubUrl && (
                    <a 
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <Github className="w-4 h-4" />
                      {t('projects.viewCode')}
                    </a>
                  )}

                  {/*
                  <button className="flex-1 px-4 py-2 border-2 border-gray-900 text-gray-900 rounded-lg hover:bg-gray-900 hover:text-white transition-colors duration-200 flex items-center justify-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    {t('projects.liveDemo')}
                  </button>
                  */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;