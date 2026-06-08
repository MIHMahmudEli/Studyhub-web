import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import { ThemeProvider } from "@/context/ThemeProvider";
import RouteTracker from "@/components/RouteTracker";
import ScreenGate from "@/components/ScreenGate";
import ThemeSync from "@/components/ThemeSync";
import DeepSpace from "@/components/space/DeepSpace";
import RamadanDecoration from "@/components/ramadan/Decoration";
import { BlessingsProvider } from "@/components/ramadan/Blessings";
import RamadanReflectionPanel from "@/components/ramadan/ReflectionPanel";
import EidTransition from "@/components/ramadan/EidTransition";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import QueryProvider from "@/lib/query-provider";
import { inter, jakarta } from "@/lib/fonts";
import "./globals.css";

export const metadata = {
  title: "StudyHub | Premium Student Resource Platform",
  description: "The ultimate space for students to share notes, find resources, and excel in their studies.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning className={`${inter.variable} ${jakarta.variable}`}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta httpEquiv="cache-control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="pragma" content="no-cache" />
        <meta httpEquiv="expires" content="0" />
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem('preferred_theme')||localStorage.getItem('theme')||'dark';document.documentElement.setAttribute('data-theme',t);var vk=t==='dark'?'admin_dark_theme':'admin_light_theme',v=localStorage.getItem(vk);if(v==='current'||v==='previous'||v==='ramadan')document.documentElement.setAttribute('data-theme-variant',v)}catch(e){}})()`,
        }} />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <AuthProvider>
            <SocketProvider>
            <ThemeSync />
            <RouteTracker />
            {/* Global Nebula Effect */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-50">
              <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-[var(--nebula-1)] blur-[120px] animate-nebula" />
              <div className="absolute bottom-[-15%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--nebula-2)] blur-[130px] animate-nebula" style={{ animationDelay: '-6s' }} />
              <div className="absolute top-[35%] left-[55%] w-[35%] h-[35%] rounded-full bg-[var(--nebula-3)] blur-[100px] animate-nebula" style={{ animationDelay: '-12s' }} />
              <div className="absolute bottom-[20%] left-[5%] w-[25%] h-[25%] rounded-full bg-[var(--nebula-4)] blur-[90px] animate-nebula" style={{ animationDelay: '-18s' }} />
            </div>

            <DeepSpace />
            <RamadanDecoration />

            <ErrorBoundary><QueryProvider><ScreenGate><BlessingsProvider>{children}<RamadanReflectionPanel /><EidTransition /></BlessingsProvider></ScreenGate></QueryProvider></ErrorBoundary>
          </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
