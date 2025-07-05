import Hero from '@/components/Hero'
import About from '@/components/About'
import Experience from '@/components/Experience'
import Projects from '@/components/Projects'
import Certifications from '@/components/Certifications'
import Contact from '@/components/Contact'
import Infrastructure from '@/components/Infrastructure'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Hero />
      <About />
      <Experience />
      <Projects />
      <Infrastructure />
      <Certifications />
      <Contact />
    </main>
  )
}