import { prisma } from "@near/cms-core/lib/prisma";
import BannerHost from "@near/cms-core/components/site/BannerHost";
import LenisProvider from "@/components/site/providers/LenisProvider";
import AnalyticsScripts from "@/components/site/AnalyticsScripts";

export const revalidate = 60;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const now = new Date();
  const banners = await prisma.banner.findMany({
    where: {
      enabled: true,
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: now } }] },
        { OR: [{ endDate: null }, { endDate: { gte: now } }] },
      ],
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      type: true,
      paths: true,
      frequency: true,
      contentMode: true,
      content: true,
      htmlContent: true,
      modalDelaySeconds: true,
      modalScrollPercent: true,
    },
  });

  return (
    <LenisProvider>
      <AnalyticsScripts />
      <BannerHost banners={banners as any} />
      {children}
    </LenisProvider>
  );
}
