export type BannerSlotType = "TOP" | "MODAL" | "BOTTOM";

export function matchesBannerPath(pattern: string, pathname: string): boolean {
  if (pattern.endsWith("/*")) {
    const prefix = pattern.slice(0, -2);
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  }
  return pathname === pattern;
}

export function bannerAppliesToPath(paths: string[], pathname: string): boolean {
  if (!paths || paths.length === 0) return true;
  return paths.some((pattern) => matchesBannerPath(pattern, pathname));
}

export function pickActiveBannerPerSlot<T extends { type: BannerSlotType; paths: string[] }>(
  banners: T[],
  pathname: string
): { top?: T; modal?: T; bottom?: T } {
  const matching = banners.filter((banner) => bannerAppliesToPath(banner.paths, pathname));
  return {
    top: matching.find((banner) => banner.type === "TOP"),
    modal: matching.find((banner) => banner.type === "MODAL"),
    bottom: matching.find((banner) => banner.type === "BOTTOM"),
  };
}
