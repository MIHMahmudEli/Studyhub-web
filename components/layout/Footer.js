'use client';

import StudyHubLogo from '@/components/ui/StudyHubLogo';

const footerLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#how' },
  { label: 'Videos', href: '#videos' },
  { label: 'Contact', href: '#contact' },
  { label: 'Sign In', href: '/auth' },
];

export default function Footer() {
  const handleScroll = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const id = href.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        const offset = 64;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="border-t border-[var(--border)] py-16 px-6 relative overflow-hidden">
      <div className="max-w-[1120px] mx-auto relative z-10">
        <div className="flex justify-between items-start gap-10 flex-wrap mb-14">
          <div className="max-w-[300px]">
            <a href="/" className="no-underline inline-block mb-3">
              <StudyHubLogo size={32} textSize={16} />
            </a>
            <p className="text-sm text-[var(--text-2)] leading-relaxed mt-3">
              Empowering students to learn collaboratively, share knowledge, and grow academically — together.
            </p>
          </div>
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-[var(--text-1)] mb-4 block">
              Navigate
            </span>
            <div className="flex flex-col gap-2.5">
              {footerLinks.map(l => (
                <a 
                  key={l.href} 
                  href={l.href} 
                  className="text-sm text-[var(--text-2)] no-underline transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-[var(--text-1)] hover:translate-x-2"
                  onClick={(e) => handleScroll(e, l.href)}
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-[var(--border)]/60 pt-6 flex justify-between items-center flex-wrap gap-4">
          <p className="text-[13px] text-[var(--text-2)]">&copy; {new Date().getFullYear()} StudyHub. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="/privacy" className="text-[13px] text-[var(--text-2)] hover:text-[var(--text-1)] no-underline transition-all duration-300">Privacy Policy</a>
            <span className="text-[var(--border-h)] text-[13px]">&bull;</span>
            <a href="/terms" className="text-[13px] text-[var(--text-2)] hover:text-[var(--text-1)] no-underline transition-all duration-300">Terms of Service</a>
          </div>
          <p className="text-[13px] text-[var(--text-2)]">Crafted for academic excellence</p>
        </div>
      </div>
    </footer>
  );
}
