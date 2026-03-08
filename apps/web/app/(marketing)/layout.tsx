import { SiteShell } from '@/components/marketing/site-shell';
import { PageLoader } from '@/components/marketing/page-loader';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteShell>
      <PageLoader>{children}</PageLoader>
    </SiteShell>
  );
}
