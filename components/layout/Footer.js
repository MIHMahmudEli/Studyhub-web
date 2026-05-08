'use client';

import StudyHubLogo from '@/components/ui/StudyHubLogo';

const footerLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#how' },
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
    <footer className="border-t border-white/5 bg-[#030507] py-16 px-6 relative overflow-hidden">
      {/* Footer nebula glow */}
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-purple-600/5 blur-[100px] rounded-full -z-10 animate-nebula" />
      <div className="absolute top-[10%] left-[-5%] w-[300px] h-[300px] bg-blue-600/5 blur-[80px] rounded-full -z-10 animate-nebula [animation-delay:3s]" />

      <div className="max-w-[1120px] mx-auto relative z-10">
        <div className="flex justify-between items-start gap-10 flex-wrap mb-14">
          <div className="max-w-[300px]">
            <a href="/" className="no-underline inline-block mb-3">
              <StudyHubLogo size={32} textSize={16} />
            </a>
            <p className="text-sm text-slate-700 leading-relaxed mt-3">
              Empowering students to learn collaboratively, share knowledge, and grow academically — together.
            </p>
          </div>
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-slate-900 mb-4 block">
              Navigate
            </span>
            <div className="flex flex-col gap-2.5">
              {footerLinks.map(l => (
                <a 
                  key={l.href} 
                  href={l.href} 
                  className="text-sm text-slate-700 no-underline transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-gray-400 hover:translate-x-2"
                  onClick={(e) => handleScroll(e, l.href)}
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-white/[0.03] pt-6 flex justify-between items-center flex-wrap gap-2">
          <p className="text-[13px] text-slate-900">© {new Date().getFullYear()} StudyHub. All rights reserved.</p>
          <p className="text-[13px] text-slate-900">Crafted for academic excellence</p>
        </div>
      </div>
    </footer>
  );
}
