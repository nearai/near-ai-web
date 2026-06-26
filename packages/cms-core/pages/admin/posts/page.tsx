import Link from "next/link";
import { prisma } from "@cms/lib/prisma";
import { auth } from "@cms/lib/auth";
import { Prisma } from "@prisma/client";
import { Button } from "@cms/components/ui/button";
import { Card, CardContent } from "@cms/components/ui/card";
import { PostsBulkTable } from "./PostsBulkTable";
import { PostsFilterBar } from "./PostsFilterBar";
import { PostsPageTour } from "@cms/components/admin/onboarding/PostsPageTour";

const PAGE_SIZE = 20;
const VALID_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
type PostStatus = (typeof VALID_STATUSES)[number];

const SORT_FIELDS: Record<string, keyof Prisma.PostOrderByWithRelationInput> = {
  title:     "title",
  status:    "status",
  createdAt: "createdAt",
};

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string; sort?: string; order?: string }>;
}) {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  const userId = session?.user?.id;

  const { page: pageParam, q, status: statusParam, sort: sortParam, order: orderParam } = await searchParams;
  const page  = Math.max(1, Number(pageParam ?? 1));
  const skip  = (page - 1) * PAGE_SIZE;
  const sort  = SORT_FIELDS[sortParam ?? ""] ?? "createdAt";
  const order: "asc" | "desc" = orderParam === "asc" ? "asc" : "desc";

  const baseWhere: Prisma.PostWhereInput =
    userRole === "VIEWER" ? { authorId: userId as string } : {};

  const filters: Prisma.PostWhereInput = {};
  if (q) {
    filters.OR = [
      { title:    { contains: q, mode: "insensitive" } },
      { excerpt:  { contains: q, mode: "insensitive" } },
      { seoTitle: { contains: q, mode: "insensitive" } },
      { author:   { name: { contains: q, mode: "insensitive" } } },
    ];
  }
  if (statusParam && (VALID_STATUSES as readonly string[]).includes(statusParam))
    filters.status = statusParam as PostStatus;

  const where = { ...baseWhere, ...filters };
  const hasFilters = !!(q || statusParam);

  const [posts, total, publishedCount, draftCount, archivedCount, allCount] = await Promise.all([
    prisma.post.findMany({
      where,
      include: { author: true, lastEditedBy: { select: { name: true } } },
      orderBy: { [sort]: order },
      take: PAGE_SIZE,
      skip,
    }),
    prisma.post.count({ where }),
    prisma.post.count({ where: { ...baseWhere, status: "PUBLISHED" } }),
    prisma.post.count({ where: { ...baseWhere, status: "DRAFT" } }),
    prisma.post.count({ where: { ...baseWhere, status: "ARCHIVED" } }),
    prisma.post.count({ where: baseWhere }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function buildPageUrl(p: number) {
    const params = new URLSearchParams();
    if (q)          params.set("q", q);
    if (statusParam) params.set("status", statusParam);
    if (sortParam)  params.set("sort", sortParam);
    if (orderParam) params.set("order", orderParam);
    params.set("page", String(p));
    return `/admin/posts?${params}`;
  }

  return (
    <div className="space-y-6">
      <PostsPageTour />

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold">Blog Posts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {allCount} total · {publishedCount} published · {draftCount} draft · {archivedCount} archived
          </p>
        </div>
        {userRole !== "VIEWER" && (
          <Button asChild data-posts-tour-id="new-post">
            <Link href="/admin/posts/new">+ New Post</Link>
          </Button>
        )}
      </div>

      {/* Filter bar — client component */}
      <PostsFilterBar
        q={q ?? ""}
        status={statusParam ?? ""}
        counts={{ all: allCount, published: publishedCount, draft: draftCount, archived: archivedCount }}
      />

      <Card>
        {posts.length === 0 ? (
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">
              {hasFilters ? "No posts match your search." : "No posts yet."}
            </p>
            {!hasFilters && userRole !== "VIEWER" && (
              <Button asChild variant="link" className="mt-2">
                <Link href="/admin/posts/new">Create the first one</Link>
              </Button>
            )}
          </CardContent>
        ) : (
          <>
            <PostsBulkTable
              posts={posts.map((p) => ({
                id:           p.id,
                title:        p.title,
                slug:         p.slug,
                status:       p.status,
                publishedAt:  p.publishedAt?.toISOString() ?? null,
                createdAt:    p.createdAt.toISOString(),
                author:       { name: p.author.name },
                lastEditedBy: p.lastEditedBy ? { name: p.lastEditedBy.name } : null,
                lockedByEmail: p.lockedByEmail ?? null,
              }))}
              userRole={userRole}
              sort={sortParam}
              order={orderParam}
            />

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages} ({total} posts)
                </p>
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
