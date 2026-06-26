"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, Eye, Pencil, ArrowUpDown, ArrowUp, ArrowDown, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@cms/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogFooter,
  DialogTitle, DialogDescription, DialogClose,
} from "@cms/components/ui/dialog";
import { PostDeleteButton } from "@cms/components/admin/PostDeleteButton";
import { DuplicatePostButton } from "@cms/components/admin/DuplicatePostButton";
import { formatAdminDate } from "@cms/lib/utils";
import { PostStatusSelect } from "./PostStatusSelect";

interface SerializedPost {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt: string | null;
  createdAt: string;
  author: { name: string };
  lastEditedBy: { name: string } | null;
  lockedByEmail: string | null;
}

interface PostsBulkTableProps {
  posts: SerializedPost[];
  userRole: string;
  sort?: string;
  order?: string;
}

function relativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years  = Math.floor(days / 365);
  if (mins  <  1) return "just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 30) return `${days}d ago`;
  if (months < 12) return `${months}mo ago`;
  return `${years}y ago`;
}

function SortHeader({
  col,
  label,
  currentSort,
  currentOrder,
}: {
  col: string;
  label: string;
  currentSort: string;
  currentOrder: string;
}) {
  const searchParams = useSearchParams();
  const isActive = currentSort === col;
  const nextOrder = isActive && currentOrder === "asc" ? "desc" : "asc";

  const href = (() => {
    const p = new URLSearchParams(searchParams.toString());
    p.set("sort", col);
    p.set("order", nextOrder);
    p.delete("page");
    return `/admin/posts?${p}`;
  })();

  return (
    <Link href={href} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
      {label}
      {isActive ? (
        currentOrder === "asc"
          ? <ArrowUp className="w-3 h-3" />
          : <ArrowDown className="w-3 h-3" />
      ) : (
        <ArrowUpDown className="w-3 h-3 opacity-40" />
      )}
    </Link>
  );
}

