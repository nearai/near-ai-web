import Link from "next/link";
import { prisma } from "@cms/lib/prisma";
import { auth } from "@cms/lib/auth";
import { Button } from "@cms/components/ui/button";
import { Card, CardContent } from "@cms/components/ui/card";
import { BannersTable } from "./BannersTable";

export default async function BannersPage() {
  const session = await auth();
  const userRole = (session?.user as any)?.role;

  const banners = await prisma.banner.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold">Banners</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {banners.length} total
          </p>
        </div>
        {userRole !== "VIEWER" && (
          <Button asChild>
            <Link href="/admin/banners/new">+ New Banner</Link>
          </Button>
        )}
      </div>

      <Card>
        {banners.length === 0 ? (
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">No banners yet.</p>
            {userRole !== "VIEWER" && (
              <Button asChild variant="link" className="mt-2">
                <Link href="/admin/banners/new">Create the first one</Link>
              </Button>
            )}
          </CardContent>
        ) : (
          <BannersTable
            banners={banners.map((b) => ({
              id: b.id,
              name: b.name,
              type: b.type,
              paths: b.paths,
              enabled: b.enabled,
              frequency: b.frequency,
              viewCount: b.viewCount,
              clickCount: b.clickCount,
              dismissCount: b.dismissCount,
              createdAt: b.createdAt.toISOString(),
            }))}
            userRole={userRole}
          />
        )}
      </Card>
    </div>
  );
}
