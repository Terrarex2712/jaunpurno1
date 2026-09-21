import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { JaunpurMark } from "@/components/brand-mark";
import { isAdminAuthenticated, isAdminConfigured } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = { title: "Login" };

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) redirect("/admin");
  const configured = isAdminConfigured();

  return (
    <main className="mx-auto grid min-h-dvh max-w-md place-items-center px-4 py-12">
      <div className="w-full">
        <Link href="/" className="inline-flex items-center gap-2.5 rounded-[2px]">
          <JaunpurMark className="h-8 w-8" />
          <span className="display-tight text-base text-chalk-dim">
            Back to Jaunpur No.1
          </span>
        </Link>

        <h1 className="display mt-8 text-4xl text-chalk">Organiser login</h1>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-chalk-dim">
          Tournament teams aur voting status manage karne ke liye admin password
          enter karein.
        </p>

        {configured ? (
          <LoginForm />
        ) : (
          <div className="mt-7 border border-leather/50 bg-leather/10 p-4">
            <h2 className="text-[0.9375rem] font-semibold text-leather-soft">
              ADMIN_PASSWORD set nahi hai
            </h2>
            <p className="mt-2 text-[0.8125rem] leading-relaxed text-chalk-dim">
              Project root mein <code className="text-chalk">.env.local</code>{" "}
              banayein, usme{" "}
              <code className="text-chalk">ADMIN_PASSWORD=your-password</code>{" "}
              likhein aur dev server restart karein.
            </p>
          </div>
        )}

        <p className="mt-8 text-[0.75rem] leading-relaxed text-chalk-faint">
          Prototype authentication: ek shared password aur HTTP-only cookie.
          Production mein ise proper user accounts se replace karna zaroori hai.
        </p>
      </div>
    </main>
  );
}
