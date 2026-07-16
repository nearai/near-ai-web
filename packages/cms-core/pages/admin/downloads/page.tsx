import { auth } from "@cms/lib/auth";
import { DownloadsClient } from "./DownloadsClient";

export default async function DownloadsPage() {
  const session = await auth();
  const role = (session?.user as any)?.role ?? "VIEWER";

  return <DownloadsClient canBulkDelete={role === "ADMIN"} />;
}
