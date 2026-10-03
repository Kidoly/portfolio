"""Alban Mary's one-page CV (public/Alban_Mary_CV.pdf): readable first, real text in reading order for ATS.

Usage: pip install reportlab && python scripts/cv/build_cv.py [output.pdf]
Fonts: Archivo and IBM Plex Mono, SIL Open Font License (see fonts/).
"""
import sys
from functools import partial
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

HERE = Path(__file__).parent
OUT = sys.argv[1] if len(sys.argv) > 1 else str(HERE.parents[1] / 'public' / 'Alban_Mary_CV.pdf')

for name, file in [('Archivo', 'Archivo-Regular.ttf'), ('Archivo-SemiBold', 'Archivo-SemiBold.ttf'),
                   ('Archivo-ExtraBold', 'Archivo-ExtraBold.ttf'), ('Plex', 'IBMPlexMono-Regular.ttf')]:
    pdfmetrics.registerFont(TTFont(name, HERE / 'fonts' / file))
pdfmetrics.registerFontFamily('Archivo', normal='Archivo', bold='Archivo-SemiBold', italic='Archivo', boldItalic='Archivo-SemiBold')

INK, TEXT, MUTED, ACCENT = HexColor('#141414'), HexColor('#2a2a28'), HexColor('#6b6863'), HexColor('#c52012')

PAGE_W = A4[0]
MARGIN = 18 * mm
DATE_COL = 33 * mm
FRAME_PAD = 6  # SimpleDocTemplate frame padding, on each side
CONTENT_W = PAGE_W - 2 * MARGIN - 2 * FRAME_PAD - DATE_COL

name_s = ParagraphStyle('name', fontName='Archivo-ExtraBold', fontSize=28, leading=29, textColor=INK)
role_s = ParagraphStyle('role', fontName='Archivo-SemiBold', fontSize=13, leading=17, textColor=INK, spaceBefore=4)
contact_s = ParagraphStyle('contact', fontName='Archivo', fontSize=9, leading=13, textColor=MUTED, spaceBefore=4)
links_s = ParagraphStyle('links', parent=contact_s, spaceBefore=0)
intro_s = ParagraphStyle('intro', fontName='Archivo', fontSize=10.5, leading=15.5, textColor=TEXT, spaceBefore=10)
section_s = ParagraphStyle('section', fontName='Plex', fontSize=9.5, leading=12, textColor=ACCENT, spaceBefore=10.5, spaceAfter=6)
date_s = ParagraphStyle('date', fontName='Plex', fontSize=8.5, leading=13, textColor=MUTED)
title_s = ParagraphStyle('title', fontName='Archivo-SemiBold', fontSize=10.5, leading=14, textColor=INK)
org_s = ParagraphStyle('org', fontName='Archivo', fontSize=9.5, leading=13, textColor=MUTED, spaceAfter=2)
text_s = ParagraphStyle('text', fontName='Archivo', fontSize=9.5, leading=13.5, textColor=TEXT)
bullet_s = ParagraphStyle('bullet', parent=text_s, leftIndent=10, firstLineIndent=-10, spaceAfter=1.5)
skill_s = ParagraphStyle('skill', parent=text_s, spaceAfter=2)


def link(url: str, label: str) -> str:
    return f'<a href="{url}" color="#6b6863">{label}</a>'


def org(text: str) -> str:
    """Employer (and details) on the title line, in the muted body style."""
    return f'<font name="Archivo" size="9.5" color="#6b6863">· {text}</font>'


def bullets(items):
    """Bullets drawn inside each line of text (hanging indent), so extraction keeps "• text" together."""
    return [Paragraph(f'•  {t}', bullet_s) for t in items]


def row(date: str, content: list, gap: float = 9):
    """Date in a narrow left column, content on the right."""
    t = Table([[Paragraph(date, date_s), content]], colWidths=[DATE_COL, CONTENT_W], hAlign='LEFT')
    t.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0), ('BOTTOMPADDING', (0, 0), (-1, -1), gap),
    ]))
    return t


