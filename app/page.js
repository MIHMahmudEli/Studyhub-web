'use client';

import { useState, useEffect } from 'react';
import { ChevronUp, BookOpen, Users, Award, ArrowRight } from 'lucide-react';

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
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="text-xl md:text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent whitespace-nowrap">
              🎓 StudyHub
            </div>

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

      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pb-24 px-4 text-center relative">
        <div className="fade-up max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
            Learn, Share &<br className="hidden sm:block" />
            <span className="text-blue-400"> Grow Together</span>
          </h1>
          <p className="text-base md:text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of students sharing high-quality academic notes and resources. The ultimate platform for collaborative learning.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/auth#register"
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-bold text-base hover:shadow-lg hover:shadow-blue-500/40 transition transform hover:scale-105 inline-flex items-center justify-center gap-2"
            >
              Start Collaborating
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#features"
              className="px-8 py-3 border-2 border-slate-600 rounded-lg font-bold text-base hover:border-blue-400 hover:text-blue-400 transition inline-flex items-center justify-center gap-2"
            >
              Explore Community
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28 px-4 bg-gradient-to-b from-transparent via-blue-950/5 to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 fade-up">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4">
              Built for <span className="text-blue-400">Everyone</span>
            </h2>
            <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
              Experience seamless collaboration designed for every role
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Student Card */}
            <div className="fade-up group">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900/50 border border-slate-700 hover:border-blue-500/50 rounded-xl p-8 h-full transition duration-300 hover:shadow-lg hover:shadow-blue-500/10">
                <div className="w-14 h-14 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6 text-2xl group-hover:bg-blue-500/30 transition">
                  <BookOpen className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">Student</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Access thousands of lecture notes and exam resources. Share knowledge and earn badges.
                </p>
              </div>
            </div>

            {/* Moderator Card */}
            <div className="fade-up group">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900/50 border border-slate-700 hover:border-purple-500/50 rounded-xl p-8 h-full transition duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                <div className="w-14 h-14 bg-purple-500/20 rounded-lg flex items-center justify-center mb-6 text-2xl group-hover:bg-purple-500/30 transition">
                  <Users className="w-7 h-7 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">Moderator</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Maintain content quality. Review uploads and guide community growth.
                </p>
              </div>
            </div>

            {/* Administrator Card */}
            <div className="fade-up group">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900/50 border border-slate-700 hover:border-cyan-500/50 rounded-xl p-8 h-full transition duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
                <div className="w-14 h-14 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-6 text-2xl group-hover:bg-cyan-500/30 transition">
                  <Award className="w-7 h-7 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">Administrator</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Analyze trends and manage users. Generate activity reports.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how" className="py-20 md:py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 fade-up">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black">
              Simple <span className="text-blue-400">Workflow</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="fade-up">
              <div className="relative">
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 h-full">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 text-xl font-bold text-blue-400">
                    01
                  </div>
                  <h4 className="text-lg font-bold mb-2">Quick Register</h4>
                  <p className="text-slate-400 text-sm">
                    Create your account in seconds. Verify via OTP.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="fade-up">
              <div className="relative">
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 h-full">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-6 text-xl font-bold text-purple-400">
                    02
                  </div>
                  <h4 className="text-lg font-bold mb-2">Share Knowledge</h4>
                  <p className="text-slate-400 text-sm">
                    Upload your best notes and let them help others globally.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="fade-up">
              <div className="relative">
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 h-full">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mb-6 text-xl font-bold text-cyan-400">
                    03
                  </div>
                  <h4 className="text-lg font-bold mb-2">Level Up</h4>
                  <p className="text-slate-400 text-sm">
                    Gain points, earn certifications, climb the leaderboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact/Social Section */}
      <section id="contact" className="py-20 md:py-28 px-4 bg-gradient-to-b from-transparent via-purple-950/5 to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 fade-up">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4">
              Join the <span className="text-blue-400">Community</span>
            </h2>
            <p className="text-slate-400 text-base md:text-lg">
              Connect with us on your favorite platforms
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* YouTube */}
            <a
              href="https://www.youtube.com/@studyhub991"
              target="_blank"
              rel="noopener noreferrer"
              className="fade-up group"
            >
              <div className="bg-slate-800/50 border border-slate-700 hover:border-red-500/50 rounded-lg p-6 text-center transition duration-300 hover:shadow-lg hover:shadow-red-500/10 h-full flex flex-col items-center justify-center">
                <div className="text-3xl mb-3 group-hover:scale-110 transition">📺</div>
                <h5 className="font-bold text-sm mb-1">YouTube</h5>
                <p className="text-slate-500 text-xs">Tutorials & Guides</p>
              </div>
            </a>

            {/* Telegram */}
            <a
              href="https://t.me/studyhub991"
              target="_blank"
              rel="noopener noreferrer"
              className="fade-up group"
            >
              <div className="bg-slate-800/50 border border-slate-700 hover:border-cyan-500/50 rounded-lg p-6 text-center transition duration-300 hover:shadow-lg hover:shadow-cyan-500/10 h-full flex flex-col items-center justify-center">
                <div className="text-3xl mb-3 group-hover:scale-110 transition">✈️</div>
                <h5 className="font-bold text-sm mb-1">Telegram</h5>
                <p className="text-slate-500 text-xs">Resources Channel</p>
              </div>
            </a>

            {/* Email */}
            <a
              href="mailto:studyhubteam.official@gmail.com"
              className="fade-up group"
            >
              <div className="bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 rounded-lg p-6 text-center transition duration-300 hover:shadow-lg hover:shadow-blue-500/10 h-full flex flex-col items-center justify-center">
                <div className="text-3xl mb-3 group-hover:scale-110 transition">✉️</div>
                <h5 className="font-bold text-sm mb-1">Email</h5>
                <p className="text-slate-500 text-xs">Get Support</p>
              </div>
            </a>

            {/* Facebook */}
            <a
              href="https://fb.com/mihmahmudali"
              target="_blank"
              rel="noopener noreferrer"
              className="fade-up group"
            >
              <div className="bg-slate-800/50 border border-slate-700 hover:border-blue-600/50 rounded-lg p-6 text-center transition duration-300 hover:shadow-lg hover:shadow-blue-600/10 h-full flex flex-col items-center justify-center">
                <div className="text-3xl mb-3 group-hover:scale-110 transition">f</div>
                <h5 className="font-bold text-sm mb-1">Facebook</h5>
                <p className="text-slate-500 text-xs">Developer</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-black py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
            <div>
              <div className="text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
                🎓 StudyHub
              </div>
              <p className="text-slate-500 text-sm">
                Empowering peer-to-peer learning
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-slate-500 text-sm">
                © {new Date().getFullYear()} StudyHub. All rights reserved.
              </p>
              <p className="text-slate-600 text-xs mt-2">
                Crafted for academic excellence
              </p>
            </div>
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
