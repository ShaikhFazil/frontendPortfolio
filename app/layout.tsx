import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { Toaster } from 'sonner';
import './globals.css';

/*
  Fonts are self-hosted variable woff2 files (no request to a third party at
  runtime, no layout shift). Mono is Fira Code, kept from the original build
  because the hero code panel renders in it.
*/
const firaCode = localFont({
  src: './fonts/FiraCode-Variable.woff2',
  weight: '300 700',
  style: 'normal',
  display: 'swap',
  variable: '--font-fira-code',
  fallback: ['ui-monospace', 'SFMono-Regular', 'monospace'],
});

const manrope = localFont({
  src: './fonts/Manrope-Variable.woff2',
  weight: '200 800',
  style: 'normal',
  display: 'swap',
  variable: '--font-manrope',
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
});

const spaceGrotesk = localFont({
  src: './fonts/SpaceGrotesk-Variable.woff2',
  weight: '300 700',
  style: 'normal',
  display: 'swap',
  variable: '--font-space-grotesk',
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Fazil Shaikh | Full Stack Developer & Generative AI Engineer',
    template: '%s | Fazil Shaikh',
  },
  description:
    'Full Stack Developer and Generative AI Engineer building React and Node products with LangChain, RAG and LLM features. 3.5+ years across travel, fintech and e-commerce.',
  keywords: [
    'Fazil Shaikh',
    'Full Stack Developer',
    'Generative AI Engineer',
    'LangChain Developer',
    'RAG Applications',
    'Next.js Developer',
    'React Developer',
    'Node.js Developer',
    'MongoDB',
    'GraphQL',
    'Mumbai Developer',
  ],
  authors: [{ name: 'Fazil Shaikh', url: siteUrl }],
  creator: 'Fazil Shaikh',
  openGraph: {
    type: 'profile',
    locale: 'en_IN',
    url: siteUrl,
    siteName: 'Fazil Shaikh',
    title: 'Fazil Shaikh | Full Stack Developer & Generative AI Engineer',
    description:
      'React and Node products with LangChain, RAG and LLM features. 3.5+ years across travel, fintech and e-commerce.',
    images: [{ url: '/imgs/fazil.png', width: 1200, height: 630, alt: 'Fazil Shaikh' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fazil Shaikh | Full Stack Developer & Generative AI Engineer',
    description: 'React and Node products with LangChain, RAG and LLM features.',
    images: ['/imgs/fazil.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  alternates: { canonical: siteUrl },
  icons: { icon: '/imgs/logo.png', apple: '/imgs/logo.png' },
};

export const viewport: Viewport = {
  themeColor: '#07070c',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`dark ${manrope.variable} ${spaceGrotesk.variable} ${firaCode.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans">
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'hsl(240 18% 8%)',
              border: '1px solid hsl(240 14% 18%)',
              color: 'hsl(240 14% 96%)',
            },
          }}
        />
      </body>
    </html>
  );
}
