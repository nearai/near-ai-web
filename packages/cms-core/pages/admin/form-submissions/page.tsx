import Link from "next/link";
import { auth } from "@cms/lib/auth";
import { prisma } from "@cms/lib/prisma";
import { Button } from "@cms/components/ui/button";
import { Card, CardContent } from "@cms/components/ui/card";
import { formatAdminDate } from "@cms/lib/utils";
import { StatusSelect } from "@cms/pages/admin/form-submissions/StatusSelect";

const PAGE_SIZE = 50;
const VALID_STATUSES = ["NEW", "CONTACTED", "ARCHIVED"] as const;

type FDEData = {
  contactName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  productCategory?: string;
  solutionDescription?: string;
  timeZone?: string;
};

export default async function FormSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const session = await auth();
  const userRole = (session?.user as any)?.role;

  if (userRole !== "ADMIN") {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">You don&apos;t have permission to access this page.</p>
      </div>
    );
  }

  const { page: pageParam, status: statusParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));
  const skip = (page - 1) * PAGE_SIZE;

  const where: Record<string, unknown> = {};
  if (statusParam && (VALID_STATUSES as readonly string[]).includes(statusParam)) {
    where.status = statusParam;
  }

  const [submissions, total] = await Promise.all([
    (prisma as any).formSubmission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip,
    }),
    (prisma as any).formSubmission.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasFilters = !!statusParam;

  function buildPageUrl(p: number) {
    const params = new URLSearchParams();
    if (statusParam) params.set("status", statusParam);
    params.set("page", String(p));
    return `/admin/form-submissions?${params.toString()}`;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Form Submissions</h1>
        <span className="text-sm text-muted-foreground">{total} total</span>
      </div>

      {/* Filters */}
      <form method="GET" className="flex items-center gap-3">
        <select
          name="status"
          defaultValue={statusParam ?? ""}
          className="border border-border rounded-[var(--radius)] px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">All statuses</option>
          {VALID_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <Button type="submit" variant="outline" size="sm">Filter</Button>
        {hasFilters && (
          <Link href="/admin/form-submissions" className="text-sm text-muted-foreground hover:text-foreground transition">
            Clear
          </Link>
        )}
      </form>

      <Card>
        {submissions.length === 0 ? (
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">No submissions yet.</p>
          </CardContent>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-6 py-3 text-left font-medium text-sm">Date</th>
                    <th className="px-6 py-3 text-left font-medium text-sm">Contact</th>
                    <th className="px-6 py-3 text-left font-medium text-sm">Company</th>
                    <th className="px-6 py-3 text-left font-medium text-sm">Email</th>
                    <th className="px-6 py-3 text-left font-medium text-sm">Category</th>
                    <th className="px-6 py-3 text-left font-medium text-sm">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {submissions.map((sub: any) => {
                    const d = (sub.data ?? {}) as FDEData;
                    return (
                      <>
                        <tr key={sub.id} className="hover:bg-muted/20 transition">
                          <td className="px-6 py-3 text-sm text-muted-foreground whitespace-nowrap">
                            {formatAdminDate(sub.createdAt)}
                          </td>
                          <td className="px-6 py-3 text-sm font-medium">{d.contactName ?? "—"}</td>
                          <td className="px-6 py-3 text-sm">{d.companyName ?? "—"}</td>
                          <td className="px-6 py-3 text-sm">
                            {d.email ? (
                              <a href={`mailto:${d.email}`} className="hover:text-primary transition">
                                {d.email}
                              </a>
                            ) : "—"}
                          </td>
                          <td className="px-6 py-3 text-sm">{d.productCategory ?? "—"}</td>
                          <td className="px-6 py-3">
                            <StatusSelect id={sub.id} initial={sub.status} />
                          </td>
                        </tr>
                        <tr key={`${sub.id}-detail`} className="bg-muted/10">
                          <td colSpan={6} className="px-6 pb-4 pt-0">
                            <details className="group">
                              <summary className="text-xs text-muted-foreground cursor-pointer select-none hover:text-foreground transition list-none flex items-center gap-1">
                                <span className="group-open:hidden">▶ View full submission</span>
                                <span className="hidden group-open:inline">▼ Hide details</span>
                              </summary>
                              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                                {d.phone && (
                                  <div>
                                    <span className="text-muted-foreground text-xs uppercase tracking-wider">Phone</span>
                                    <p>{d.phone}</p>
                                  </div>
                                )}
                                {d.timeZone && (
                                  <div>
                                    <span className="text-muted-foreground text-xs uppercase tracking-wider">Time Zone</span>
                                    <p>{d.timeZone}</p>
                                  </div>
                                )}
                                {d.solutionDescription && (
                                  <div className="sm:col-span-2">
                                    <span className="text-muted-foreground text-xs uppercase tracking-wider">Solution Description</span>
                                    <p className="mt-1 whitespace-pre-wrap">{d.solutionDescription}</p>
                                  </div>
                                )}
                              </div>
                            </details>
                          </td>
                        </tr>
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  {page > 1 && (
                    <Button asChild variant="outline" size="sm">
                      <Link href={buildPageUrl(page - 1)}>← Previous</Link>
                    </Button>
                  )}
                  {page < totalPages && (
                    <Button asChild variant="outline" size="sm">
                      <Link href={buildPageUrl(page + 1)}>Next →</Link>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
