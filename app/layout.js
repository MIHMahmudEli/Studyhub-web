import "./globals.css";

export const metadata = {
  title: "StudyHub — The Academic Collaboration Platform",
  description: "Access curated academic resources, share your notes, and connect with a global community of driven learners.",
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body>{children}</body>
    </html>
  );
}
