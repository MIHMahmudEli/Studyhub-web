'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/home/Hero';
import Preview from '@/components/home/Preview';
import Highlights from '@/components/home/Highlights';
import Features from '@/components/home/Features';
import HowItWorks from '@/components/home/HowItWorks';
import Videos from '@/components/home/Videos';
import Downloads from '@/components/home/Downloads';
import Contact from '@/components/home/Contact';
import Footer from '@/components/layout/Footer';
import ScrollToTopButton from '@/components/ui/ScrollToTopButton';

export default function Home() {
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const { darkThemeVariant, preview } = useTheme();
  const variant = preview?.variant || darkThemeVariant;

  useEffect(() => {
    const onScroll = () => setShowScrollBtn(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div data-theme="dark" data-theme-variant={variant} className="min-h-screen overflow-x-hidden relative transition-colors duration-500" style={{ background: 'none', backgroundColor: 'transparent' }}>
      <div className="fixed inset-0 -z-10" style={{ backgroundColor: 'var(--background)', backgroundImage: 'var(--bg-image)', backgroundAttachment: 'fixed' }} />
      <Navbar />
      <main>
        <Hero />
        <Preview />
        <Highlights />
        <Features />
        <HowItWorks />
        <Videos />
        <Downloads />
        <Contact />
      </main>
      <Footer />
      <ScrollToTopButton showScrollBtn={showScrollBtn} onScrollToTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
    </div>
  );
}
