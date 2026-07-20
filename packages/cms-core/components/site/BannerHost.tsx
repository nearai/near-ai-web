"use client";

import { usePathname } from "next/navigation";
import { pickActiveBannerPerSlot } from "@cms/lib/banner-matching";
import BannerView, { type SerializedBanner } from "./BannerView";

export default function BannerHost({ banners }: { banners: SerializedBanner[] }) {
  const pathname = usePathname();
  const { top, modal, bottom } = pickActiveBannerPerSlot(banners, pathname ?? "/");

  return (
    <>
      {top && <BannerView key={top.id} banner={top} />}
      {modal && <BannerView key={modal.id} banner={modal} />}
      {bottom && <BannerView key={bottom.id} banner={bottom} />}
    </>
  );
}
