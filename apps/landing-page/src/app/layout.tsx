import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import "./globals.css";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Debo",
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Web",
  url: "https://debo.life",
  description: "A personal AI memory and context layer for journals, voice, documents, and connected apps.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export const metadata: Metadata = {
  metadataBase: new URL("https://debo.life"),
  title: { default: "Debo | Personal AI Memory & Context", template: "%s | Debo" },
  description: "Debo is a personal AI memory layer for journals, voice recordings, documents, and connected-app context, with source-backed retrieval and MCP access.",
  keywords: ["personal AI memory", "AI memory", "personal knowledge graph", "AI context layer", "MCP", "journaling", "memory OS"],
  authors: [{ name: "Debo" }],
  creator: "Debo",
  openGraph: {
    title: "Debo | Personal AI Memory & Context",
    description: "Capture your life, retrieve the right context, and connect your memory to AI assistants.",
    type: "website",
    url: "https://debo.life",
    siteName: "Debo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Debo | Personal AI Memory & Context",
    description: "A source-backed memory layer for your personal AI.",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/logo.png", shortcut: "/logo.png", apple: "/logo.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Nunito+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="font-sans antialiased selection:bg-primary/20 selection:text-primary">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
