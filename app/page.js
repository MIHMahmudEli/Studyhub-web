'use client';

import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ScrollToTopButton from './components/ScrollToTopButton';

export default function Home() {
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollBtn(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#06080f', color: '#e8eaf0', overflowX: 'hidden', position: 'relative' }}>
      {/* Ambient glow orbs */}
      <div style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: 700, height: 700, background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-15%', right: '-10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Contact />
      </main>
      <Footer />
      <ScrollToTopButton showScrollBtn={showScrollBtn} onScrollToTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
    </div>
  );
}
