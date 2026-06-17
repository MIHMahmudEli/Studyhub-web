'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import StudyHubLogo from '@/components/ui/StudyHubLogo';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollTo = (e, id) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 64;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const navLinks = [
    { label: 'Features', id: 'features' },
    { label: 'How it Works', id: 'how' },
    { label: 'Videos', id: 'videos' },
    { label: 'Community', id: 'contact' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        scrolled 
          ? 'bg-[var(--background)]/80 backdrop-blur-2xl border-b border-[var(--border)] py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      {/* Navbar space glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent shadow-[0_0_20px_rgba(59,130,246,0.3)]" />
      <div className="absolute top-0 left-1/4 w-[300px] h-[100px] bg-[var(--nebula-1)] blur-[60px] rounded-full -z-10 animate-nebula" />
      <div className="max-w-[1120px] mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="transition-transform duration-300 hover:scale-105 active:scale-95">
          <StudyHubLogo size={32} textSize={18} />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => handleScrollTo(e, link.id)}
              className="px-4 py-2 text-[var(--text-2)] font-medium text-sm no-underline rounded-lg transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] hover:-translate-y-[1px]"
            >
              {link.label}
            </a>
          ))}
          <Link 
            href="/auth" 
            className="ml-3 px-5 py-2 bg-blue-600 text-white font-semibold text-sm no-underline rounded-[10px] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] whitespace-nowrap shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:bg-blue-700 hover:-translate-y-[3px] hover:shadow-[0_12px_24_rgba(37,99,235,0.45)]"
          >
            Get Started
          </Link>
        </div>

        {/* Hamburger */}
        <button 
          className="md:hidden w-10 h-10 flex flex-col justify-center items-center gap-1.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] transition-colors hover:bg-[var(--surface)]"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className={`block w-5 h-0.5 bg-[var(--text-2)] rounded-full transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-[var(--text-2)] rounded-full transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-[var(--text-2)] rounded-full transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile Dropdown */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] bg-[var(--card-bg)] backdrop-blur-2xl border-b border-[var(--card-border)] ${
          mobileMenuOpen ? 'max-h-[300px] py-4' : 'max-h-0'
        }`}
      >
        <div className="flex flex-col gap-1 px-6">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => handleScrollTo(e, link.id)}
              className="py-3 text-[var(--text-2)] font-medium text-base no-underline transition-colors hover:text-[var(--foreground)]"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/auth"
            className="mt-4 px-5 py-3 bg-blue-600 text-white font-bold text-center rounded-xl no-underline"
            onClick={() => setMobileMenuOpen(false)}
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
