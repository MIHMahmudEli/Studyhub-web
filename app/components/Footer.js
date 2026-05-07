import StudyHubLogo from './StudyHubLogo';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-black py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
          <div>
            <a href="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 10 }}>
              <StudyHubLogo size={38} textSize={19} />
            </a>
            <p className="text-slate-500 text-sm mt-3">
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
  );
}
