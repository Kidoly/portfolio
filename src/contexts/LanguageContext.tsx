'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    'nav.about': 'About',
    'nav.experience': 'Experience',
    'nav.projects': 'Projects',
    'nav.certifications': 'Skills',
    'nav.contact': 'Contact',

    // Hero Section
    'hero.title': 'Alban Mary',
    'hero.subtitle': 'Student & System and Network Administrator',
    'hero.description': 'Passionate about systems and networks. Currently in my third year of computer science at EPSI Nantes, specializing in networks with a strong desire to pursue this field further.',
    'hero.viewWork': 'View My Work',
    'hero.downloadResume': 'Download Resume',

    // About Section
    'about.title': 'About',
    'about.subtitle': 'System & Network Administrator & Development Enthusiast',
    'about.learning.title': 'Learning Path',
    'about.learning.description': 'Currently in my third year of computer science at EPSI, with a primary interest in networks, a field I aim to specialize in.',
    'about.focus.title': 'Professional Focus',
    'about.focus.description': 'Specialized in web development, network infrastructure, and system operations with a strong interest in cybersecurity and automation.',
    'about.innovation.title': 'Innovation Mindset',
    'about.innovation.description': 'Constantly exploring new technologies and methodologies to build efficient and scalable solutions for complex technical challenges.',
    'about.education': 'Education',
    'about.education.degree': 'Computer Science - EPSI Nantes',
    'about.education.graduation': 'Expected Graduation: 2027',
    'about.currentRole': 'Current Role',
    'about.role.title': 'Student & System and Network Administrator',
    'about.role.company': 'EPSI Nantes • 2022 - Present',
    'about.strengths': 'Key Strengths',
    'about.strength.problemSolving': 'Problem Solving',
    'about.strength.teamwork': 'Team Collaboration',
    'about.strength.learning': 'Fast Learner',
    'about.strength.documentation': 'Documentation',
    'about.information.title': 'Information',
    'about.information.name': 'Name:',
    'about.information.age': 'Age:',
    'about.information.ageValue': '19 years old',
    'about.information.phone': 'Phone:',
    'about.information.email': 'Email:',

    // Experience Section
    'experience.title': 'Professional Experience',
    'experience.subtitle': 'My journey in web development and system administration',
    'experience.achievements': 'Key Achievements:',
    'experience.technologies': 'Technologies and Skills:',
    'experience.competencies': 'Main Technical Skills',
    'experience.networking': 'Web Development',
    'experience.networking.desc': 'HTML5, CSS3, JavaScript, PHP, React, Symfony',
    'experience.systems': 'Systems',
    'experience.systems.desc': 'Linux, Windows Server, Docker, NGINX, Active Directory',
    'experience.security': 'Security',
    'experience.security.desc': 'Cybersecurity, Penetration Testing, Security Awareness',
    'experience.cloud': 'Programming',
    'experience.cloud.desc': 'Python, Rust, C#, Node.js, Flutter',

    // Experience Details
    'experiences.epsight.title': 'System & Network Administrator at Epsight',
    'experiences.epsight.company': 'Epsight',
    'experiences.epsight.period': 'August 2024 - Present',
    'experiences.epsight.description': 'Apprenticeship in system and network administration involving server monitoring, client infrastructure management, and performance optimization.',
    'experiences.epsight.achievements.1': 'Server monitoring, client infrastructure management, and performance optimization.',
    'experiences.epsight.achievements.2': 'Developed PowerShell and Ansible scripts to automate maintenance tasks.',
    'experiences.epsight.achievements.3': 'Resolved level 2 and 3 tickets related to system infrastructure and participated in setup and configuration projects.',
    'experiences.epsight.achievements.4': 'Contributed to infrastructure project management, backups, hardware installation, and system configuration.',

    'experiences.troublanc.title': 'FullStack Developer at Troublanc',
    'experiences.troublanc.company': 'Troublanc',
    'experiences.troublanc.period': 'Jan 2024 - Feb 2024',
    'experiences.troublanc.description': 'FullStack development internship including creation of a product mosaic on WordPress and a monitoring application.',
    'experiences.troublanc.achievements.1': 'Redesigned the showcase site www.troublanc.com on WordPress.',
    'experiences.troublanc.achievements.2': 'Developed a monitoring application for Raspberry Pi.',
    'experiences.troublanc.achievements.3': 'Improved the user experience of the website.',
    'experiences.troublanc.achievements.4': 'Integrated new features and optimized website performance.',

    'experiences.kereisweb.title': 'Web Designer / Administrative Assistant at Kereis',
    'experiences.kereisweb.company': 'Kereis',
    'experiences.kereisweb.period': 'Jul 2023 - Sep 2023',
    'experiences.kereisweb.description': 'Created an internal document-sharing site and redesigned client-facing documents.',
    'experiences.kereisweb.achievements.1': 'Built an internal document-sharing platform.',
    'experiences.kereisweb.achievements.2': 'Redesigned documents for clients.',
    'experiences.kereisweb.achievements.3': 'Improved internal processes.',
    'experiences.kereisweb.achievements.4': 'Trained on design tools.',

    'experiences.kereissecurity.title': 'Cybersecurity Engineer at Kereis',
    'experiences.kereissecurity.company': 'Kereis',
    'experiences.kereissecurity.period': 'May 2023 - Jun 2023',
    'experiences.kereissecurity.description': 'Cybersecurity internship implementing secure solutions and performing penetration tests.',
    'experiences.kereissecurity.achievements.1': 'Implemented an end-to-end encrypted file-sharing solution.',
    'experiences.kereissecurity.achievements.2': 'Conducted a penetration test.',
    'experiences.kereissecurity.achievements.3': 'Participated in a phishing awareness campaign.',
    'experiences.kereissecurity.achievements.4': 'Translated technical documents into English.',

    'experiences.epsi.title': 'Computer Science Student - EPSI',
    'experiences.epsi.company': 'EPSI Nantes',
    'experiences.epsi.period': '2022 - Present',
    'experiences.epsi.description': 'Computer science program with focus on development and networks. Active member of the Student Council.',
    'experiences.epsi.achievements.1': 'Member of the Student Council (BDE)',
    'experiences.epsi.achievements.2': 'Designed and developed Web and IoT applications.',
    'experiences.epsi.achievements.3': 'Implemented network and system infrastructure.',
    'experiences.epsi.achievements.4': 'Managed and analyzed digital data.',

    // Projects Section
    'projects.title': 'Featured Projects',
    'projects.subtitle': 'Showcasing practical implementations and innovative solutions',
    'projects.achievements': 'Key Features:',
    'projects.technologies': 'Technologies Used:',
    'projects.viewCode': 'View Code',
    'projects.liveDemo': 'Live Demo',

    // Project Details
    'projects.monitorflow.title': 'MonitorFlow',
    'projects.monitorflow.description': 'A complete server monitoring app that tracks performance and sends alerts when issues arise.',
    'projects.monitorflow.achievement1': 'Real-time server monitoring',
    'projects.monitorflow.achievement2': 'Automated alert system',
    'projects.monitorflow.achievement3': 'Cross-platform compatibility',

    'projects.drone.title': 'Autonomous Drone',
    'projects.drone.description': 'Development of a drone controllable with an XBOX controller and capable of autonomous flight using advanced navigation algorithms.',
    'projects.drone.achievement1': 'XBOX controller integration',
    'projects.drone.achievement2': 'Autonomous flight capabilities',
    'projects.drone.achievement3': 'Real-time telemetry',

    'projects.astraso.title': 'Astraso Social Network',
    'projects.astraso.description': 'A social platform for sharing amusing delay stories, built as a group project in the second year at EPSI.',
    'projects.astraso.achievement1': 'User authentication system',
    'projects.astraso.achievement2': 'Content sharing platform',
    'projects.astraso.achievement3': 'Responsive web design',

    'projects.security.title': 'Cybersecurity Projects',
    'projects.security.description': 'Various cybersecurity projects including penetration testing, secure file sharing solutions, and phishing awareness campaigns.',
    'projects.security.achievement1': 'End-to-end encrypted file sharing',
    'projects.security.achievement2': 'Penetration test reports',
    'projects.security.achievement3': 'Security awareness campaigns',

    // Skills Section
    'certifications.title': 'Skills & Technologies',
    'certifications.subtitle': 'Technical expertise across multiple domains and programming languages',
    'certifications.verify': 'View Project',
    'certifications.training': 'Core Technologies',
    'certifications.completed': 'Mastered',
    'certifications.inProgress': 'In Progress',

    // Contact Section
    'contact.title': 'Let’s Connect',
    'contact.subtitle': 'Open to opportunities, collaborations, or networking with fellow tech enthusiasts',
    'contact.getInTouch': 'Get in Touch',
    'contact.description': 'I’m always open to discussing new opportunities, sharing knowledge, or collaborating on interesting projects. Whether you’re looking for a motivated student developer or want to connect with someone passionate about tech, I’d love to hear from you.',
    'contact.email': 'Email',
    'contact.phone': 'Phone',
    'contact.location': 'Location',
    'contact.sendMessage': 'Send a Message',
    'contact.name': 'Your Name',
    'contact.email.label': 'Your Email',
    'contact.subject': 'Subject',
    'contact.message': 'Message',
    'contact.send': 'Send Message',
    'contact.sending': 'Sending...',
    'contact.success': 'Thanks for your message! I’ll reply within 24-48 hours.',
    'contact.error': 'Failed to send message. Please try again.',
    'contact.required': 'All fields are required',
    'contact.invalidEmail': 'Please enter a valid email address',
    'contact.footer': '© 2025 Alban Mary',

    // Form placeholders
    'form.name.placeholder': 'John Doe',
    'form.email.placeholder': 'john@example.com',
    'form.subject.placeholder': 'Opportunity Discussion',
    'form.message.placeholder': 'I’d like to discuss...',

    // Status labels
    'status.certified': 'Completed',
    'status.studying': 'Ongoing',
    'status.planned': 'Planned',
    'status.trainee': 'Internship',
    'status.fulltime': 'Full-Time',
    'status.cdd': 'Fixed-Term',
    'status.apprenticeship': 'Apprenticeship',
    'status.internship': 'Internship',
    'status.education': 'Education',
  },
  fr: {
    // Navigation
    'nav.about': 'Présentation',
    'nav.experience': 'Expérience',
    'nav.projects': 'Projets',
    'nav.certifications': 'Compétences',
    'nav.contact': 'Contact',
    
    // Hero Section
    'hero.title': 'Alban Mary',
    'hero.subtitle': 'Étudiant & Administrateur Système et Réseaux',
    'hero.description': 'Passionné par les systèmes et réseaux. Actuellement en troisième année d\'informatique à l\'EPSI Nantes, avec une spécialisation en réseaux et un désir de me spécialiser dans ce domaine.',
    'hero.viewWork': 'Voir Mon Travail',
    'hero.downloadResume': 'Télécharger CV',
    
    // About Section
    'about.title': 'Présentation',
    'about.subtitle': 'Administrateur Système et Réseaux & Passionné de Développement',
    'about.learning.title': 'Parcours d\'Apprentissage',
    'about.learning.description': 'Actuellement en troisième année d\'informatique à l\'EPSI, mon intérêt principal se porte sur les réseaux, un domaine dans lequel je souhaite me spécialiser.',
    'about.focus.title': 'Focus Professionnel',
    'about.focus.description': 'Spécialisé dans le développement web, l\'infrastructure réseau et les opérations système avec un fort intérêt pour la cybersécurité et l\'automatisation.',
    'about.innovation.title': 'Mentalité d\'Innovation',
    'about.innovation.description': 'Exploration constante de nouvelles technologies et méthodologies pour créer des solutions efficaces et évolutives pour des défis techniques complexes.',
    'about.education': 'Éducation',
    'about.education.degree': 'Informatique - EPSI Nantes',
    'about.education.graduation': 'Diplôme Prévu : 2027',
    'about.currentRole': 'Poste Actuel',
    'about.role.title': 'Étudiant & Administrateur Système et Réseaux',
    'about.role.company': 'EPSI Nantes • 2022 - Présent',
    'about.strengths': 'Points Forts Clés',
    'about.strength.problemSolving': 'Résolution de Problèmes',
    'about.strength.teamwork': 'Collaboration d\'Équipe',
    'about.strength.learning': 'Apprentissage Rapide',
    'about.strength.documentation': 'Documentation',
    'about.information.title': 'Informations',
    'about.information.name': 'Nom :',
    'about.information.age': 'Âge : ',
    'about.information.ageValue': ' 19 ans',
    'about.information.phone': 'Téléphone :',
    'about.information.email': 'Email :',

    // Experience Section
    'experience.title': 'Expérience Professionnelle',
    'experience.subtitle': 'Mon parcours dans le développement web et l\'administration système',
    'experience.achievements': 'Réalisations Clés :',
    'experience.technologies': 'Technologies et Compétences :',
    'experience.competencies': 'Compétences Techniques Principales',
    'experience.networking': 'Développement Web',
    'experience.networking.desc': 'HTML5, CSS3, JavaScript, PHP, React, Symfony',
    'experience.systems': 'Systèmes',
    'experience.systems.desc': 'Linux, Windows Server, Docker, NGINX, Active Directory',
    'experience.security': 'Sécurité',
    'experience.security.desc': 'Cybersécurité, Tests de Pénétration, Sensibilisation Sécurité',
    'experience.cloud': 'Programmation',
    'experience.cloud.desc': 'Python, Rust, C#, Node.js, Flutter',

    // Experience Details
    'experiences.epsight.title': 'Administrateur Système et Réseaux chez Epsight',
    'experiences.epsight.company': 'Epsight',
    'experiences.epsight.period': 'Août 2024 - Présent',
    'experiences.epsight.description': 'Alternance en administration système et réseaux avec supervision de serveurs, gestion des infrastructures clients et optimisation des performances.',
    'experiences.epsight.achievements.1': 'Supervision de serveurs, gestion des infrastructures clients et optimisation des performances.',
    'experiences.epsight.achievements.2': 'Création de scripts PowerShell et Ansible pour automatiser les tâches de maintenance.',
    'experiences.epsight.achievements.3': 'Résolution de tickets de niveau 2 et 3 liés aux infrastructures systèmes et participation à des projets d\'installation et de configuration.',
    'experiences.epsight.achievements.4': 'Participation à la gestion de projets d\'infrastructure, sauvegarde, installation de matériel et configuration de systèmes.',


    'experiences.troublanc.title': 'Développeur FullStack chez Troublanc',
    'experiences.troublanc.company': 'Troublanc',
    'experiences.troublanc.period': 'Jan 2024 - Fév 2024',
    'experiences.troublanc.description': 'Stage de développement FullStack avec création d\'une mosaïque de produits sur WordPress et développement d\'une application de monitoring.',
    'experiences.troublanc.achievements.1': 'Refonte du site vitrine www.troublanc.com sur Wordpress.',
    'experiences.troublanc.achievements.2': 'Développement d\'une application de monitoring pour Raspberry Pi',
    'experiences.troublanc.achievements.3': 'Amélioration de l\'expérience utilisateur du site web',
    'experiences.troublanc.achievements.4': 'Intégration de nouvelles fonctionnalités et optimisation des performances du site web',

    'experiences.kereisweb.title': 'Webdesigner/Employé Administratif chez Kereis',
    'experiences.kereisweb.company': 'Kereis',
    'experiences.kereisweb.period': 'Juil 2023 - Sept 2023',
    'experiences.kereisweb.description': 'Création d\'un site interne de partage de documents et refonte de documents clients.',
    'experiences.kereisweb.achievements.1': 'Création d\'un site interne de partage de documents',
    'experiences.kereisweb.achievements.2': 'Refonte de documents à destination des clients',
    'experiences.kereisweb.achievements.3': 'Amélioration des processus internes',
    'experiences.kereisweb.achievements.4': 'Formation aux outils de design',

    'experiences.kereissecurity.title': 'Ingénieur Cybersécurité chez Kereis',
    'experiences.kereissecurity.company': 'Kereis',
    'experiences.kereissecurity.period': 'Mai 2023 - Juin 2023',
    'experiences.kereissecurity.description': 'Stage en cybersécurité avec mise en place de solutions sécurisées et réalisation de tests d\'intrusion.',
    'experiences.kereissecurity.achievements.1': 'Mise en place d\'une solution de partage de fichiers sécurisée chiffrée end-to-end',
    'experiences.kereissecurity.achievements.2': 'Réalisation d\'un Pentest (test d\'intrusion)',
    'experiences.kereissecurity.achievements.3': 'Participation à une campagne de sensibilisation au phishing',
    'experiences.kereissecurity.achievements.4': 'Traduction de documents techniques en anglais',

    'experiences.epsi.title': 'Étudiant en Informatique - EPSI',
    'experiences.epsi.company': 'EPSI Nantes',
    'experiences.epsi.period': '2022 - Présent',
    'experiences.epsi.description': 'Formation en informatique avec spécialisation en développement puis réseaux. Membre actif du BDE.',
    'experiences.epsi.achievements.1': 'Membre du BDE (Bureau Des Étudiants)',
    'experiences.epsi.achievements.2': 'Conception et développement d\'applications Web et Objets',
    'experiences.epsi.achievements.3': 'Mise en place de l\'infrastructure réseau et système',
    'experiences.epsi.achievements.4': 'Gestion et analyse de données digitales',
    
    // Projects Section
    'projects.title': 'Projets Phares',
    'projects.subtitle': 'Présentation d\'implémentations pratiques et de solutions innovantes',
    'projects.achievements': 'Fonctionnalités Clés :',
    'projects.technologies': 'Technologies Utilisées :',
    'projects.viewCode': 'Voir le Code',
    'projects.liveDemo': 'Démo Live',
    
    // Project Details
    'projects.monitorflow.title': 'MonitorFlow',
    'projects.monitorflow.description': 'Une application complète de monitoring de serveurs qui surveille les performances et envoie des alertes en cas de problème.',
    'projects.monitorflow.achievement1': 'Monitoring serveur en temps réel',
    'projects.monitorflow.achievement2': 'Système d\'alertes automatisé',
    'projects.monitorflow.achievement3': 'Compatibilité multi-plateforme',
    
    'projects.drone.title': 'Drone Autonome',
    'projects.drone.description': 'Développement d\'un drone contrôlable avec une manette XBOX et capable de vol autonome utilisant des algorithmes de navigation avancés.',
    'projects.drone.achievement1': 'Intégration manette XBOX',
    'projects.drone.achievement2': 'Capacités de vol autonome',
    'projects.drone.achievement3': 'Télémétrie en temps réel',
    
    'projects.astraso.title': 'Réseau Social Astraso',
    'projects.astraso.description': 'Une plateforme de réseau social pour partager des histoires de retards insolites, construite en projet de groupe durant la deuxième année à l\'EPSI.',
    'projects.astraso.achievement1': 'Système d\'authentification utilisateur',
    'projects.astraso.achievement2': 'Plateforme de partage de contenu',
    'projects.astraso.achievement3': 'Design web responsive',
    
    'projects.security.title': 'Projets Cybersécurité',
    'projects.security.description': 'Divers projets de cybersécurité incluant tests de pénétration, solutions de partage de fichiers sécurisées et campagnes de sensibilisation au phishing.',
    'projects.security.achievement1': 'Partage de fichiers chiffré bout en bout',
    'projects.security.achievement2': 'Rapports de tests de pénétration',
    'projects.security.achievement3': 'Campagnes de sensibilisation sécurité',
    
    // Skills Section
    'certifications.title': 'Compétences & Technologies',
    'certifications.subtitle': 'Expertise technique dans plusieurs domaines et langages de programmation',
    'certifications.verify': 'Voir le Projet',
    'certifications.training': 'Technologies Principales',
    'certifications.completed': 'Maîtrisé',
    'certifications.inProgress': 'En Apprentissage',
    
    // Contact Section
    'contact.title': 'Connectons-nous',
    'contact.subtitle': 'Prêt à discuter d\'opportunités, de collaborations, ou simplement à réseauter avec un passionné',
    'contact.getInTouch': 'Entrer en Contact',
    'contact.description': 'Je suis toujours ouvert à discuter de nouvelles opportunités, partager des connaissances, ou collaborer sur des projets intéressants. Que vous recherchiez un étudiant développeur motivé ou souhaitiez vous connecter avec quelqu\'un passionné par la technologie, j\'aimerais avoir de vos nouvelles.',
    'contact.email': 'Email',
    'contact.phone': 'Téléphone',
    'contact.location': 'Localisation',
    'contact.sendMessage': 'Envoyer un Message',
    'contact.name': 'Votre Nom',
    'contact.email.label': 'Votre Email',
    'contact.subject': 'Sujet',
    'contact.message': 'Message',
    'contact.send': 'Envoyer le Message',
    'contact.sending': 'Envoi en cours...',
    'contact.success': 'Merci pour votre message ! Je vous répondrai dans les 24-48 heures.',
    'contact.error': 'Échec de l\'envoi du message. Veuillez réessayer.',
    'contact.required': 'Tous les champs sont requis',
    'contact.invalidEmail': 'Veuillez entrer une adresse email valide',
    'contact.footer': '© 2025 Alban Mary',
    
    // Form placeholders
    'form.name.placeholder': 'Jean Dupont',
    'form.email.placeholder': 'jean@exemple.com',
    'form.subject.placeholder': 'Discussion d\'Opportunité',
    'form.message.placeholder': 'J\'aimerais discuter de...',
    
    // Status labels
    'status.certified': 'Terminé',
    'status.studying': 'En Cours',
    'status.planned': 'Planifié',
    'status.trainee': 'Stage',
    'status.fulltime': 'Temps Plein',
    'status.cdd': 'CDD',
    'status.apprenticeship': 'Alternance',
    'status.internship': 'Stage',
    'status.education': 'Éducation',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fr');

  useEffect(() => {
    // Check for saved language preference
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fr')) {
      setLanguage(savedLanguage);
    } else {
      // Default to French since this is Alban's portfolio
      setLanguage('fr');
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};