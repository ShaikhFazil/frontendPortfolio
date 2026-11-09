import Navbar from '@/components/site/navbar';
import Footer from '@/components/site/footer';
import { getPortfolio } from '@/lib/api';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { profile, resume } = await getPortfolio();

  return (
    <div className="relative flex min-h-[100dvh] flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <Navbar resumeUrl={resume?.url} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer profile={profile} />
    </div>
  );
}
