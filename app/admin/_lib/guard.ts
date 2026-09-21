import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth/admin";

/**
 * Page-level guard. Server actions guard themselves with `requireAdmin()` —
 * this only stops an unauthenticated visitor from seeing the admin shell.
 */
export async function ensureAdminPage(): Promise<void> {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
}
