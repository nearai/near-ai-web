import DOMPurify from "isomorphic-dompurify";

// Used for the `rawHtmlBlock` node embedded inline within blog/page TipTap content —
// inline styles are stripped there since a stray `position: fixed` etc. could break
// the surrounding article layout.
export const RAW_HTML_SANITIZE_CONFIG = {
  FORBID_TAGS: ["form", "input", "button", "select", "textarea", "base", "meta"],
  FORBID_ATTR: ["style"],
};

export function sanitizeRawHtml(html: string | null | undefined): string {
  return DOMPurify.sanitize(html ?? "", RAW_HTML_SANITIZE_CONFIG);
}

// Used for a banner's dedicated HTML content mode — banners are a standalone chrome
// element the author fully designs, so inline `style` and `<style>` blocks are kept
// intact (that's the whole point of choosing HTML mode). Still blocks script-adjacent
// and form-like tags.
export const BANNER_HTML_SANITIZE_CONFIG = {
  FORBID_TAGS: ["form", "input", "button", "select", "textarea", "base", "meta"],
  ADD_TAGS: ["style"],
};

export function sanitizeBannerHtml(html: string | null | undefined): string {
  return DOMPurify.sanitize(html ?? "", BANNER_HTML_SANITIZE_CONFIG);
}
