import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ensureAdminPage } from "@/app/admin/_lib/guard";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { TeamForm } from "@/components/admin/team-form";
import { getRepositories } from "@/lib/db";
import { formatCount } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = { title: "Edit team" };

type PageProps = { params: Promise<{ id: string }> };

export default async function EditTeamPage({ params }: PageProps) {
  await ensureAdminPage();
  const { id } = await params;

  const repositories = getRepositories();
  const team = await repositories.teams.findById(id);
  if (!team) notFound();

  const [constituencies, votes] = await Promise.all([
    repositories.constituencies.list(),
    repositories.votes.countForTeam(team.id),
  ]);

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
          Edit team
        </h1>
        <p className="tabular mt-2 text-[0.9375rem] text-chalk-dim">
          {team.name} — {formatCount(votes)} votes
        </p>

        {votes > 0 && (
          <p className="mt-5 max-w-xl border border-turf bg-pitch p-3 text-[0.8125rem] leading-relaxed text-chalk-dim">
            Is team ke paas votes hain. Vidhan Sabha badalne par woh votes bhi
            nayi Vidhan Sabha ke totals mein chale jaayenge — sirf tab badlein
            jab team sach mein galat kshetra mein daali gayi thi.
          </p>
        )}

        <div className="mt-8">
          <TeamForm constituencies={constituencies} team={team} />
        </div>
      </main>
    </div>
  );
}
