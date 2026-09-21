import Link from "next/link";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { ensureAdminPage } from "@/app/admin/_lib/guard";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { TeamsTable, type AdminTeamRow } from "@/components/admin/teams-table";
import { Button } from "@/components/ui/button";
import { getRepositories } from "@/lib/db";
import { formatCount } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PageProps = {
  searchParams: Promise<{ constituency?: string; saved?: string; deleted?: string; error?: string }>;
};

const NOTICES = {
  saved: { tone: "ok", text: "Team save ho gayi." },
  deleted: { tone: "ok", text: "Team delete ho gayi." },
  "has-votes": {
    tone: "error",
    text: "Is team ke paas votes hain, isliye delete nahi ho sakti. Ise deactivate karein.",
  },
} as const;

export default async function AdminTeamsPage({ searchParams }: PageProps) {
  await ensureAdminPage();
  const params = await searchParams;

  const repositories = getRepositories();
  const constituencies = await repositories.constituencies.list();
  const selected = params.constituency
    ? (constituencies.find((c) => c.slug === params.constituency) ?? null)
    : null;

  const [teams, countsByTeam] = await Promise.all([
    repositories.teams.list(selected ? { constituencyId: selected.id } : {}),
    repositories.votes.countsByTeam(),
  ]);

  const byId = new Map(constituencies.map((c) => [c.id, c]));
  const rows: AdminTeamRow[] = teams.flatMap((team) => {
    const constituency = byId.get(team.constituencyId);
    if (!constituency) return [];
    return [{ team, votes: countsByTeam.get(team.id) ?? 0, constituency }];
  });

  const notice =
    params.error === "has-votes"
      ? NOTICES["has-votes"]
      : params.saved
        ? NOTICES.saved
        : params.deleted
          ? NOTICES.deleted
          : null;

  return (
    <div className="lg:flex">
      <AdminSidebar />

      <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="display text-[clamp(1.75rem,6vw,2.75rem)] text-chalk">Teams</h1>
            <p className="mt-2 text-[0.9375rem] text-chalk-dim">
              {selected
                ? `${selected.name} ki teams — ${formatCount(rows.length)} total.`
                : `Sabhi Vidhan Sabha ki teams — ${formatCount(rows.length)} total.`}
            </p>
          </div>
          <Button asChild size="md">
            <Link
              href={
                selected ? `/admin/teams/new?constituency=${selected.slug}` : "/admin/teams/new"
              }
            >
              Add team
            </Link>
          </Button>
        </div>

        {notice && (
          <p
            role="status"
            className={`mt-6 flex items-start gap-2 border p-3 text-[0.8125rem] ${
              notice.tone === "ok"
                ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                : "border-leather/50 bg-leather/10 text-leather-soft"
            }`}
          >
            {notice.tone === "ok" ? (
              <CheckCircle2 className="mt-px h-4 w-4 shrink-0" aria-hidden />
            ) : (
              <AlertCircle className="mt-px h-4 w-4 shrink-0" aria-hidden />
            )}
            {notice.text}
          </p>
        )}

        <nav aria-label="Filter by Vidhan Sabha" className="mt-7">
          <ul className="flex flex-wrap gap-2">
            <li>
              <Link
                href="/admin/teams"
                aria-current={!selected ? "true" : undefined}
                className={`inline-flex min-h-9 items-center rounded-[3px] border px-3 text-[0.8125rem] font-medium ${
                  !selected
                    ? "border-floodlight/50 bg-floodlight/12 text-floodlight"
                    : "border-turf bg-pitch text-chalk-dim hover:text-chalk"
                }`}
              >
                All
              </Link>
            </li>
            {constituencies.map((constituency) => {
              const active = selected?.id === constituency.id;
              return (
                <li key={constituency.id}>
                  <Link
                    href={`/admin/teams?constituency=${constituency.slug}`}
                    aria-current={active ? "true" : undefined}
                    className={`inline-flex min-h-9 items-center rounded-[3px] border px-3 text-[0.8125rem] font-medium ${
                      active
                        ? "border-floodlight/50 bg-floodlight/12 text-floodlight"
                        : "border-turf bg-pitch text-chalk-dim hover:text-chalk"
                    }`}
                  >
                    {constituency.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-6">
          <TeamsTable rows={rows} />
        </div>
      </main>
    </div>
  );
}
