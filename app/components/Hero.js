import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
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
  );
}
