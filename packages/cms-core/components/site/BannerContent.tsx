import { renderBlocks } from "@cms/lib/tiptap-renderer";
import { sanitizeBannerHtml } from "@cms/lib/sanitize-html";

export interface BannerContentData {
  contentMode: "EDITOR" | "HTML";
  content: any;
  htmlContent: string | null;
}

export default function BannerContent({ banner }: { banner: BannerContentData }) {
  if (banner.contentMode === "HTML") {
    return (
      <div
        className="w-full"
        dangerouslySetInnerHTML={{ __html: sanitizeBannerHtml(banner.htmlContent) }}
      />
    );
  }
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none text-center mx-auto">
      {renderBlocks(banner.content?.content ?? [])}
    </div>
  );
}
