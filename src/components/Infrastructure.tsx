'use client'

import React from 'react';
import { Server, Shield, Database, Monitor, GitBranch, Film, Share, Settings, Network, Globe, Lock, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Infrastructure = () => {
  const { t, language } = useLanguage();

  const services = [
    {
      name: 'Wiki',
      description: language === 'fr' 
        ? 'Documentation centralisée'
        : 'Centralized documentation',
      icon: Globe,
      color: 'blue',
      link: 'https://wiki.albanmary.com'
    },
    {
      name: 'Proxmox',
      description: language === 'fr'
        ? 'Virtualisation'
        : 'Virtualization',
      icon: Server,
      color: 'orange'
    },
    {
      name: 'Gitea',
      description: language === 'fr'
        ? 'Dépôts Git'
        : 'Git repositories',
      icon: GitBranch,
      color: 'green'
    },
    {
      name: 'MonitorFlow',
      description: language === 'fr'
        ? 'Supervision'
        : 'Monitoring',
      icon: Monitor,
      color: 'red'
    },
    {
      name: 'Send',
      description: language === 'fr'
        ? 'Partage chiffré'
        : 'Encrypted sharing',
      icon: Share,
      color: 'cyan'
    },
    {
      name: 'OPNsense',
      description: language === 'fr'
        ? 'Pare-feu'
        : 'Firewall',
      icon: Shield,
      color: 'yellow'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 text-white',
      orange: 'bg-orange-500 text-white',
      green: 'bg-green-500 text-white',
      red: 'bg-red-500 text-white',
      cyan: 'bg-cyan-500 text-white',
      yellow: 'bg-yellow-500 text-white'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getBgColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200',
      orange: 'bg-orange-50 border-orange-200',
      green: 'bg-green-50 border-green-200',
      red: 'bg-red-50 border-red-200',
      cyan: 'bg-cyan-50 border-cyan-200',
      yellow: 'bg-yellow-50 border-yellow-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <section id="infrastructure" className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {language === 'fr' ? 'Mon Infrastructure' : 'My Infrastructure'}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {language === 'fr' 
              ? 'Infrastructure auto-hébergée pour mes projets et services'
              : 'Self-hosted infrastructure for my projects and services'
            }
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-blue-600 mb-1">10+</div>
              <div className="text-xs text-gray-600">
                {language === 'fr' ? 'Services' : 'Services'}
              </div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-green-600 mb-1">24/7</div>
              <div className="text-xs text-gray-600">
                {language === 'fr' ? 'Uptime' : 'Uptime'}
              </div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-purple-600 mb-1">100%</div>
              <div className="text-xs text-gray-600">
                {language === 'fr' ? 'Auto-hébergé' : 'Self-hosted'}
              </div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-red-600 mb-1">1</div>
              <div className="text-xs text-gray-600">
                {language === 'fr' ? 'Personne' : 'Person'}
              </div>
            </div>
          </div>

          

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {services.map((service, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border hover:shadow-md transition-all duration-300 ${getBgColor(service.color)}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getColorClasses(service.color)}`}>
                    <service.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{service.name}</h4>
                    <p className="text-gray-600 text-xs">{service.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Technical Highlights */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-xl shadow-lg">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <Lock className="w-6 h-6 mx-auto mb-2" />
                <h4 className="font-semibold text-sm mb-1">
                  {language === 'fr' ? 'Sécurité' : 'Security'}
                </h4>
                <p className="text-blue-100 text-xs">
                  {language === 'fr' ? 'Chiffrement E2E' : 'E2E Encryption'}
                </p>
              </div>
              
              <div>
                <Zap className="w-6 h-6 mx-auto mb-2" />
                <h4 className="font-semibold text-sm mb-1">
                  {language === 'fr' ? 'Automatisation' : 'Automation'}
                </h4>
                <p className="text-blue-100 text-xs">
                  {language === 'fr' ? 'Ansible + Semaphore' : 'Ansible + Semaphore'}
                </p>
              </div>
              
              <div>
                <Monitor className="w-6 h-6 mx-auto mb-2" />
                <h4 className="font-semibold text-sm mb-1">
                  {language === 'fr' ? 'Supervision' : 'Monitoring'}
                </h4>
                <p className="text-blue-100 text-xs">
                  {language === 'fr' ? 'MonitorFlow' : 'MonitorFlow'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Infrastructure;