'use client';

import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export default function Home() {
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollBtn(true);
      } else {
        setShowScrollBtn(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Background Blobs */}
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>
      
      {/* Decorative Circles - Hidden on mobile, visible on lg and above */}
      <div className="hidden lg:block decor-circle dc-1"></div>
      <div className="hidden lg:block decor-circle dc-2"></div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-black/85 backdrop-blur-xl border-b border-white/12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent whitespace-nowrap">
              🎓 StudyHub
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex gap-8 items-center">
              <a href="#features" className="text-white/90 font-semibold hover:text-blue-400 transition">
                Features
              </a>
              <a href="#how" className="text-white/90 font-semibold hover:text-blue-400 transition">
                How it Works
              </a>
              <a href="#contact" className="text-white/90 font-semibold hover:text-blue-400 transition">
                Contact
              </a>
              <a
                href="/auth"
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:shadow-lg transition"
              >
                Login
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 text-center relative">
        <div className="fade-up max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight tracking-tight">
            Learn, Share & <span className="text-blue-400">Grow</span>
            <br />
            Together
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Join thousands of students sharing high-quality academic notes and resources. The ultimate platform for collaborative learning.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/auth#register"
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/50 transition transform hover:-translate-y-1"
            >
              Start Collaborating
            </a>
            <a
              href="#features"
              className="px-8 py-4 border-2 border-slate-600 rounded-xl font-bold text-lg hover:border-blue-400 transition"
            >
              Explore Community
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 fade-up">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Designed for <span className="text-blue-400">Everyone</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Experience a seamless academic collaboration environment designed for every role.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Student Card */}
            <div className="fade-up bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-blue-400/50 hover:-translate-y-2 transition group">
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 text-3xl group-hover:bg-blue-500/30 transition">
                👨‍🎓
              </div>
              <h3 className="text-2xl font-bold mb-3">Student</h3>
              <p className="text-slate-400">
                Access thousands of lecture notes, slides, and exam resources. Share yours and earn badges.
              </p>
            </div>

            {/* Moderator Card */}
            <div className="fade-up bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-purple-400/50 hover:-translate-y-2 transition group">
              <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 text-3xl group-hover:bg-purple-500/30 transition">
                🔍
              </div>
              <h3 className="text-2xl font-bold mb-3">Moderator</h3>
              <p className="text-slate-400">
                Maintain the highest quality of content. Review uploads and guide the community growth.
              </p>
            </div>

            {/* Administrator Card */}
            <div className="fade-up bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-cyan-400/50 hover:-translate-y-2 transition group">
              <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center mb-6 text-3xl group-hover:bg-cyan-500/30 transition">
                🛡️
              </div>
              <h3 className="text-2xl font-bold mb-3">Administrator</h3>
              <p className="text-slate-400">
                Analyze trends, manage users, and generate comprehensive platform activity reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 fade-up">
            <h2 className="text-4xl md:text-5xl font-black">
              Simple <span className="text-blue-400">Workflow</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="fade-up bg-slate-900/30 border border-white/10 rounded-2xl p-8">
              <div className="text-5xl font-black text-white/10 mb-4">01</div>
              <h4 className="text-2xl font-bold mb-3">Quick Register</h4>
              <p className="text-slate-400">
                Create your account in seconds and verify your student status via OTP.
              </p>
            </div>

            {/* Step 2 */}
            <div className="fade-up bg-slate-900/30 border border-white/10 rounded-2xl p-8">
              <div className="text-5xl font-black text-white/10 mb-4">02</div>
              <h4 className="text-2xl font-bold mb-3">Share Knowledge</h4>
              <p className="text-slate-400">
                Upload your best notes or slides and let them help others across the globe.
              </p>
            </div>

            {/* Step 3 */}
            <div className="fade-up bg-slate-900/30 border border-white/10 rounded-2xl p-8">
              <div className="text-5xl font-black text-white/10 mb-4">03</div>
              <h4 className="text-2xl font-bold mb-3">Level Up</h4>
              <p className="text-slate-400">
                Gain reputation points, earn certifications, and climb the leaderboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact/Social Section */}
      <section id="contact" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 fade-up">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Join the <span className="text-blue-400">Circle</span>
            </h2>
            <p className="text-slate-400 text-lg">
              Stay updated with our latest resources and community announcements.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* YouTube */}
            <a
              href="https://www.youtube.com/@studyhub991"
              target="_blank"
              rel="noopener noreferrer"
              className="fade-up bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-8 text-center hover:border-red-500 hover:shadow-lg hover:shadow-red-500/20 hover:-translate-y-1 transition group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition">📺</div>
              <h5 className="font-bold text-lg mb-1">YouTube</h5>
              <p className="text-slate-400 text-sm">Tutorials & More</p>
            </a>

            {/* Telegram */}
            <a
              href="https://t.me/studyhub991"
              target="_blank"
              rel="noopener noreferrer"
              className="fade-up bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-8 text-center hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-1 transition group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition">✈️</div>
              <h5 className="font-bold text-lg mb-1">Telegram</h5>
              <p className="text-slate-400 text-sm">Download Resources</p>
            </a>

            {/* Email */}
            <a
              href="mailto:studyhubteam.official@gmail.com"
              className="fade-up bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-8 text-center hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-1 transition group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition">✉️</div>
              <h5 className="font-bold text-lg mb-1">Email Us</h5>
              <p className="text-slate-400 text-sm">Direct Support</p>
            </a>

            {/* Facebook */}
            <a
              href="https://fb.com/mihmahmudali"
              target="_blank"
              rel="noopener noreferrer"
              className="fade-up bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-8 text-center hover:border-blue-600 hover:shadow-lg hover:shadow-blue-600/20 hover:-translate-y-1 transition group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition">f</div>
              <h5 className="font-bold text-lg mb-1">Facebook</h5>
              <p className="text-slate-400 text-sm">Developer Profile</p>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950/50 py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-3xl font-black mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            🎓 StudyHub
          </div>
          <p className="text-slate-400 mb-4">
            Empowering peer-to-peer learning through collaboration and shared knowledge.
          </p>
          <div className="border-t border-white/10 pt-6 mt-6">
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} StudyHub. All rights reserved. <br />
              Crafted for academic excellence.
            </p>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button - Responsive sizing */}
      <button
        onClick={scrollToTop}
        className={`fixed sm:bottom-8 sm:right-8 bottom-5 right-5 sm:w-14 sm:h-14 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center hover:bg-purple-600 transition transform hover:scale-110 z-40 ${
          showScrollBtn ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <ChevronUp className="w-6 h-6 text-white" />
      </button>
    </div>
  );
}
