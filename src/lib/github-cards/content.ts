import {
  siAnsible,
  siAuthentik,
  siCeph,
  siDebian,
  siDocker,
  siFlutter,
  siFortinet,
  siGitlab,
  siGmail,
  siGnubash,
  siHaproxy,
  siKubernetes,
  siNextdotjs,
  siOpnsense,
  siProxmox,
  siPython,
  siRss,
  siRust,
  siSymfony,
  siTerraform,
  siVault,
  type SimpleIcon,
} from 'simple-icons';

/**
 * What the GitHub profile README cards say (github.com/Kidoly). Each card is served at
 * /github/<name>.svg; the README only lays them out. In English, like the README.
 */

export const HERO = {
  name: 'Alban Mary',
  role: 'Systems & network engineer',
  intro: 'Work-study at Epsight, a hosting and managed services provider, and 5th year at EPSI Nantes.',
  status: 'open to a full-time role · Oct 2027',
  place: 'Nantes, France · or remote',
};

/** Section bands: README order, number and wording. */
export const BANDS = {
  stack: { number: '01', title: 'Stack', desc: 'What I run at work and in the homelab, by area.' },
  projects: { number: '02', title: 'Projects', desc: 'Things I built and keep running.' },
  activity: { number: '03', title: 'Activity', desc: 'Contributions on GitHub, refreshed every 5 minutes.' },
};

/**
 * A tool and its logo; null draws a monogram (no logo in simple-icons, or a wordmark
 * unreadable at 16px, like VMware's and Veeam's).
 */
export type Tool = [label: string, icon: SimpleIcon | null];

export const STACK: Record<string, { area: string; tools: Tool[] }> = {
  virtualisation: {
    area: 'Virtualisation & storage',
    tools: [['Proxmox VE', siProxmox], ['Ceph', siCeph], ['VMware vSphere', null], ['Veeam', null], ['Kubernetes', siKubernetes], ['Docker', siDocker]],
  },
  network: {
    area: 'Network & security',
    tools: [['FortiGate', siFortinet], ['Arista · BGP, VXLAN', null], ['OPNsense', siOpnsense], ['HAProxy', siHaproxy], ['HashiCorp Vault', siVault], ['Authentik SSO', siAuthentik]],
  },
  systems: {
    area: 'Systems',
    tools: [['Debian', siDebian], ['Windows Server', null], ['Active Directory', null], ['Exchange 2019', null]],
  },
  automation: {
    area: 'Automation & monitoring',
    tools: [['Ansible', siAnsible], ['Terraform / OpenTofu', siTerraform], ['GitLab CI', siGitlab], ['PowerShell', null], ['Python', siPython], ['Bash', siGnubash], ['Zabbix / PRTG', null]],
  },
  development: {
    area: 'Development',
    tools: [['Rust', siRust], ['Next.js', siNextdotjs], ['Flutter', siFlutter], ['Symfony', siSymfony]],
  },
};

/** Contact buttons: a logo, a monogram (string) or the site's accent dot (null). */
export const BUTTONS: Record<string, { label: string; mark: SimpleIcon | string | null; primary?: boolean }> = {
  site: { label: 'albanmary.com', mark: null, primary: true },
  linkedin: { label: 'LinkedIn', mark: 'in' },
  mail: { label: 'Email', mark: siGmail },
  rss: { label: 'Blog RSS', mark: siRss },
};
