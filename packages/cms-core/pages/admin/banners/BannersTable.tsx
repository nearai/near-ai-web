"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Switch } from "@cms/components/ui/switch";
import { Badge } from "@cms/components/ui/badge";
import { Button } from "@cms/components/ui/button";
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
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface BannerRow {
  id: string;
  name: string;
  type: "TOP" | "MODAL" | "BOTTOM";
  paths: string[];
  enabled: boolean;
  frequency: "ALWAYS" | "ONCE_PER_SESSION" | "DONT_SHOW_AGAIN";
  viewCount: number;
  clickCount: number;
  dismissCount: number;
  createdAt: string;
}

const FREQUENCY_LABEL: Record<BannerRow["frequency"], string> = {
  ALWAYS: "Always",
  ONCE_PER_SESSION: "Once per session",
  DONT_SHOW_AGAIN: "Don't show again",
};

function EnabledToggle({ id, enabled }: { id: string; enabled: boolean }) {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle(checked: boolean) {
    setLoading(true);
    try {
      const res = await fetch(`/api/banners/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: checked }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        toast.error(error.error || "Failed to update banner");
        return;
      }
      setIsEnabled(checked);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return <Switch checked={isEnabled} onCheckedChange={toggle} disabled={loading} />;
}

function DeleteBannerButton({ id, name }: { id: string; name: string }) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);
    try {
      await fetch(`/api/banners/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
          <Trash2 className="w-4 h-4" />
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
          <AlertDialogAction onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function BannersTable({ banners, userRole }: { banners: BannerRow[]; userRole: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="px-6 py-3 font-medium">Name</th>
            <th className="px-6 py-3 font-medium">Type</th>
            <th className="px-6 py-3 font-medium">Pages</th>
            <th className="px-6 py-3 font-medium">Enabled</th>
            <th className="px-6 py-3 font-medium">Frequency</th>
            <th className="px-6 py-3 font-medium">Views / Clicks / Dismisses</th>
            <th className="px-6 py-3 font-medium">Created</th>
            <th className="px-6 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {banners.map((banner) => (
            <tr key={banner.id} className="border-b border-border last:border-0">
              <td className="px-6 py-3">
                <Link href={`/admin/banners/${banner.id}/edit`} className="font-medium hover:underline">
                  {banner.name}
                </Link>
              </td>
              <td className="px-6 py-3">
                <Badge variant="outline">{banner.type}</Badge>
              </td>
              <td className="px-6 py-3 text-muted-foreground">
                {banner.paths.length === 0 ? "All pages" : banner.paths.join(", ")}
              </td>
              <td className="px-6 py-3">
                <EnabledToggle id={banner.id} enabled={banner.enabled} />
              </td>
              <td className="px-6 py-3 text-muted-foreground">{FREQUENCY_LABEL[banner.frequency]}</td>
              <td className="px-6 py-3 text-muted-foreground">
                {banner.viewCount} / {banner.clickCount} / {banner.dismissCount}
              </td>
              <td className="px-6 py-3 text-muted-foreground">
                {new Date(banner.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/banners/${banner.id}/edit`}>Edit</Link>
                  </Button>
                  {userRole !== "VIEWER" && <DeleteBannerButton id={banner.id} name={banner.name} />}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
