import StudyHubLogo from '@/components/ui/StudyHubLogo';

const footerLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#how' },
  { label: 'Contact', href: '#contact' },
  { label: 'Sign In', href: '/auth' },
];

const S = {
  footer: {
    borderTop: '1px solid rgba(255,255,255,0.05)',
    background: '#030507',
    padding: '64px 24px',
  },
  container: {
    maxWidth: 1120,
    margin: '0 auto',
  },
  top: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 40,
    flexWrap: 'wrap',
    marginBottom: 56,
  },
  brand: { maxWidth: 300 },
  tagline: { fontSize: 14, color: '#334155', lineHeight: 1.7, marginTop: 12 },
  navCol: {},
  navLabel: { fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1e293b', marginBottom: 16, display: 'block' },
  linkList: { display: 'flex', flexDirection: 'column', gap: 10 },
  footerLink: { fontSize: 14, color: '#334155', textDecoration: 'none', transition: 'color 0.2s' },
  bottom: {
    borderTop: '1px solid rgba(255,255,255,0.03)',
    paddingTop: 24,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  copy: { fontSize: 13, color: '#1e293b' },
};

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
    <footer style={S.footer}>
      <div style={S.container}>
        <div style={S.top}>
          <div style={S.brand}>
            <a href="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 12 }}>
              <StudyHubLogo size={32} textSize={16} />
            </a>
            <p style={S.tagline}>
              Empowering students to learn collaboratively, share knowledge, and grow academically — together.
            </p>
          </div>
          <div style={S.navCol}>
            <span style={S.navLabel}>Navigate</span>
            <div style={S.linkList}>
              {footerLinks.map(l => (
                <a 
                  key={l.href} 
                  href={l.href} 
                  style={S.footerLink}
                  className="hover:text-gray-400 hover:translate-x-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  onClick={(e) => handleScroll(e, l.href)}
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div style={S.bottom}>
          <p style={S.copy}>© {new Date().getFullYear()} StudyHub. All rights reserved.</p>
          <p style={S.copy}>Crafted for academic excellence</p>
        </div>
      </div>
    </footer>
  );
}
