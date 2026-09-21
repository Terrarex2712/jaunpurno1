"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  endAdminSession,
  isAdminConfigured,
  requireAdmin,
  startAdminSession,
  verifyAdminPassword,
} from "@/lib/auth/admin";
import { getRepositories } from "@/lib/db";
import { isDomainError } from "@/lib/domain/errors";
import type { VotingStatus } from "@/lib/domain/types";
import {
  createTeam,
  deleteTeam,
  setTeamActive,
  updateTeam,
  type TeamFormInput,
} from "@/lib/services/teams";

/**
 * Admin server actions.
 *
 * Every mutation calls `requireAdmin()` first. These run on the server, so a
 * crafted request reaches the same guard the UI does.
 */

export type ActionState = { error?: string; ok?: boolean };

function revalidatePublicPages(): void {
  revalidatePath("/");
  revalidatePath("/vidhan-sabha");
  revalidatePath("/results");
  revalidatePath("/admin");
  revalidatePath("/admin/teams");
  revalidatePath("/admin/votes");
}

// --- Session ----------------------------------------------------------------

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isAdminConfigured()) {
    return { error: "ADMIN_PASSWORD set nahi hai. .env.local mein set karein." };
  }

  const password = String(formData.get("password") ?? "");
  if (!password) return { error: "Password enter karein." };
  if (!verifyAdminPassword(password)) return { error: "Galat password." };

  await startAdminSession();
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await endAdminSession();
  redirect("/admin/login");
}

// --- Teams ------------------------------------------------------------------

function readTeamForm(formData: FormData): TeamFormInput {
  return {
    name: String(formData.get("name") ?? ""),
    captainName: String(formData.get("captainName") ?? ""),
    constituencyId: String(formData.get("constituencyId") ?? ""),
    locality: String(formData.get("locality") ?? ""),
    shortDescription: String(formData.get("shortDescription") ?? ""),
    active: formData.get("active") === "on",
  };
}

export async function saveTeamAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();
    const id = String(formData.get("id") ?? "");
    const input = readTeamForm(formData);

    if (id) {
      await updateTeam(getRepositories(), id, input);
    } else {
      await createTeam(getRepositories(), input);
    }
  } catch (error) {
    if (isDomainError(error)) return { error: error.message };
    console.error("saveTeamAction failed", error);
    return { error: "Team save nahi ho payi. Dobara try karein." };
  }

  revalidatePublicPages();
  redirect("/admin/teams?saved=1");
}

export async function toggleTeamActiveAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "true";
  await setTeamActive(getRepositories(), id, active);
  revalidatePublicPages();
}

export async function deleteTeamAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");

  try {
    await deleteTeam(getRepositories(), id);
  } catch (error) {
    // A team holding votes must be deactivated, not deleted — surface that
    // through the query string rather than destroying vote records.
    if (isDomainError(error) && error.code === "TEAM_HAS_VOTES") {
      revalidatePath("/admin/teams");
      redirect("/admin/teams?error=has-votes");
    }
    throw error;
  }

  revalidatePublicPages();
  redirect("/admin/teams?deleted=1");
}

// --- Voting status ----------------------------------------------------------

export async function setVotingStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const next = String(formData.get("status") ?? "");
  if (next !== "open" && next !== "closed") return;
  await getRepositories().settings.setVotingStatus(next as VotingStatus);
  revalidatePublicPages();
}
