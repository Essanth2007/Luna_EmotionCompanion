import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import About from '@/components/landing/About';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <div className="luna-bg min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <About />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
