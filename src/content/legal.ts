import { CONTACT_EMAIL, HOSTING } from '@/config/legal';

/**
 * Legal notice and privacy policy, FR + EN. Inline links use the markdown
 * form [label](href). Retention periods follow CNIL recommendations.
 */

export type LegalBlock = string | { list: string[] };

export interface LegalSection {
  title: string;
  blocks: LegalBlock[];
}

export interface LegalDoc {
  label: string;
  title: string;
  description: string;
  intro: string;
  sections: LegalSection[];
}

export type LegalDocId = 'mentions' | 'privacy';

const MAIL = `[${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL})`;

const hostingFr = HOSTING
  ? [`${HOSTING.name} - ${HOSTING.address}${HOSTING.phone ? ` - ${HOSTING.phone}` : ''}.`]
  : ['À compléter : nom, adresse et téléphone de l’hébergeur.'];

const hostingEn = HOSTING
  ? [`${HOSTING.name} - ${HOSTING.address}${HOSTING.phone ? ` - ${HOSTING.phone}` : ''}.`]
  : ['To be completed: name, address and phone number of the hosting provider.'];

export const LEGAL: Record<'fr' | 'en', Record<LegalDocId, LegalDoc>> = {
  fr: {
    mentions: {
      label: 'Légal',
      title: 'Mentions légales',
      description: 'Mentions légales du site albanmary.com : éditeur, hébergeur et contact.',
      intro: 'Informations légales relatives au site albanmary.com (portfolio et blog).',
      sections: [
        {
          title: 'Éditeur',
          blocks: [
            'Ce site est édité par Alban Mary, à titre personnel et non professionnel.',
            `Contact : ${MAIL}`,
            'Directeur de la publication : Alban Mary.',
          ],
        },
        { title: 'Hébergeur', blocks: hostingFr },
        {
          title: 'Données personnelles',
          blocks: [
            'Les données transmises via le formulaire de contact et les commentaires sont traitées comme décrit dans la [politique de confidentialité](/confidentialite/).',
          ],
        },
        { title: 'Contact', blocks: [`Pour toute question sur le site ou son contenu : ${MAIL}`] },
      ],
    },
    privacy: {
      label: 'Données',
      title: 'Politique de confidentialité',
      description: 'Données collectées sur albanmary.com, finalités, durées de conservation et droits RGPD.',
      intro: 'Quelles données sont collectées sur albanmary.com, pourquoi, combien de temps elles sont conservées et comment exercer vos droits (RGPD).',
      sections: [
        { title: 'Responsable', blocks: [`Alban Mary - ${MAIL}`] },
        {
          title: 'Données collectées',
          blocks: [
            {
              list: [
                'Formulaire de contact : nom, adresse email, sujet et message. Ils me sont transmis par email et un accusé de réception est envoyé à l’adresse indiquée ; ils ne sont pas stockés dans une base de données du site.',
                'Commentaires : nom, commentaire et, si vous la renseignez, adresse email. L’adresse IP est enregistrée avec le commentaire pour lutter contre les abus. Le nom et le commentaire sont publiés après modération ; l’email et l’adresse IP ne sont jamais affichés.',
                'Anti-spam : l’adresse IP est gardée temporairement en mémoire pour limiter le nombre d’envois par visiteur.',
              ],
            },
            'Aucun cookie de mesure d’audience ni publicitaire n’est utilisé. Votre choix de langue est mémorisé dans le stockage local de votre navigateur. Les polices sont servies par le site lui-même.',
          ],
        },
        {
          title: 'Finalités',
          blocks: [
            {
              list: [
                'Répondre à vos demandes de contact (base légale : votre consentement, donné via la case à cocher du formulaire).',
                'Publier et modérer les commentaires (base légale : votre demande de publication).',
                'Assurer la sécurité du site et lutter contre le spam (base légale : intérêt légitime).',
              ],
            },
            'Vos données ne sont ni vendues, ni cédées, ni utilisées à des fins publicitaires. Seul Alban Mary y a accès ; les emails transitent par le serveur de messagerie utilisé pour leur envoi.',
          ],
        },
        {
          title: 'Durée de conservation',
          blocks: [
            {
              list: [
                'Messages de contact : le temps de traiter la demande, puis 3 ans au plus après le dernier échange.',
                'Commentaires, ainsi que l’email et l’adresse IP associés : jusqu’à leur suppression, possible à tout moment sur simple demande.',
                'Données anti-spam en mémoire : 15 minutes au plus.',
              ],
            },
          ],
        },
        {
          title: 'Vos droits',
          blocks: [
            'Conformément au RGPD et à la loi Informatique et Libertés, vous disposez d’un droit d’accès, de rectification, d’effacement, d’opposition, de limitation et de portabilité de vos données. Vous pouvez retirer votre consentement à tout moment.',
            `Pour exercer ces droits, écrivez à ${MAIL} ; une réponse vous sera apportée sous un mois. Vous pouvez aussi adresser une réclamation à la [CNIL](https://www.cnil.fr/fr/plaintes).`,
          ],
        },
        { title: 'Contact', blocks: [`Pour toute question sur vos données : ${MAIL}`] },
      ],
    },
  },
  en: {
    mentions: {
      label: 'Legal',
      title: 'Legal notice',
      description: 'Legal notice of albanmary.com: publisher, hosting provider and contact.',
      intro: 'Legal information about albanmary.com (portfolio and blog).',
      sections: [
        {
          title: 'Publisher',
          blocks: [
            'This website is published by Alban Mary, as a private individual and not for professional purposes.',
            `Contact: ${MAIL}`,
            'Publication director: Alban Mary.',
          ],
        },
        { title: 'Hosting', blocks: hostingEn },
        {
          title: 'Personal data',
          blocks: [
            'Data sent through the contact form and the comments is processed as described in the [privacy policy](/confidentialite/).',
          ],
        },
        { title: 'Contact', blocks: [`For any question about the website or its content: ${MAIL}`] },
      ],
    },
    privacy: {
      label: 'Data',
      title: 'Privacy policy',
      description: 'Data collected on albanmary.com, purposes, retention periods and GDPR rights.',
      intro: 'Which data is collected on albanmary.com, why, how long it is kept and how to exercise your rights (GDPR).',
      sections: [
        { title: 'Controller', blocks: [`Alban Mary - ${MAIL}`] },
        {
          title: 'Data collected',
          blocks: [
            {
              list: [
                'Contact form: name, email address, subject and message. They are sent to me by email and an acknowledgement is sent to the address you provide; they are not stored in a database on the site.',
                'Comments: name, comment and, if you provide it, email address. The IP address is stored with the comment to prevent abuse. Name and comment are published after moderation; the email and IP address are never displayed.',
                'Anti-spam: the IP address is kept temporarily in memory to limit the number of submissions per visitor.',
              ],
            },
            'No analytics or advertising cookies are used. Your language choice is stored in your browser’s local storage. Fonts are served by the site itself.',
          ],
        },
        {
          title: 'Purposes',
          blocks: [
            {
              list: [
                'Answering your contact requests (legal basis: your consent, given through the form checkbox).',
                'Publishing and moderating comments (legal basis: your request to publish).',
                'Keeping the site secure and fighting spam (legal basis: legitimate interest).',
              ],
            },
            'Your data is never sold, shared or used for advertising. Only Alban Mary has access to it; emails go through the mail server used to send them.',
          ],
        },
        {
          title: 'Retention',
          blocks: [
            {
              list: [
                'Contact messages: as long as needed to handle the request, then at most 3 years after the last exchange.',
                'Comments, with the associated email and IP address: until they are deleted, which you can request at any time.',
                'In-memory anti-spam data: 15 minutes at most.',
              ],
            },
          ],
        },
        {
          title: 'Your rights',
          blocks: [
            'Under the GDPR and the French Data Protection Act, you have the right to access, rectify, erase, object to, restrict and port your data. You can withdraw your consent at any time.',
            `To exercise these rights, write to ${MAIL}; you will get an answer within one month. You can also lodge a complaint with the [CNIL](https://www.cnil.fr/en/home), the French data protection authority.`,
          ],
        },
        { title: 'Contact', blocks: [`For any question about your data: ${MAIL}`] },
      ],
    },
  },
};
