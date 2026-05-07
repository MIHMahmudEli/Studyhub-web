const socialLinks = [
  {
    name: 'YouTube',
    emoji: '📺',
    url: 'https://www.youtube.com/@studyhub991',
    description: 'Tutorials & Guides',
    color: 'red',
  },
  {
    name: 'Telegram',
    emoji: '✈️',
    url: 'https://t.me/studyhub991',
    description: 'Resources Channel',
    color: 'cyan',
  },
  {
    name: 'Email',
    emoji: '✉️',
    url: 'mailto:studyhubteam.official@gmail.com',
    description: 'Get Support',
    color: 'blue',
  },
  {
    name: 'Facebook',
    emoji: 'f',
    url: 'https://fb.com/mihmahmudali',
    description: 'Developer',
    color: 'blue',
    isExternal: true,
  },
];

const hoverColors = {
  red: 'hover:border-red-500/50 hover:shadow-red-500/10',
  cyan: 'hover:border-cyan-500/50 hover:shadow-cyan-500/10',
  blue: 'hover:border-blue-500/50 hover:shadow-blue-500/10',
};

function SocialCard({ link }) {
  const isEmail = link.url.startsWith('mailto:');
  const Component = isEmail ? 'a' : 'a';

  return (
    <a
      href={link.url}
      target={link.isExternal || !isEmail ? '_blank' : undefined}
      rel={link.isExternal || !isEmail ? 'noopener noreferrer' : undefined}
      className="fade-up group"
    >
      <div className={`bg-slate-800/50 border border-slate-700 ${hoverColors[link.color]} rounded-lg p-6 text-center transition duration-300 hover:shadow-lg h-full flex flex-col items-center justify-center`}>
        <div className="text-3xl mb-3 group-hover:scale-110 transition">
          {link.emoji}
        </div>
        <h5 className="font-bold text-sm mb-1">{link.name}</h5>
        <p className="text-slate-500 text-xs">{link.description}</p>
      </div>
    </a>
  );
}

export default function Contact() {
  return (
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
          {socialLinks.map((link, index) => (
            <SocialCard key={index} link={link} />
          ))}
        </div>
      </div>
    </section>
  );
}
