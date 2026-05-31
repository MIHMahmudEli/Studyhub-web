'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import HowItWorks from '@/components/home/HowItWorks';
import Contact from '@/components/home/Contact';
import Footer from '@/components/layout/Footer';
import ScrollToTopButton from '@/components/ui/ScrollToTopButton';

export default function Home() {
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const { darkThemeVariant } = useTheme();

  useEffect(() => {
    const onScroll = () => setShowScrollBtn(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div data-theme="dark" data-theme-variant={darkThemeVariant} className="min-h-screen overflow-x-hidden relative transition-colors duration-500" style={{ backgroundColor: 'var(--background)', backgroundImage: 'var(--bg-image)', backgroundAttachment: 'fixed' }}>
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
