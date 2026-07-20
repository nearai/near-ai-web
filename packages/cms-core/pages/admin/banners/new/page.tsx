import { auth } from "@cms/lib/auth";
import { redirect } from "next/navigation";
import BannerFormClient from "@cms/components/admin/BannerFormClient";

export default async function NewBannerPage() {
  const session = await auth();
  if ((session?.user as any)?.role === "VIEWER") redirect("/admin/banners");
  return <BannerFormClient mode="new" />;
}
