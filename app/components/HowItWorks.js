const steps = [
  {
    number: '01',
    title: 'Quick Register',
    description: 'Create your account in seconds. Verify via OTP.',
    color: 'blue',
  },
  {
    number: '02',
    title: 'Share Knowledge',
    description: 'Upload your best notes and let them help others globally.',
    color: 'purple',
  },
  {
    number: '03',
    title: 'Level Up',
    description: 'Gain points, earn certifications, climb the leaderboard.',
    color: 'cyan',
  },
];

function StepCard({ step }) {
  const bgColors = {
    blue: 'bg-blue-500/20 text-blue-400',
    purple: 'bg-purple-500/20 text-purple-400',
    cyan: 'bg-cyan-500/20 text-cyan-400',
  };

  return (
    <div className="fade-up">
      <div className="relative">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 h-full">
          <div className={`w-12 h-12 ${bgColors[step.color]} rounded-full flex items-center justify-center mb-6 text-xl font-bold`}>
            {step.number}
          </div>
          <h4 className="text-lg font-bold mb-2">{step.title}</h4>
          <p className="text-slate-400 text-sm">
            {step.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section id="how" className="py-20 md:py-28 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16 fade-up">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black">
            Simple <span className="text-blue-400">Workflow</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <StepCard key={index} step={step} />
          ))}
        </div>
      </div>
    </section>
  );
}