export function PostsBulkTable({ posts, userRole, sort = "createdAt", order = "desc" }: PostsBulkTableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [bulkError, setBulkError] = useState("");
  const [pendingBulkAction, setPendingBulkAction] = useState<"publish" | "archive" | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");

  useEffect(() => {
    router.refresh();
    const id = setInterval(() => router.refresh(), 30_000);
    return () => clearInterval(id);
  }, [router]);

  const allSelected = posts.length > 0 && posts.every((p) => selectedIds.has(p.id));
  const someSelected = selectedIds.size > 0;

  function toggleAll() {
    setSelectedIds(allSelected ? new Set() : new Set(posts.map((p) => p.id)));
  }
  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function openBulkDeleteModal() {
    setDeleteStep(1); setDeleteConfirmInput(""); setShowDeleteModal(true);
  }
  function closeBulkDeleteModal() {
    setShowDeleteModal(false); setDeleteStep(1); setDeleteConfirmInput("");
  }

  async function handleBulkAction(action: "publish" | "archive" | "delete") {
    setBulkError("");
    const res = await fetch("/api/posts/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selectedIds), action }),
    });
    if (!res.ok) {
      const data = await res.json();
      setBulkError(data.error ?? "Bulk action failed");
      return;
    }
    const count = selectedIds.size;
    if (action === "publish") toast.success(`${count} post${count !== 1 ? "s" : ""} published`);
    if (action === "archive") toast.success(`${count} post${count !== 1 ? "s" : ""} archived`);
    setSelectedIds(new Set());
    startTransition(() => router.refresh());
  }

  async function confirmBulkDelete() {
    closeBulkDeleteModal();
    await handleBulkAction("delete");
  }

  return (
    <div className="relative">
      <div className="overflow-x-auto" data-posts-tour-id="posts-table">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/30">
              {userRole !== "VIEWER" && (
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="rounded border-border accent-primary"
                    aria-label="Select all"
                  />
                </th>
              )}
              <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                <SortHeader col="title" label="Title" currentSort={sort} currentOrder={order} />
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Author</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                <SortHeader col="status" label="Status" currentSort={sort} currentOrder={order} />
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                <SortHeader col="createdAt" label="Created" currentSort={sort} currentOrder={order} />
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium text-muted-foreground" data-posts-tour-id="post-actions">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {posts.map((post) => (
              <tr
                key={post.id}
                className={`hover:bg-muted/20 transition ${selectedIds.has(post.id) ? "bg-primary/5" : ""}`}
              >
                {userRole !== "VIEWER" && (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(post.id)}
                      onChange={() => toggleOne(post.id)}
                      className="rounded border-border accent-primary"
                    />
                  </td>
                )}

                {/* Title */}
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <p className="font-medium truncate max-w-xs">{post.title}</p>
                    {post.lockedByEmail && (
                      <span
                        title={`Being edited by ${post.lockedByEmail}`}
                        className="inline-flex items-center gap-1 text-xs text-amber-500 bg-amber-500/10 border border-amber-400/30 px-1.5 py-0.5 rounded-full shrink-0"
                      >
                        <Lock className="w-2.5 h-2.5" />
                        {post.lockedByEmail.split("@")[0]}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground/60 mt-0.5 truncate max-w-xs">{post.slug}</p>
                </td>

                {/* Author */}
                <td className="px-6 py-3 text-sm">
                  <p className="leading-none">{post.author.name}</p>
                  {post.lastEditedBy && post.lastEditedBy.name !== post.author.name && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      edited · {post.lastEditedBy.name}
                    </p>
                  )}
                </td>

                {/* Status — inline change */}
                <td className="px-6 py-3">
                  {userRole !== "VIEWER" ? (
                    <PostStatusSelect id={post.id} initial={post.status} />
                  ) : (
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                      post.status === "PUBLISHED" ? "text-primary bg-primary/10"
                      : post.status === "DRAFT"   ? "text-muted-foreground bg-muted/50"
                      :                             "text-muted-foreground/60 bg-muted/30"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        post.status === "PUBLISHED" ? "bg-primary"
                        : post.status === "DRAFT"   ? "bg-muted-foreground/50"
                        :                             "bg-muted-foreground/30"
                      }`} />
                      {post.status.charAt(0) + post.status.slice(1).toLowerCase()}
                    </span>
                  )}
                </td>

                {/* Created — relative date with absolute on hover */}
                <td className="px-6 py-3 text-sm text-muted-foreground">
                  <span title={formatAdminDate(post.createdAt)} className="cursor-default">
                    {relativeDate(post.createdAt)}
                  </span>
                </td>

                {/* Actions — icon-only */}
                <td className="px-6 py-3">
                  <div className="flex items-center justify-end gap-1" data-posts-tour-id="post-actions">
                    {post.status === "PUBLISHED" && (
                      <Button asChild variant="ghost" size="icon" className="h-8 w-8 opacity-70 hover:opacity-100 hover:bg-muted" title="View on site">
                        <Link href={`/blog/${post.slug}`} target="_blank">
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                    )}
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8 opacity-70 hover:opacity-100 hover:bg-muted" title="Edit post">
                      <Link href={`/admin/posts/${post.id}/edit`}>
                        <Pencil className="w-4 h-4" />
                      </Link>
                    </Button>
                    {userRole !== "VIEWER" && (
                      <>
                        <DuplicatePostButton postId={post.id} />
                        <PostDeleteButton postId={post.id} postTitle={post.title} />
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bulk action bar */}
      {someSelected && userRole !== "VIEWER" && (
        <div className="sticky bottom-4 mx-4 mt-2 flex items-center justify-between gap-4 bg-background border border-border rounded-xl px-5 py-3 shadow-lg z-10">
          <p className="text-sm font-medium">
            {selectedIds.size} {selectedIds.size === 1 ? "post" : "posts"} selected
          </p>
          {bulkError && <p className="text-xs text-destructive">{bulkError}</p>}
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>Clear</Button>
            <Button variant="outline" size="sm" disabled={isPending} onClick={() => setPendingBulkAction("publish")}>Publish</Button>
            <Button variant="outline" size="sm" disabled={isPending} onClick={() => setPendingBulkAction("archive")}>Archive</Button>
            <Button variant="destructive" size="sm" disabled={isPending} onClick={openBulkDeleteModal}>Delete</Button>
          </div>
        </div>
      )}

      {/* Bulk delete modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={closeBulkDeleteModal}>
          <div className="bg-background border border-border rounded-2xl shadow-xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <h2 className="text-base font-semibold">
                  {deleteStep === 1 ? `Delete ${selectedIds.size} ${selectedIds.size === 1 ? "post" : "posts"}?` : "Confirm permanent deletion"}
                </h2>
              </div>
              <button type="button" onClick={closeBulkDeleteModal} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition text-xl leading-none">×</button>
            </div>
            <div className="px-6 py-5 space-y-5 text-left">
              {deleteStep === 1 ? (
                <>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-2"><span className="text-destructive shrink-0">•</span><span>Posts will be <strong className="text-foreground">permanently deleted</strong> — no recovery.</span></li>
                    <li className="flex gap-2"><span className="text-destructive shrink-0">•</span><span>Their public URLs will immediately return 404.</span></li>
                    <li className="flex gap-2"><span className="text-destructive shrink-0">•</span><span>All content, metadata, and SEO fields will be lost.</span></li>
                  </ul>
                  <div className="flex gap-3">
                    <button type="button" onClick={closeBulkDeleteModal} className="flex-1 text-sm px-4 py-2 rounded-lg border border-border hover:bg-muted transition">Cancel</button>
                    <button type="button" onClick={() => setDeleteStep(2)} className="flex-1 inline-flex items-center justify-center gap-2 text-sm px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition">
                      <AlertTriangle className="w-4 h-4" />Continue →
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">Type <code className="text-xs bg-muted px-1 py-0.5 rounded font-semibold text-foreground">delete</code> to confirm. Pasting not allowed.</p>
                  <input
                    type="text"
                    value={deleteConfirmInput}
                    onChange={(e) => setDeleteConfirmInput(e.target.value)}
                    onPaste={(e) => e.preventDefault()}
                    onCopy={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    placeholder='Type "delete" here…'
                    className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-destructive"
                    autoFocus
                  />
                  <div className="flex gap-3">
                    <button type="button" onClick={() => { setDeleteStep(1); setDeleteConfirmInput(""); }} className="flex-1 text-sm px-4 py-2 rounded-lg border border-border hover:bg-muted transition">← Back</button>
                    <button type="button" disabled={deleteConfirmInput !== "delete" || isPending} onClick={confirmBulkDelete} className="flex-1 text-sm px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition disabled:opacity-40 disabled:cursor-not-allowed">
                      {isPending ? "Deleting…" : "Delete permanently"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bulk publish/archive dialog */}
      <Dialog open={pendingBulkAction !== null} onOpenChange={(open) => { if (!open) setPendingBulkAction(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{pendingBulkAction === "publish" ? "Publish posts?" : "Archive posts?"}</DialogTitle>
            <DialogDescription>
              {pendingBulkAction === "publish"
                ? `${selectedIds.size} post${selectedIds.size !== 1 ? "s" : ""} will become immediately visible on the site.`
                : `${selectedIds.size} post${selectedIds.size !== 1 ? "s" : ""} will be hidden from the public site.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button
              variant={pendingBulkAction === "publish" ? "default" : "secondary"}
              onClick={async () => { const a = pendingBulkAction!; setPendingBulkAction(null); await handleBulkAction(a); }}
            >
              {pendingBulkAction === "publish" ? "Publish" : "Archive"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
