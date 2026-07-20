import { auth } from "@cms/lib/auth";
import { redirect } from "next/navigation";
import BannerFormClient from "@cms/components/admin/BannerFormClient";

export default async function EditBannerPage() {
  const session = await auth();
  if ((session?.user as any)?.role === "VIEWER") redirect("/admin/banners");
  const userRole = (session?.user as any)?.role || "VIEWER";
  return <BannerFormClient mode="edit" userRole={userRole} />;
}
