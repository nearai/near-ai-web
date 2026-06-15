import LenisProvider from "@/components/site/providers/LenisProvider";
import AnalyticsScripts from "@/components/site/AnalyticsScripts";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <LenisProvider>
      <AnalyticsScripts />
      {children}
    </LenisProvider>
  );
}
