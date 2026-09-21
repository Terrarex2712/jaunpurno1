# Jaunpur No.1

A community cricket tournament platform for Jaunpur district, Uttar Pradesh.

Jaunpur's nine Vidhan Sabha regions each field several local cricket teams. The
public votes for the team they want to represent their area, and the team with
the most valid votes in each region becomes that region's selected team for the
tournament.

> **Jaunpur No.1 is a community cricket tournament platform. It is not
> affiliated with government electoral voting.** Every team, captain, locality
> and vote in this prototype is demo data.

---

## Stack

| Layer      | Choice                                                      |
| ---------- | ----------------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Server Components, Server Actions)   |
| Language   | TypeScript, `strict` mode                                    |
| Styling    | Tailwind CSS v4 with design tokens in `app/globals.css`      |
| UI         | Radix Dialog primitive, `class-variance-authority`, Lucide   |
| Fonts      | Archivo (variable width, display) + Inter (body), via `next/font` |
| Data       | In-memory repositories behind interfaces (no external DB)    |
| Tests      | Vitest                                                       |
| Runtime    | Node (`export const runtime = "nodejs"` on every data route) |

---

## Setup

```bash
npm install
cp .env.example .env.local   # then set ADMIN_PASSWORD
npm run dev
```

The app runs at <http://localhost:3000>.

| Script              | Does                                        |
| ------------------- | ------------------------------------------- |
| `npm run dev`       | Dev server                                  |
| `npm run build`     | Production build (also typechecks)          |
| `npm start`         | Serve the production build                  |
| `npm test`          | Vitest suite                                |
| `npm run typecheck` | `tsc --noEmit`                              |
| `npm run lint`      | ESLint                                      |

---

## Admin configuration

The organiser console lives at `/admin` and is protected by a single shared
password read from the environment:

```bash
# .env.local
ADMIN_PASSWORD=change-me

# optional — signs the session cookie.
# If unset, the key is derived from ADMIN_PASSWORD, so changing the password
# logs every admin out.
ADMIN_SESSION_SECRET=
```

Log in at `/admin/login`. A correct password exchanges for an HMAC-signed,
HTTP-only, `SameSite=Lax` cookie that expires after 8 hours. `.env*` files are
gitignored (`.env.example` is the only one committed) — never commit a real
password.

From the console an organiser can:

- see totals per Vidhan Sabha and who is leading;
- add, edit, activate and deactivate teams;
- delete a team **only when it has no votes** (see below);
- open and close voting for the whole tournament;
- review aggregated vote totals and the most recent votes, with phone numbers
  masked as `98******10`.

---

## Routes

### Public

| Route                     | What it is                                              |
| ------------------------- | ------------------------------------------------------- |
| `/`                       | Landing page: hero, stats, nine regions, how it works, live leaders, sponsor |
| `/vidhan-sabha`           | All nine Vidhan Sabha regions                           |
| `/vidhan-sabha/[slug]`    | One region's teams, voting, and standings               |
| `/results`                | Live standings for all nine regions                     |
| `/how-it-works`           | Voting steps and rules                                  |

Slugs: `badlapur`, `shahganj`, `jaunpur`, `malhani`, `mungra-badshahpur`,
`machhli-shahar`, `mariyahu`, `zafarabad`, `kerakat`.

### Admin

`/admin`, `/admin/login`, `/admin/teams`, `/admin/teams/new`,
`/admin/teams/[id]/edit`, `/admin/votes`.

### HTTP API

| Method | Path                                  | Notes                                     |
| ------ | ------------------------------------- | ----------------------------------------- |
| `GET`  | `/api/constituencies`                 | The nine fixed regions                    |
| `GET`  | `/api/teams`                          | Active teams; `?constituency=<slug>` filters |
| `GET`  | `/api/results`                        | Aggregated standings only                 |
| `POST` | `/api/votes`                          | Cast one vote                             |

