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

function normalizePattern(pattern: string): { prefix: string; wildcard: boolean } {
  return pattern.endsWith("/*")
    ? { prefix: pattern.slice(0, -2), wildcard: true }
    : { prefix: pattern, wildcard: false };
}

function patternsOverlap(a: string, b: string): boolean {
  const pa = normalizePattern(a);
  const pb = normalizePattern(b);

  if (!pa.wildcard && !pb.wildcard) return pa.prefix === pb.prefix;

  if (pa.wildcard && pb.wildcard) {
    return (
      pa.prefix === pb.prefix ||
      pa.prefix.startsWith(`${pb.prefix}/`) ||
      pb.prefix.startsWith(`${pa.prefix}/`)
    );
  }

  const wildcard = pa.wildcard ? pa : pb;
  const exact = pa.wildcard ? pb : pa;
  return exact.prefix === wildcard.prefix || exact.prefix.startsWith(`${wildcard.prefix}/`);
}

// Used to prevent two enabled TOP (or two enabled BOTTOM) banners from both
// targeting the same page — only one can ever render there (see
// pickActiveBannerPerSlot), so a second one would silently never show.
export function bannerPathsOverlap(pathsA: string[], pathsB: string[]): boolean {
  if (pathsA.length === 0 || pathsB.length === 0) return true;
  return pathsA.some((a) => pathsB.some((b) => patternsOverlap(a, b)));
}
