import StudyHubLogo from './StudyHubLogo';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <a href="/" style={{ textDecoration: 'none' }}>
            <StudyHubLogo size={36} textSize={18} />
          </a>

          {/* Navigation Links */}
          <div className="hidden md:flex gap-8 items-center">
            <a href="#features" className="text-slate-300 font-medium hover:text-blue-400 transition text-sm">
              Features
            </a>
            <a href="#how" className="text-slate-300 font-medium hover:text-blue-400 transition text-sm">
              How it Works
            </a>
            <a href="#contact" className="text-slate-300 font-medium hover:text-blue-400 transition text-sm">
              Contact
            </a>
            <a
              href="/auth"
              className="px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/30 transition"
            >
              Login
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
