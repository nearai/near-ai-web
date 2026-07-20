"use client";

import { usePathname } from "next/navigation";
import { pickActiveBannerPerSlot } from "@cms/lib/banner-matching";
import BannerView, { type SerializedBanner } from "./BannerView";

// Mounted twice in the site layout: "top" before {children} (so a push-mode TOP
// banner displaces the header/content), "bottom" after {children} (so a push-mode
// BOTTOM banner lands after the footer instead of floating over it).
export default function BannerHost({
  banners,
  slot,
}: {
  banners: SerializedBanner[];
  slot: "top" | "bottom";
}) {
  const pathname = usePathname();
  const { top, modal, bottom } = pickActiveBannerPerSlot(banners, pathname ?? "/");

  if (slot === "bottom") {
    return bottom ? <BannerView key={bottom.id} banner={bottom} /> : null;
  }

  return (
    <>
      {top && <BannerView key={top.id} banner={top} />}
      {modal && <BannerView key={modal.id} banner={modal} />}
    </>
  );
}