`POST /api/votes` accepts `{ voterName, phone, teamId }`. Any `constituencyId`
in the body is ignored. Responses: `201` created, `400` invalid name or phone,
`404` unknown team, `409` duplicate vote / inactive team / voting closed.

Admin mutations are **Server Actions** (`app/admin/actions.ts`) rather than REST
endpoints; each one calls `requireAdmin()` before touching data.

---

## The one-vote rule

**One mobile number gets one vote across the entire tournament** — not one per
region, not one per team.

Enforcement lives in `lib/services/voting.ts` and `lib/repositories`:

1. The voter's name is trimmed and validated.
2. The phone number is normalised to 10 digits. `9876543210`,
   `+91 9876543210`, `+919876543210`, `98765 43210` and `098765-43210` all
   collapse to `9876543210`, so they are one voter.
3. Voting must be open.
4. The team must exist and be active.
5. **The constituency is read from the team record**, never from the request
   body — a client cannot steer a vote into a different region.
6. The repository re-checks the phone index and inserts in a single synchronous
   step, so two concurrent requests for the same number cannot both succeed.
   `DuplicateVoteError` is raised otherwise.

Client-side validation exists only for fast feedback. Every rule above runs on
the server for every request.

### Privacy

- Public pages and public API responses never contain voter names or numbers.
- A duplicate attempt returns a deliberately generic message — *"Is mobile
  number se vote pehle hi submit ho chuka hai."* It never reveals which team or
  region the earlier vote went to, so the form cannot be used as a lookup.
- Admin views mask numbers (`98******10`).

### Vote integrity

Vote counts are always **derived from vote records** (`votes.countsByTeam()`),
never stored as a counter that could drift.

A team that has received votes cannot be hard-deleted; the admin must deactivate
it instead. Deactivated teams stop accepting votes but keep the votes they
already hold, and those votes keep counting toward regional totals. If a team is
moved to a different Vidhan Sabha, its existing votes move with it so
`vote.constituencyId` always matches its team.

While voting is open the front-runner is labelled **"Currently leading"** — never
"selected". Only once voting closes does the highest total become the
**"Selected team"**. If two or more teams tie at the top when voting closes, the
result is **"Tie — selection pending"**; the app never picks a winner silently.

---

## Prototype limitations

Read this before showing the app to anyone as if it were live.

1. **Data is stored in memory.** There is no database. Records live in a plain
   object held on `globalThis` (`lib/db.ts`).
2. **Data resets when the Node server restarts.** Hot reloads in `next dev`
   preserve it, but stopping the server loses every vote and every team change,
   and the app re-seeds from `lib/data/seed-teams.ts` on next boot.
3. **Phone numbers are not verified.** There is no OTP. Nothing in the UI claims
   a number has been verified, because nothing verifies it. Anyone can enter any
   valid-looking number.
4. **Uniqueness is enforced in application code, not by the database.** A real
   deployment must add a `UNIQUE` constraint on the normalised phone column so
   the guarantee survives multiple server processes.
5. **There is no abuse prevention.** A production voting system needs OTP
   verification, per-IP and per-number rate limiting, and a bot check
   (CAPTCHA / Turnstile). None of that is built here.
6. **Admin auth is a shared password.** Fine for a prototype, not for
   production — replace it with per-user accounts, hashed credentials, a
   server-side session store and login rate limiting.
7. **All seed data is fictional.** The 36 teams, their captains and localities
   are invented. Demo votes use a reserved `70…` phone-number block so they can
   never collide with a real tester's number.
8. **Sponsor branding is placeholder.** See below.

### Sponsor branding

The tournament is presented as sponsored by **Suresh Raina**, using plain text
only. This prototype deliberately contains **no** celebrity logo, signature,
photograph, quote or endorsement statement, because no licensed assets were
supplied. `components/sponsor-badge.tsx` has an empty media slot sized for real
artwork.

