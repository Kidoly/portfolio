import Hero from '@/components/Hero'
import About from '@/components/About'
import Experience from '@/components/Experience'
import Projects from '@/components/Projects'
import Certifications from '@/components/Certifications'
import Contact from '@/components/Contact'
import Infrastructure from '@/components/Infrastructure'
import ScrollReveal from '@/components/ScrollReveal'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Hero />
      <ScrollReveal>
        <About />
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <Experience />
      </ScrollReveal>
      <ScrollReveal delay={0.2}>
        <Projects />
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <Infrastructure />
      </ScrollReveal>
      <ScrollReveal delay={0.2}>
        <Certifications />
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <Contact />
      </ScrollReveal>
    </main>
  )
}