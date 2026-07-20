"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { isBannerDismissed, markBannerDismissed, type BannerFrequency } from "@cms/lib/banner-storage";
import BannerContent, { type BannerContentData } from "./BannerContent";

export type ModalPosition =
  | "TOP_LEFT" | "TOP_CENTER" | "TOP_RIGHT"
  | "CENTER_LEFT" | "CENTER" | "CENTER_RIGHT"
  | "BOTTOM_LEFT" | "BOTTOM_CENTER" | "BOTTOM_RIGHT";

export interface SerializedBanner extends BannerContentData {
  id: string;
  type: "TOP" | "MODAL" | "BOTTOM";
  paths: string[];
  frequency: BannerFrequency;
  modalDelaySeconds: number | null;
  modalScrollPercent: number | null;
  modalPosition: ModalPosition;
}

const TRANSITION_MS = 200;

function track(id: string, event: "VIEW" | "CLICK" | "DISMISS") {
  fetch("/api/banners/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, event }),
    keepalive: true,
  }).catch(() => {});
}

// Only CENTER gets the classic dimmed full-screen modal treatment. Every other
// position floats as a toast-like card anchored to that corner/edge, no backdrop.
const MODAL_POSITION_WRAPPER: Record<ModalPosition, string> = {
  CENTER: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4",
  TOP_LEFT: "fixed top-4 left-4 z-50",
  TOP_CENTER: "fixed top-4 left-1/2 -translate-x-1/2 z-50",
  TOP_RIGHT: "fixed top-4 right-4 z-50",
  CENTER_LEFT: "fixed top-1/2 left-4 -translate-y-1/2 z-50",
  CENTER_RIGHT: "fixed top-1/2 right-4 -translate-y-1/2 z-50",
  BOTTOM_LEFT: "fixed bottom-4 left-4 z-50",
  BOTTOM_CENTER: "fixed bottom-4 left-1/2 -translate-x-1/2 z-50",
  BOTTOM_RIGHT: "fixed bottom-4 right-4 z-50",
};

export default function BannerView({ banner }: { banner: SerializedBanner }) {
  const [triggered, setTriggered] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const hasTrackedView = useRef(false);

  useEffect(() => {
    if (isBannerDismissed(banner.id, banner.frequency)) {
      setDismissed(true);
      return;
    }

    if (banner.type !== "MODAL") {
      setTriggered(true);
      return;
    }

    const hasDelay = banner.modalDelaySeconds != null;
    const hasScroll = banner.modalScrollPercent != null;
    if (!hasDelay && !hasScroll) {
      setTriggered(true);
      return;
    }

    let fired = false;
    const fire = () => {
      if (!fired) {
        fired = true;
        setTriggered(true);
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

  // Mount into the DOM once triggered, then flip `shown` on the next frame so the
  // enter transition actually animates from its initial (hidden) state.
  useEffect(() => {
    if (triggered && !dismissed) setMounted(true);
  }, [triggered, dismissed]);

  useEffect(() => {
    if (!mounted) return;
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, [mounted]);

  useEffect(() => {
    if (shown && !hasTrackedView.current) {
      hasTrackedView.current = true;
      track(banner.id, "VIEW");
    }
  }, [shown, banner.id]);

  function handleDismiss() {
    setShown(false);
    markBannerDismissed(banner.id, banner.frequency);
    track(banner.id, "DISMISS");
    setTimeout(() => setMounted(false), TRANSITION_MS);
  }

  function handleContentClick(e: React.MouseEvent<HTMLDivElement>) {
    const link = (e.target as HTMLElement).closest("a");
    if (link) track(banner.id, "CLICK");
  }

  if (dismissed || !mounted) return null;

  const isModal = banner.type === "MODAL";
  const isHtml = banner.contentMode === "HTML";
  const position = banner.modalPosition ?? "CENTER";
  const isCenterModal = isModal && position === "CENTER";

  const wrapperClass = isModal
    ? MODAL_POSITION_WRAPPER[position]
    : `fixed ${banner.type === "TOP" ? "top-0" : "bottom-0"} left-0 right-0 z-50`;

  const overlayTransition = `transition-opacity duration-200 ease-out ${shown ? "opacity-100" : "opacity-0"}`;

  const cardBaseClass = isCenterModal
    ? "relative max-w-lg w-full rounded-2xl shadow-xl"
    : "relative max-w-sm rounded-2xl shadow-xl";
  const cardChromeClass = isHtml ? "" : "bg-background p-6";
  const cardTransition = `transition-all duration-200 ease-out ${shown ? "scale-100 opacity-100" : "scale-95 opacity-0"}`;

  const barChromeClass = isHtml
    ? "relative w-full"
    : `relative w-full bg-background px-4 py-3 pr-10 flex items-center justify-center text-center ${
        banner.type === "TOP" ? "border-b" : "border-t"
      } border-border`;
  const barTransition = `transition-all duration-200 ease-out ${
    shown ? "translate-y-0 opacity-100" : `${banner.type === "TOP" ? "-translate-y-full" : "translate-y-full"} opacity-0`
  }`;

  const innerClass = isModal
    ? `${cardBaseClass} ${cardChromeClass} ${cardTransition}`
    : `${barChromeClass} ${barTransition}`;

  return (
    <div
      className={isModal ? `${wrapperClass} ${isCenterModal ? overlayTransition : ""}` : wrapperClass}
      onClick={handleContentClick}
    >
      <div className={innerClass}>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 text-muted-foreground hover:text-foreground transition bg-background/70 rounded-full p-0.5"
        >
          <X size={16} />
        </button>
        <BannerContent banner={banner} />
      </div>
    </div>
  );
}