story = [
    Paragraph('Alban Mary<font color="#c52012">.</font>', name_s),
    Paragraph('Ingénieur systèmes et réseaux', role_s),
    Paragraph(' · '.join([
        'Nantes',
        'Permis B, véhiculé',
        '07 50 04 96 13',
        link('mailto:alban.mary1@gmail.com', 'alban.mary1@gmail.com'),
    ]), contact_s),
    Paragraph(' · '.join([
        link('https://albanmary.com/?utm_source=cv', 'albanmary.com'),
        link('https://www.linkedin.com/in/alban-mary/', 'linkedin.com/in/alban-mary'),
        link('https://github.com/Kidoly', 'github.com/Kidoly'),
    ]), links_s),
    Paragraph(
        'En alternance depuis plus de deux ans chez Epsight, hébergeur et infogéreur, je porte des sujets de bout en '
        'bout, du réseau à la sauvegarde, et je sais les expliquer au client comme à ma direction. '
        '<b>Je recherche un CDI d’ingénieur systèmes et réseaux dès octobre 2027, partout en France ou en télétravail.</b>',
        intro_s,
    ),

    Paragraph('Expérience', section_s),
    row('août 2024 - auj.', [
        Paragraph('Ingénieur systèmes et réseaux, alternance', title_s),
        Paragraph('Epsight · infogérance et hébergement · environ 500 VM sur 2 datacenters', org_s),
        *bullets([
            'Support N2/N3 sur les infrastructures clients',
            'Remise en service d’un cluster Exchange 2019 en moins de 2 h après une perte de quorum, pour plusieurs '
            'centaines d’utilisateurs, puis compte rendu au client',
            'Mise en place de l’Infrastructure as Code (GitLab CI, Vault, Ansible, Terraform) : une VM déployée en '
            'quelques minutes au lieu de plusieurs heures',
            'Conception (en cours) d’un portail de PRA multi-clients sur Veeam, avec VLAN de restauration isolé et '
            'note d’arbitrage pour la direction',
            'Étude RMM pour environ 500 VM (grille pondérée, budget, pilote) : N-central déployé',
            'E-mails rétablis vers un grand FAI : reverse DNS délégué au RIPE, PTR/HELO alignés',
        ]),
    ], gap=10),
    row('juil. 2024<br/>juil.-sept. 2023', [
        Paragraph(f'Support informatique et webdesign, CDD {org("Kereis")}', title_s),
        Paragraph('Support utilisateurs, préparation de postes, site interne SharePoint.', text_s),
    ], gap=10),
    row('janv.-févr. 2024', [
        Paragraph(f'Stage développement web {org("Troublanc · site vitrine, monitoring sur Raspberry Pi")}', title_s),
    ], gap=10),
    row('mai-juin 2023', [
        Paragraph(f'Stage en cybersécurité {org("Kereis")}', title_s),
        Paragraph('Test d’intrusion, partage de fichiers chiffré, sensibilisation au phishing.', text_s),
    ], gap=0),

    Paragraph('Projets', section_s),
    row('Perso', [Paragraph(
        '<b>Homelab en service 24/7</b> : cluster Proxmox de 3 nœuds avec Ceph sur 10 GbE, Kubernetes, '
        f'GitLab, Vault et Authentik. Il héberge mon blog technique ({link("https://albanmary.com/blog/?utm_source=cv", "albanmary.com")}).',
        text_s)], gap=6),
    row('EPSI', [Paragraph(
        '<b>Infrastructure multi-sites</b> : IPsec, Active Directory, RDS, supervision et PRA. En équipe de 3, '
        'j’en ai monté l’essentiel sur mon homelab.', text_s)], gap=6),
    row('EPSI', [Paragraph(
        '<b>Virtualisation d’un CHU (cas d’école)</b> : VMware, Nutanix ou Proxmox, TCO sur 5 ans.',
        text_s)], gap=0),

    Paragraph('Compétences', section_s),
    row('Réseau', [Paragraph('Arista (BGP, VXLAN), IPsec, VLAN, HAProxy, OPNsense', skill_s)], gap=2),
    row('Systèmes', [Paragraph('Windows Server, Active Directory, Exchange, Linux (Debian)', skill_s)], gap=2),
    row('Virtualisation', [Paragraph('Proxmox, Ceph, VMware vSphere, Veeam, Docker, Kubernetes (homelab)', skill_s)], gap=2),
    row('Automatisation', [Paragraph('Ansible, Terraform, GitLab CI, PowerShell, Python', skill_s)], gap=2),
    row('Supervision', [Paragraph('PRTG, Zabbix, HaloPSA et GLPI (ITSM)', skill_s)], gap=2),
    row('Sécurité', [Paragraph('FortiGate, PKI, HashiCorp Vault, Authentik (SSO)', skill_s)], gap=2),
    row('Langues', [Paragraph('Français, anglais courant (C1), notions d’espagnol et de japonais', skill_s)], gap=0),

    Paragraph('Formation', section_s),
    row('2025 - 2027', [
        Paragraph('Expert en informatique et système d’information', title_s),
        Paragraph('EPSI Nantes · Bac+5, titre RNCP de niveau 7 · en cours', org_s),
    ], gap=5),
    row('2022 - 2025', [
        Paragraph('Administrateur systèmes, réseaux et bases de données', title_s),
        Paragraph('EPSI Nantes · Bac+3, titre RNCP de niveau 6 · obtenu', org_s),
    ], gap=0),
]

doc = SimpleDocTemplate(
    OUT, pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN, topMargin=11 * mm, bottomMargin=9 * mm,
    title='Alban Mary - CV Ingénieur systèmes et réseaux', author='Alban Mary',
    subject='CV - Ingénieur systèmes et réseaux', creator='Alban Mary', lang='fr-FR',
    keywords='ingénieur systèmes et réseaux, Proxmox, Ceph, FortiGate, Veeam, Windows Server, Active Directory, '
             'Ansible, Terraform, N-central, CDI octobre 2027',
)
doc.build(story, canvasmaker=partial(Canvas, initialFontName='Archivo', initialFontSize=9.5))
print(OUT)
