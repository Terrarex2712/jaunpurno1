import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ensureAdminPage } from "@/app/admin/_lib/guard";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { TeamForm } from "@/components/admin/team-form";
import { getRepositories } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = { title: "Add team" };

type PageProps = { searchParams: Promise<{ constituency?: string }> };

export default async function NewTeamPage({ searchParams }: PageProps) {
  await ensureAdminPage();
  const params = await searchParams;

  const constituencies = await getRepositories().constituencies.list();
  const preselected = params.constituency
    ? constituencies.find((c) => c.slug === params.constituency)?.id
    : undefined;

  return (
    <div className="lg:flex">
      <AdminSidebar />

      <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10">
        <Link
          href="/admin/teams"
          className="inline-flex min-h-11 items-center gap-1 text-[0.8125rem] font-medium text-chalk-dim hover:text-floodlight"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Back to teams
        </Link>

        <h1 className="display mt-4 text-[clamp(1.75rem,6vw,2.75rem)] text-chalk">
          Add team
        </h1>
        <p className="mt-2 text-[0.9375rem] text-chalk-dim">
          Nayi team turant public listing mein dikhegi agar active hai.
        </p>

        <div className="mt-8">
          <TeamForm constituencies={constituencies} defaultConstituencyId={preselected} />
        </div>
      </main>
    </div>
  );
}
