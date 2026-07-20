import DOMPurify from "isomorphic-dompurify";

export const RAW_HTML_SANITIZE_CONFIG = {
  FORBID_TAGS: ["form", "input", "button", "select", "textarea", "base", "meta"],
  FORBID_ATTR: ["style"],
};

export function sanitizeRawHtml(html: string | null | undefined): string {
  return DOMPurify.sanitize(html ?? "", RAW_HTML_SANITIZE_CONFIG);
}
