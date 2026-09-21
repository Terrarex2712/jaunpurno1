"use server";

import { revalidatePath } from "next/cache";
import { getRepositories } from "@/lib/db";
import { isDomainError, type DomainErrorCode } from "@/lib/domain/errors";
import type { VoteReceipt } from "@/lib/domain/types";
import { castVote } from "@/lib/services/voting";

/**
 * Messages shown to voters.
 *
 * The duplicate message deliberately says nothing about the earlier vote —
 * not the team, not the constituency, not who cast it.
 */
const MESSAGES: Record<DomainErrorCode, string> = {
  INVALID_NAME: "Apna poora naam likhein (kam se kam 2 akshar).",
  INVALID_PHONE: "Valid 10 digit mobile number enter karein.",
  TEAM_NOT_FOUND: "Yeh team ab available nahi hai. Page refresh karein.",
  INACTIVE_TEAM: "Yeh team abhi vote accept nahi kar rahi.",
  DUPLICATE_VOTE: "Is mobile number se vote pehle hi submit ho chuka hai.",
  VOTING_CLOSED: "Voting band ho chuki hai. Results dekhein.",
  CONSTITUENCY_NOT_FOUND: "Vidhan Sabha nahi mili. Page refresh karein.",
  TEAM_HAS_VOTES: "Is team ke paas votes hain.",
  DUPLICATE_TEAM_NAME: "Yeh team name pehle se use ho raha hai.",
  UNAUTHORIZED: "Aapko iski permission nahi hai.",
};

const GENERIC_ERROR = "Kuch gadbad ho gayi. Dobara try karein.";

export type VoteActionResult =
  | { ok: true; receipt: VoteReceipt }
  | { ok: false; code: DomainErrorCode | "UNKNOWN"; message: string; field?: "voterName" | "phone" };

function fieldFor(code: DomainErrorCode): "voterName" | "phone" | undefined {
  if (code === "INVALID_NAME") return "voterName";
  if (code === "INVALID_PHONE" || code === "DUPLICATE_VOTE") return "phone";
  return undefined;
}

/**
 * Cast one vote. Every rule is enforced in `castVote` on the server; this
 * wrapper only turns domain errors into copy the dialog can render.
 */
export async function submitVote(input: {
  voterName: string;
  phone: string;
  teamId: string;
}): Promise<VoteActionResult> {
  try {
    const receipt = await castVote(getRepositories(), {
      voterName: input.voterName,
      phone: input.phone,
      teamId: input.teamId,
    });

    revalidatePath("/");
    revalidatePath("/results");
    revalidatePath("/vidhan-sabha");
    revalidatePath(`/vidhan-sabha/${receipt.constituencySlug}`);

    return { ok: true, receipt };
  } catch (error) {
    if (isDomainError(error)) {
      return {
        ok: false,
        code: error.code,
        message: MESSAGES[error.code] ?? GENERIC_ERROR,
        field: fieldFor(error.code),
      };
    }
    console.error("submitVote failed", error);
    return { ok: false, code: "UNKNOWN", message: GENERIC_ERROR };
  }
}
