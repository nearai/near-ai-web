"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import BlockEditor from "@cms/components/admin/editor/BlockEditor";
import { Button } from "@cms/components/ui/button";
import { Input } from "@cms/components/ui/input";
import { Label } from "@cms/components/ui/label";
import { Switch } from "@cms/components/ui/switch";
import { Skeleton } from "@cms/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@cms/components/ui/alert-dialog";
import { ArrowLeft, Eye, EyeOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { sanitizeRawHtml } from "@cms/lib/sanitize-html";
import { PathsListInput } from "@cms/pages/admin/banners/PathsListInput";

type BannerType = "TOP" | "MODAL" | "BOTTOM";
type BannerFrequency = "ALWAYS" | "ONCE_PER_SESSION" | "DONT_SHOW_AGAIN";
type BannerContentMode = "EDITOR" | "HTML";

function toDatetimeLocalString(date: string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

const FREQUENCY_HELP: Record<BannerFrequency, string> = {
  ALWAYS: "Reappears on every page load. Closing only hides it for the current view.",
  ONCE_PER_SESSION: "Hidden after closing until the visitor starts a new browser session.",
  DONT_SHOW_AGAIN: "Hidden permanently after closing, until local storage is cleared.",
};

export default function BannerFormClient({
  mode,
}: {
  mode: "new" | "edit";
  userRole?: string;
}) {
  const router = useRouter();
  const params = useParams();
  const bannerId = mode === "edit" ? (params.id as string) : undefined;

  const [isLoading, setIsLoading] = useState(mode === "edit");
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState<BannerType>("TOP");
  const [paths, setPaths] = useState<string[]>([]);
  const [enabled, setEnabled] = useState(false);
  const [frequency, setFrequency] = useState<BannerFrequency>("ALWAYS");
  const [contentMode, setContentMode] = useState<BannerContentMode>("EDITOR");
  const [content, setContent] = useState<any>({ type: "doc", content: [{ type: "paragraph" }] });
  const [htmlContent, setHtmlContent] = useState("");
  const [htmlPreview, setHtmlPreview] = useState(false);
  const [modalDelaySeconds, setModalDelaySeconds] = useState("");
  const [modalScrollPercent, setModalScrollPercent] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [analytics, setAnalytics] = useState({ viewCount: 0, clickCount: 0, dismissCount: 0 });

  useEffect(() => {
    if (mode !== "edit" || !bannerId) return;

    async function fetchBanner() {
      try {
        const res = await fetch(`/api/banners/${bannerId}`);
        if (!res.ok) throw new Error("Failed to fetch banner");
        const banner = await res.json();

        setName(banner.name);
        setType(banner.type);
        setPaths(banner.paths ?? []);
        setEnabled(banner.enabled);
        setFrequency(banner.frequency);
        setContentMode(banner.contentMode);
        setContent(banner.content || { type: "doc", content: [{ type: "paragraph" }] });
        setHtmlContent(banner.htmlContent || "");
        setModalDelaySeconds(banner.modalDelaySeconds != null ? String(banner.modalDelaySeconds) : "");
        setModalScrollPercent(banner.modalScrollPercent != null ? String(banner.modalScrollPercent) : "");
        setStartDate(toDatetimeLocalString(banner.startDate));
        setEndDate(toDatetimeLocalString(banner.endDate));
        setAnalytics({
          viewCount: banner.viewCount,
          clickCount: banner.clickCount,
          dismissCount: banner.dismissCount,
        });
      } catch (err) {
        console.error(err);
        toast.error("Error loading banner");
        setTimeout(() => router.push("/admin/banners"), 2000);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBanner();
  }, [mode, bannerId, router]);

  async function handleDelete() {
    if (!bannerId) return;
    await fetch(`/api/banners/${bannerId}`, { method: "DELETE" });
    router.push("/admin/banners");
  }

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsSaving(true);
    try {
      const body = {
        name,
        type,
        paths,
        enabled,
        frequency,
        contentMode,
        content: contentMode === "EDITOR" ? content : null,
        htmlContent: contentMode === "HTML" ? htmlContent : null,
        modalDelaySeconds: type === "MODAL" && modalDelaySeconds ? Number(modalDelaySeconds) : null,
        modalScrollPercent: type === "MODAL" && modalScrollPercent ? Number(modalScrollPercent) : null,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
      };

      const res =
        mode === "new"
          ? await fetch("/api/banners", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            })
          : await fetch(`/api/banners/${bannerId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || "Failed to save banner");
        return;
      }

      if (mode === "new") {
        const banner = await res.json();
        router.push(`/admin/banners/${banner.id}/edit`);
      } else {
        toast.success("Banner saved");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving banner");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="-m-8 flex flex-col h-screen bg-background">
        <div className="sticky top-0 z-20 border-b border-border bg-card shadow-sm">
          <div className="flex items-center justify-between h-[53px] px-6">
            <Skeleton className="w-40 h-4 rounded" />
            <Skeleton className="w-20 h-8 rounded" />
          </div>
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 p-6 space-y-4">
            <Skeleton className="w-2/3 h-10 rounded" />
            <Skeleton className="w-full h-96 rounded" />
          </div>
          <div className="w-[380px] border-l border-border bg-card p-6 space-y-6">
            <Skeleton className="w-full h-10 rounded" />
            <Skeleton className="w-full h-10 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="-m-8 flex flex-col h-screen bg-background">
      {/* STICKY HEADER */}
      <div className="sticky top-0 z-20 border-b border-border bg-card shadow-sm">
        <div className="flex items-center justify-between h-[53px] px-6">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/admin/banners" className="text-muted-foreground hover:text-foreground transition flex-shrink-0">
              <ArrowLeft size={20} />
            </Link>
            <span className="text-sm text-muted-foreground">Banners</span>
            <span className="text-sm text-muted-foreground/50">/</span>
            <span className="text-sm font-medium text-foreground truncate">
              {name || (mode === "new" ? "New Banner" : "Untitled")}
            </span>
          </div>

          <div className="flex items-center gap-2 ml-4">
            {mode === "edit" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                    <Trash2 size={16} className="mr-1" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete "{name}"?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this banner. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button type="button" onClick={handleSubmit} disabled={isSaving} size="sm">
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL - Name + Content */}
        <div className="flex-1 flex flex-col overflow-auto bg-background">
          <div className="p-6 space-y-4 max-w-4xl mx-auto w-full">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide">
                Name (internal use only)
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Black Friday announcement"
                className="text-lg"
              />
            </div>

            <hr className="border-border" />

            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wide">Content</Label>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${contentMode === "EDITOR" ? "text-foreground" : "text-muted-foreground"}`}>
                  Editor
                </span>
                <Switch
                  checked={contentMode === "HTML"}
                  onCheckedChange={(checked) => setContentMode(checked ? "HTML" : "EDITOR")}
                />
                <span className={`text-xs ${contentMode === "HTML" ? "text-foreground" : "text-muted-foreground"}`}>
                  HTML
                </span>
              </div>
            </div>

            {contentMode === "EDITOR" ? (
              <BlockEditor content={content} onChange={setContent} />
            ) : (
              <div className="rounded-lg border border-border overflow-hidden bg-muted/30">
                <div className="px-3 py-2 bg-yellow-500/10 border-b border-yellow-500/30 text-xs text-yellow-700 dark:text-yellow-400">
                  ⚠️ Inline <code className="bg-yellow-500/20 px-1 rounded">style</code> attributes and form elements will be removed for security.
                </div>
                <div className="flex items-center justify-between px-3 py-2 bg-muted border-b border-border">
                  <span className="text-xs font-medium text-muted-foreground">Raw HTML</span>
                  <button
                    type="button"
                    onClick={() => setHtmlPreview(!htmlPreview)}
                    className="p-1 rounded hover:bg-secondary/80 transition text-muted-foreground hover:text-foreground"
                    title={htmlPreview ? "Show code" : "Show preview"}
                  >
                    {htmlPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {htmlPreview ? (
                  <div
                    className="p-4 prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: sanitizeRawHtml(htmlContent) }}
                  />
                ) : (
                  <textarea
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    className="w-full p-4 bg-transparent text-sm font-mono text-foreground resize-y focus:outline-none min-h-[240px]"
                    placeholder="<div>Your HTML here...</div>"
                    spellCheck={false}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <aside className="w-[380px] shrink-0 border-l border-border bg-card overflow-y-auto p-6 space-y-6">
          {/* Targeting */}
          <div className="space-y-4">
            <Label className="text-xs font-semibold uppercase tracking-wide">Targeting</Label>
            <div className="space-y-2">
              <Label htmlFor="type" className="text-xs font-medium">Type</Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as BannerType)}
                className="w-full border border-border/70 rounded-[var(--radius)] px-3 py-2 text-sm bg-muted/30 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="TOP">Top bar</option>
                <option value="MODAL">Modal popup</option>
                <option value="BOTTOM">Bottom bar</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Pages</Label>
              <PathsListInput value={paths} onChange={setPaths} />
            </div>
          </div>

          <hr className="border-border" />

          {/* Behavior */}
          <div className="space-y-4">
            <Label className="text-xs font-semibold uppercase tracking-wide">Behavior</Label>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Enabled</Label>
              <Switch checked={enabled} onCheckedChange={setEnabled} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency" className="text-xs font-medium">Frequency</Label>
              <select
                id="frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as BannerFrequency)}
                className="w-full border border-border/70 rounded-[var(--radius)] px-3 py-2 text-sm bg-muted/30 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="ALWAYS">Always</option>
                <option value="ONCE_PER_SESSION">Once per session</option>
                <option value="DONT_SHOW_AGAIN">Don't show again</option>
              </select>
              <p className="text-xs text-muted-foreground">{FREQUENCY_HELP[frequency]}</p>
            </div>
            {type === "MODAL" && (
              <div className="space-y-3 rounded-lg border border-border/70 p-3 bg-muted/20">
                <p className="text-xs text-muted-foreground">
                  Modal trigger — whichever fires first shows the popup. Leave both empty to show immediately.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="delay" className="text-xs font-medium">Delay (seconds)</Label>
                  <Input
                    id="delay"
                    type="number"
                    min={0}
                    max={600}
                    value={modalDelaySeconds}
                    onChange={(e) => setModalDelaySeconds(e.target.value)}
                    placeholder="e.g. 5"
                    className="bg-muted/30 border-border/70"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scroll" className="text-xs font-medium">Scroll (%)</Label>
                  <Input
                    id="scroll"
                    type="number"
                    min={0}
                    max={100}
                    value={modalScrollPercent}
                    onChange={(e) => setModalScrollPercent(e.target.value)}
                    placeholder="e.g. 50"
                    className="bg-muted/30 border-border/70"
                  />
                </div>
              </div>
            )}
          </div>

          <hr className="border-border" />

          {/* Scheduling */}
          <div className="space-y-4">
            <Label className="text-xs font-semibold uppercase tracking-wide">Scheduling</Label>
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-xs font-medium">Start date</Label>
              <input
                id="startDate"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-border/70 rounded-[var(--radius)] px-3 py-2 text-sm bg-muted/30 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 dark:[color-scheme:dark]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-xs font-medium">End date</Label>
              <input
                id="endDate"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-border/70 rounded-[var(--radius)] px-3 py-2 text-sm bg-muted/30 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 dark:[color-scheme:dark]"
              />
            </div>
            <p className="text-xs text-muted-foreground">Leave empty for no start/end limit.</p>
          </div>

          {mode === "edit" && (
            <>
              <hr className="border-border" />
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wide">Analytics</Label>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg border border-border/70 p-2">
                    <div className="text-lg font-semibold">{analytics.viewCount}</div>
                    <div className="text-xs text-muted-foreground">Views</div>
                  </div>
                  <div className="rounded-lg border border-border/70 p-2">
                    <div className="text-lg font-semibold">{analytics.clickCount}</div>
                    <div className="text-xs text-muted-foreground">Clicks</div>
                  </div>
                  <div className="rounded-lg border border-border/70 p-2">
                    <div className="text-lg font-semibold">{analytics.dismissCount}</div>
                    <div className="text-xs text-muted-foreground">Dismisses</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
