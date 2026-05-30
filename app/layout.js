import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import RouteTracker from "@/components/RouteTracker";
import ScreenGate from "@/components/ScreenGate";
import ThemeSync from "@/components/ThemeSync";
import "./globals.css";

export const metadata = {
  title: "StudyHub | Premium Student Resource Platform",
  description: "The ultimate space for students to share notes, find resources, and excel in their studies.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="font-sans antialiased">
        <ThemeProvider>
          <AuthProvider>
            <ThemeSync />
            <RouteTracker />
            {/* Global Nebula Effect */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-50">
              <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-[var(--nebula-1)] blur-[120px] animate-nebula" />
              <div className="absolute bottom-[-15%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--nebula-2)] blur-[130px] animate-nebula" style={{ animationDelay: '-6s' }} />
              <div className="absolute top-[35%] left-[55%] w-[35%] h-[35%] rounded-full bg-[var(--nebula-3)] blur-[100px] animate-nebula" style={{ animationDelay: '-12s' }} />
              <div className="absolute bottom-[20%] left-[5%] w-[25%] h-[25%] rounded-full bg-[var(--nebula-4)] blur-[90px] animate-nebula" style={{ animationDelay: '-18s' }} />
            </div>
            
            <ScreenGate>{children}</ScreenGate>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
