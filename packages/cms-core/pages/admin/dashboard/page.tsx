import { auth } from "@cms/lib/auth";
import Link from "next/link";
import { prisma } from "@cms/lib/prisma";
import { Button } from "@cms/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@cms/components/ui/card";
import { formatAdminDate } from "@cms/lib/utils";
import { Globe, PenLine, Inbox, Users, FilePlus, FileText, ClipboardList, ArrowRight } from "lucide-react";
import { PublicationsChart } from "./PublicationsChart";
import { SubmissionsChart } from "./SubmissionsChart";
import { ActivityHeatmap } from "./ActivityHeatmap";

// ─── Helpers ────────────────────────────────────────────────────────────────

function groupByWeek(dates: Date[]): { week: string; count: number }[] {
  const map: Record<string, number> = {};
  for (const d of dates) {
    // Align to Monday of the week (UTC)
    const day = new Date(d);
    day.setUTCHours(0, 0, 0, 0);
    const dow = day.getUTCDay();
    const diff = dow === 0 ? -6 : 1 - dow;
    day.setUTCDate(day.getUTCDate() + diff);
    const key = day.toISOString().split("T")[0];
    map[key] = (map[key] ?? 0) + 1;
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, count]) => ({ week, count }));
}

function groupByDay(dates: Date[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const d of dates) {
    const key = new Date(d).toISOString().split("T")[0];
    map[key] = (map[key] ?? 0) + 1;
  }
  return map;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function AdminDashboard() {
  const session = await auth();

  const ytdStart = new Date(new Date().getFullYear(), 0, 1);
  const heatmapStart = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

  const [publishedCount, draftCount, archivedCount, pagesCount, usersCount] = await Promise.all([
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.post.count({ where: { status: "DRAFT" } }),
    prisma.post.count({ where: { status: "ARCHIVED" } }),
    prisma.page.count(),
    prisma.user.count(),
  ]);

  // Published posts dates for chart
  const publishedDatesRaw = await prisma.post.findMany({
    where: { status: "PUBLISHED", publishedAt: { gte: ytdStart } },
    select: { publishedAt: true },
  });
  const publicationsData = groupByWeek(
    publishedDatesRaw.map((p) => p.publishedAt!).filter(Boolean)
  );

  // Last 5 published posts
  const recentPosts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      slug: true,
      publishedAt: true,
      author: { select: { name: true } },
    },
  });

  let newSubmissionsCount = 0;
  let submissionsData: { week: string; count: number }[] = [];
  try {
    const [count, rows] = await Promise.all([
      (prisma as any).formSubmission.count({ where: { status: "NEW" } }),
      (prisma as any).formSubmission.findMany({
        where: { createdAt: { gte: ytdStart } },
        select: { createdAt: true },
      }),
    ]);
    newSubmissionsCount = count;
    submissionsData = groupByWeek(rows.map((r: any) => new Date(r.createdAt)));
  } catch {}

  let recentActivity: any[] = [];
  let heatmapData: Record<string, number> = {};
  try {
    const [activity, heatmapRaw] = await Promise.all([
      (prisma as any).auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
      (prisma as any).auditLog.findMany({
        where: { createdAt: { gte: heatmapStart } },
        select: { createdAt: true },
      }),
    ]);
    recentActivity = activity;
    heatmapData = groupByDay(heatmapRaw.map((r: any) => new Date(r.createdAt)));
  } catch {}

  const totalPosts = publishedCount + draftCount + archivedCount;
  const pct = (n: number) => (totalPosts > 0 ? Math.round((n / totalPosts) * 100) : 0);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-lg text-muted-foreground mt-1">
            Welcome back, <span className="font-semibold text-foreground">{session?.user?.name}</span>
          </p>
        </div>
        <p className="text-sm text-muted-foreground pt-2 hidden sm:block">{today}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {[
          { href: "/admin/posts?status=PUBLISHED", label: "Published Posts", value: publishedCount, icon: <Globe className="w-4 h-4 text-primary" />, iconBg: "bg-primary/10", border: "hover:border-primary/50" },
          { href: "/admin/posts?status=DRAFT",     label: "Draft Posts",      value: draftCount,      icon: <PenLine className="w-4 h-4 text-amber-500" />, iconBg: "bg-amber-500/10", border: "hover:border-amber-500/50" },
          { href: "/admin/form-submissions",        label: "New Submissions",  value: newSubmissionsCount, icon: <Inbox className="w-4 h-4 text-blue-400" />, iconBg: "bg-blue-400/10", border: "hover:border-blue-400/50" },
          { href: "/admin/users",                   label: "Team Members",     value: usersCount,      icon: <Users className="w-4 h-4 text-violet-400" />, iconBg: "bg-violet-400/10", border: "hover:border-violet-400/50" },
        ].map(({ href, label, value, icon, iconBg, border }) => (
          <Link key={href} href={href} className="h-full">
            <Card className={`h-full flex flex-col transition cursor-pointer ${border}`}>
              <div className="flex flex-col flex-1 justify-between p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-muted-foreground">{label}</p>
                  <div className={`p-2 rounded-lg shrink-0 ${iconBg}`}>{icon}</div>
                </div>
                <p className="text-4xl font-bold">{value}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Content Breakdown + Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Content Breakdown</CardTitle>
            <CardDescription>{totalPosts} total posts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Published</span>
                <span className="font-medium">{publishedCount}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct(publishedCount)}%` }} />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Drafts</span>
                <span className="font-medium">{draftCount}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${pct(draftCount)}%` }} />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Archived</span>
                <span className="font-medium">{archivedCount}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-muted-foreground/40 transition-all" style={{ width: `${pct(archivedCount)}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <CardDescription>Jump to common tasks</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button asChild className="justify-start gap-3 h-10">
              <Link href="/admin/posts/new">
                <FilePlus className="w-4 h-4 shrink-0" />
                New Post
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start gap-3 h-10">
              <Link href="/admin/pages/new">
                <FileText className="w-4 h-4 shrink-0" />
                New Page
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start gap-3 h-10">
              <Link href="/admin/form-submissions">
                <Inbox className="w-4 h-4 shrink-0" />
                Form Submissions
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start gap-3 h-10">
              <Link href="/admin/audit-log">
                <ClipboardList className="w-4 h-4 shrink-0" />
                Audit Log
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bar Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PublicationsChart data={publicationsData} />
        <SubmissionsChart data={submissionsData} />
      </div>

      {/* Activity Heatmap */}
      <ActivityHeatmap data={heatmapData} />

      {/* Recent Posts + Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Recent Published Posts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Recent Posts</CardTitle>
                <CardDescription>Latest published content</CardDescription>
              </div>
              <Link href="/admin/posts?status=PUBLISHED" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No published posts yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {recentPosts.map((post) => (
                  <div key={post.id} className="py-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/admin/posts/${post.id}`}
                        className="text-sm font-medium hover:text-primary transition truncate block"
                      >
                        {post.title}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {post.author?.name ?? "—"} · {post.publishedAt ? formatAdminDate(post.publishedAt) : "—"}
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                      LIVE
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Recent Activity</CardTitle>
                  <CardDescription>Last 10 actions across the CMS</CardDescription>
                </div>
                <Link href="/admin/audit-log" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition">
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {recentActivity.map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between py-2.5 text-sm gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          log.action === "CREATE" ? "bg-green-500"
                          : log.action === "DELETE" ? "bg-red-500"
                          : "bg-primary"
                        }`}
                      />
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                          log.action === "CREATE"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : log.action === "DELETE"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {log.action}
                      </span>
                      <span className="text-muted-foreground text-xs shrink-0">{log.entityType}</span>
                      <span className="font-medium truncate text-xs">{log.entityTitle}</span>
                    </div>
                    <time className="text-muted-foreground text-xs shrink-0">
                      {formatAdminDate(log.createdAt)}
                    </time>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
