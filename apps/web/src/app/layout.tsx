import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Debo — Private, Source-Grounded Memory & Context OS',
  description:
    'Calm editorial workspace with verifiable citations, private memory graph, and deterministic security.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Albert+Sans:ital,wght@0,300..900;1,300..900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#f9f9f8] text-[#181816] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