**Before publishing:** use authorised branding assets and have the sponsorship
wording approved by whoever holds the rights. Do not ship attributed statements
that were not actually given.

---

## Project structure

```
app/
  layout.tsx             root layout, fonts, metadata
  page.tsx               landing page
  icon.tsx               favicon generated from the brand mark
  opengraph-image.tsx    social card generated from the design tokens
  error.tsx              route error boundary
  not-found.tsx          404
  actions/vote.ts        public vote server action
  vidhan-sabha/          region index + [slug] detail (+ loading skeletons)
  results/               live standings (+ loading skeleton)
  how-it-works/          voting steps and rules
  admin/                 console, login, teams CRUD, votes overview
    actions.ts           admin server actions (all guarded)
    _lib/guard.ts        page-level auth guard
  api/                   route handlers

components/              UI, grouped by feature; admin/ holds console-only parts
lib/
  domain/types.ts        Team, Vote, Constituency, standings, settings
  domain/errors.ts       typed domain errors with HTTP statuses
  repositories/types.ts  repository INTERFACES — the seam to a real database
  repositories/in-memory.ts  the only place that knows how records are stored
  services/voting.ts     castVote — the single authoritative vote path
  services/results.ts    standings, ranking, selection state
  services/teams.ts      admin team operations and the delete-guard rule
  services/phone.ts      normalisation, validation, masking
  services/phone-verification.ts  OTP extension point (not implemented)
  auth/admin.ts          prototype admin session
  data/                  the nine constituencies + fictional team seed
  db.ts                  bootstrap, seeding, globalThis singleton
tests/                   Vitest suite for the business rules
```

Pages and components never import the in-memory classes. They call
`getRepositories()` and the services, so the storage layer can be swapped out
underneath them.

---

## Swapping in a real database

The repository interfaces in `lib/repositories/types.ts` are the seam. To move
to PostgreSQL with Prisma:

1. **Model the schema.** `Constituency`, `Team`, `Vote`, `TournamentSettings`.
   Give `Vote.normalizedPhone` a **`UNIQUE` constraint** — that is what makes
   the one-vote rule hold across multiple server processes:

   ```prisma
   model Vote {
     id              String   @id @default(cuid())
     voterName       String
     normalizedPhone String   @unique   // the one-vote-per-number guarantee
     teamId          String
     constituencyId  String
     createdAt       DateTime @default(now())
     team            Team     @relation(fields: [teamId], references: [id])
     @@index([teamId])
     @@index([constituencyId])
   }
   ```

2. **Write `PrismaTeamRepository`, `PrismaVoteRepository`,
   `PrismaConstituencyRepository` and `PrismaSettingsRepository`** against the
   existing interfaces. In `createUnique`, catch the unique-constraint violation
   (Prisma error `P2002`) and rethrow it as `DuplicateVoteError` so callers see
   the same typed error they see today.

3. **Point `getRepositories()` at the new implementations** in `lib/db.ts`. That
   is the only file that changes — no page, component, service or test needs
   editing, because nothing above the repository layer knows the difference.

4. **Move the seed** in `lib/data/` into a Prisma seed script, and delete the
   demo-vote generation.

5. **Drop `force-dynamic`** where a cached read is acceptable once reads are no
   longer backed by a process-local object.

Every repository method is already `async`, so no call site needs to change.

### Other extension points left open

`lib/services/phone-verification.ts` defines the `PhoneVerificationService`
interface for OTP. Implement it against an SMS provider, add a challenge step to
the vote dialog, and require a verification token in `castVote`. Rate limiting,
CAPTCHA, fixtures, rosters, schedules, live scoring, notifications, admin roles,
image uploads and analytics are deliberately **not** built — the architecture
leaves room for them rather than stubbing them out.

---

## Language

The interface mixes English with Roman-script Hindi (`Apni team ko vote
karein`). **Devanagari is not used anywhere** — not in copy, buttons, alerts,
metadata or seed data.
