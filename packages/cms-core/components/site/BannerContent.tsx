import { renderBlocks } from "@cms/lib/tiptap-renderer";
import { sanitizeRawHtml } from "@cms/lib/sanitize-html";

export interface BannerContentData {
  contentMode: "EDITOR" | "HTML";
  content: any;
  htmlContent: string | null;
}

export default function BannerContent({ banner }: { banner: BannerContentData }) {
  if (banner.contentMode === "HTML") {
    return <div dangerouslySetInnerHTML={{ __html: sanitizeRawHtml(banner.htmlContent) }} />;
  }
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {renderBlocks(banner.content?.content ?? [])}
    </div>
  );
}
