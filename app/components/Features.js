import { BookOpen, Users, Award } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Student',
    description: 'Access thousands of lecture notes and exam resources. Share knowledge and earn badges.',
    color: 'blue',
  },
  {
    icon: Users,
    title: 'Moderator',
    description: 'Maintain content quality. Review uploads and guide community growth.',
    color: 'purple',
  },
  {
    icon: Award,
    title: 'Administrator',
    description: 'Analyze trends and manage users. Generate activity reports.',
    color: 'cyan',
  },
];

function FeatureCard({ feature }) {
  const borderColors = {
    blue: 'hover:border-blue-500/50 hover:shadow-blue-500/10',
    purple: 'hover:border-purple-500/50 hover:shadow-purple-500/10',
    cyan: 'hover:border-cyan-500/50 hover:shadow-cyan-500/10',
  };

  const bgColors = {
    blue: 'bg-blue-500/20 group-hover:bg-blue-500/30',
    purple: 'bg-purple-500/20 group-hover:bg-purple-500/30',
    cyan: 'bg-cyan-500/20 group-hover:bg-cyan-500/30',
  };

  const textColors = {
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    cyan: 'text-cyan-400',
  };

  const Icon = feature.icon;

  return (
    <div className="fade-up group">
      <div className={`bg-gradient-to-br from-slate-800 to-slate-900/50 border border-slate-700 ${borderColors[feature.color]} rounded-xl p-8 h-full transition duration-300 hover:shadow-lg`}>
        <div className={`w-14 h-14 ${bgColors[feature.color]} rounded-lg flex items-center justify-center mb-6 transition`}>
          <Icon className={`w-7 h-7 ${textColors[feature.color]}`} />
        </div>
        <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">
          {feature.description}
        </p>
      </div>
    </div>
  );
}

export default function Features() {
  return (
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
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
