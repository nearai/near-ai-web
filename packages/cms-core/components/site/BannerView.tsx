"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { isBannerDismissed, markBannerDismissed, type BannerFrequency } from "@cms/lib/banner-storage";
import BannerContent, { type BannerContentData } from "./BannerContent";

export interface SerializedBanner extends BannerContentData {
  id: string;
  type: "TOP" | "MODAL" | "BOTTOM";
  paths: string[];
  frequency: BannerFrequency;
  modalDelaySeconds: number | null;
  modalScrollPercent: number | null;
}

function track(id: string, event: "VIEW" | "CLICK" | "DISMISS") {
  fetch("/api/banners/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, event }),
    keepalive: true,
  }).catch(() => {});
}

export default function BannerView({ banner }: { banner: SerializedBanner }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const hasTrackedView = useRef(false);

  useEffect(() => {
    if (isBannerDismissed(banner.id, banner.frequency)) {
      setDismissed(true);
      return;
    }

    if (banner.type !== "MODAL") {
      setVisible(true);
      return;
    }

    const hasDelay = banner.modalDelaySeconds != null;
    const hasScroll = banner.modalScrollPercent != null;
    if (!hasDelay && !hasScroll) {
      setVisible(true);
      return;
    }

    let fired = false;
    const fire = () => {
      if (!fired) {
        fired = true;
        setVisible(true);
      }
    };

    let timer: ReturnType<typeof setTimeout> | undefined;
    if (hasDelay) timer = setTimeout(fire, banner.modalDelaySeconds! * 1000);

    function onScroll() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 100;
      if (pct >= banner.modalScrollPercent!) fire();
    }
    if (hasScroll) window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (timer) clearTimeout(timer);
      if (hasScroll) window.removeEventListener("scroll", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banner.id]);

  useEffect(() => {
    if (visible && !hasTrackedView.current) {
      hasTrackedView.current = true;
      track(banner.id, "VIEW");
    }
  }, [visible, banner.id]);

  function handleDismiss() {
    setVisible(false);
    markBannerDismissed(banner.id, banner.frequency);
    track(banner.id, "DISMISS");
  }

  function handleContentClick(e: React.MouseEvent<HTMLDivElement>) {
    const link = (e.target as HTMLElement).closest("a");
    if (link) track(banner.id, "CLICK");
  }

  if (dismissed || !visible) return null;

  const wrapperClass =
    banner.type === "TOP"
      ? "fixed top-0 left-0 right-0 z-50"
      : banner.type === "BOTTOM"
      ? "fixed bottom-0 left-0 right-0 z-50"
      : "fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4";

  const innerClass =
    banner.type === "MODAL"
      ? "relative max-w-lg w-full bg-background rounded-2xl shadow-xl p-6"
      : "relative bg-background border-b border-border px-4 py-3 pr-10";

  return (
    <div className={wrapperClass} onClick={handleContentClick}>
      <div className={innerClass}>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close"
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition"
        >
          <X size={16} />
        </button>
        <BannerContent banner={banner} />
      </div>
    </div>
  );
}
