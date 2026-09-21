import { DISTRICT, STATE, type Constituency } from "@/lib/domain/types";

/**
 * The nine Vidhan Sabha constituencies of Jaunpur district.
 *
 * This is fixed reference data, not admin-editable content. Ids are stable
 * strings so they survive a future migration to a real database as-is.
 */
export const CONSTITUENCIES: readonly Constituency[] = [
  { id: "badlapur", name: "Badlapur", slug: "badlapur" },
  { id: "shahganj", name: "Shahganj", slug: "shahganj" },
  { id: "jaunpur", name: "Jaunpur", slug: "jaunpur" },
  { id: "malhani", name: "Malhani", slug: "malhani" },
  { id: "mungra-badshahpur", name: "Mungra Badshahpur", slug: "mungra-badshahpur" },
  { id: "machhli-shahar", name: "Machhli Shahar", slug: "machhli-shahar" },
  { id: "mariyahu", name: "Mariyahu", slug: "mariyahu" },
  { id: "zafarabad", name: "Zafarabad", slug: "zafarabad" },
  { id: "kerakat", name: "Kerakat", slug: "kerakat" },
].map((c) => ({ ...c, district: DISTRICT, state: STATE }));

export const CONSTITUENCY_IDS = CONSTITUENCIES.map((c) => c.id);
