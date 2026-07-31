# Barbering Booking Platform

A full-stack barbering booking platform serving 300+ clients, built with Next.js, React, Node.js, Express, and TypeScript. The public site takes appointment requests through a server-side booking route, which sends the client a confirmation and the owner a notification that an n8n automation layer turns into a structured row in Google Sheets. A password-protected **appointments dashboard** reads that data back live via the Google Sheets API, and the same booking capabilities are exposed to MCP clients as tools.

## Public site

The customer-facing site is a statically generated Next.js app in `web/`, deployed on **Vercel**:

- **Live site:** [henryhaistudio.vercel.app](https://henryhaistudio.vercel.app)

The earlier hand-rolled static version is still up on GitHub Pages from a separate repo. It is the one currently serving clients, and it is unrelated to this codebase:

- **Previous site:** [henry-hai.github.io/barber_website/](https://henry-hai.github.io/barber_website/) ([source](https://github.com/henry-hai/barber_website))

![Landing page with hero image and navigation](screenshots/01-hero.jpg)
![Services and pricing list](screenshots/02-services.jpg)
![Gallery carousel of haircut work](screenshots/03-gallery.jpg)
![Locations section with Irvine and Milpitas shops](screenshots/04-locations.jpg)
![Booking policies and appointment request form](screenshots/05-booking-form.jpg)
![Rest of the booking form with submit and footer](screenshots/06-booking-form-footer.jpg)

## Appointments Dashboard

A React dashboard reads booking requests **live** from the Google Sheet that the n8n workflow appends to, using the Google Sheets API authenticated with a read-only GCP service account. It shows headline stats and a card per request (client name, submitted time, preferred slots, and notes). The booking data stays in Google Sheets as the single source of truth, viewable on a phone, while the dashboard surfaces it inside the app. *(Client phone numbers and last names redacted below.)*

It shows client names and phone numbers, so it sits behind HTTP basic auth and is deployed privately. See [Deployment](#deployment) for where the password is set.

![Appointments dashboard](screenshots/dashboard.png)

## Architecture

```
Browser  -->  Next.js site (web/) on Vercel
              Marketing pages, gallery, booking form
                    |
                    v
              POST /booking  -->  Express API (server/) on Render  -->  Gmail SMTP
                                                                          |
                                        +-- confirmation email to the client
                                        |
                                        +-- notification email to the owner
                                                  |
                                                  v
                                      n8n: Gmail trigger -> JSON parse -> Google Sheets
                                                                                |
Browser  -->  Dashboard (client/)  -->  GET /appointments  ---------------------+
              basic auth, same origin       read-only service account
                                                  ^
MCP client  -->  stdio  -->  MCP server  ---------+
                             check_availability, request_booking
```

**web/** -- The barbering website. Next.js App Router with TypeScript and Tailwind, statically generated with Open Graph metadata and LocalBusiness JSON-LD. The gallery is a tabbed React component using `next/image`; the booking form POSTs to the Express API, whose origin is fixed at build time by `NEXT_PUBLIC_API_BASE_URL`.

**server/** -- RESTful API built with Node.js and Express. Handles the public booking endpoint, reads booking data from Google Sheets via a read-only service account, serves the built dashboard, and hosts the MCP server. It splits into a public zone (`POST /booking` and `/healthz`) and a private one behind basic auth (everything else).

**client/** -- React SPA with Material-UI components and CSS Grid layout, showing the **appointments dashboard**: booking requests and stats from the Google Sheets API. Talks to the server via Axios on the same origin.

The repo also carries a Gmail mail client -- mailboxes, messages and NeDB-backed contact CRUD, across `client/src/code/components/` and the server's `IMAP.ts`, `SMTP.ts` and `contacts.ts`. It is **not wired into the running app**. `AppShell.tsx` no longer imports it, so webpack leaves it out of the bundle entirely; the code is kept because it is worth preserving, not because it runs. Its Express endpoints are still mounted, behind the same basic auth.

**automation/** -- The exported n8n workflow. See [The booking pipeline](#the-booking-pipeline) below.

## The booking pipeline

A booking travels through four hops, and the contract between them is deliberately narrow.

1. The form in `web/components/BookingForm.tsx` POSTs JSON to `POST /booking`.
2. `server/src/Booking.ts` revalidates every field, then sends two emails.
3. The **owner notification**'s plain-text part carries an 11-field JSON object between two fixed sentinels:

   ```
   ---BOOKING_JSON_START---
   { "name": ..., "date": ..., "time": ..., ... }
   ---BOOKING_JSON_END---
   ```

4. The n8n workflow's Code node extracts that block and runs a single `JSON.parse` on it, then appends the result as a row.

The eleven JSON keys map one-to-one, in order, onto sheet columns **A..K**, and empty fields are the string `"N/A"`. `server/src/Appointments.ts` reads that exact layout back for the dashboard.

Two consequences worth knowing:

- **The HTML part of the notification is presentational only.** Nothing parses it, so it can be redesigned freely without touching the workflow or the sheet.
- **The key order and the `"N/A"` convention are load-bearing.** Changing either means changing the sheet and `Appointments.ts` together. `server/tests/n8n-contract.test.ts` runs the workflow's own `jsCode` against real notification bodies to catch drift.

The Gmail trigger filters on the subject prefix `Appointment Request from`, so that must stay too.

## MCP server

The booking system is also exposed over the [Model Context Protocol](https://modelcontextprotocol.io), so an MCP client can read the booking sheet and make a booking as a tool call.

**This is a local run mode.** It speaks MCP over stdio and is launched as a child process by whatever client connects to it. It is not deployed, not hosted, and listens on no port.

| Tool | What it does |
|---|---|
| `check_availability` | Lists the dates clients have already requested, with a count and the availability notes for each. Optional `from` and `to` bounds, `YYYY-MM-DD`. Reads the same Google Sheet the dashboard reads. |
| `request_booking` | Submits an appointment request. Takes the same fields as the website form, including `policiesAccepted`. |

A booking made through `request_booking` **travels the identical path as one made on the website**. It runs the same `validateBooking`, the same honeypot check and the same rate limiter, then the same `Booking.Worker`, which sends the same two emails. The owner notification carries the same sentinel-wrapped A..K JSON, so n8n appends the row without knowing or caring where the request came from. `server/src/mcp/BookingTools.ts` calls that existing code rather than restating any of it.

Read `check_availability` for what it is: the sheet holds *requests*, not a confirmed calendar. A date listed there has been asked for, which is not the same as being taken, and a date missing from it is not a guarantee that it is free.

Running costs effectively nothing and it is safe to leave running. It touches only the Google Sheets API on a read-only service account and the Gmail account the site already sends through. No model is called and no paid API is involved.

### Connecting a client

Build first, then point a client at the compiled entry point:

```bash
cd server
npm install
npm run build
npm run mcp        # or: node dist/mcp/main.js
```

For Claude Code, `claude mcp add booking -- node C:/dev/barber-booking/server/dist/mcp/main.js`. For any client that takes JSON config:

```json
{
  "mcpServers": {
    "booking": {
      "command": "node",
      "args": ["/absolute/path/to/barber-booking/server/dist/mcp/main.js"]
    }
  }
}
```

Credentials come from `server/serverInfo.json` and `server/serviceAccount.json`, or from the same environment variables the deployed server uses. `check_availability` needs the sheets block and the service account; `request_booking` needs the SMTP block.

## Tech Stack

| Technology | Usage |
|---|---|
| Next.js | Public marketing and booking site (`web/`), App Router, static generation |
| React | Site components (`web/`), full SPA (`client/`) |
| Node.js | Express API runtime (`server/`) |
| Express | RESTful API framework, booking endpoint |
| TypeScript | Site, server API, and React client |
| Tailwind CSS | Responsive utility-first styling |
| Material-UI | React component library (`client/`) |
| NodeMailer | Gmail SMTP: booking emails and the mail client |
| imapflow | Inbound email over Gmail IMAP |
| NeDB | Embedded document database for contacts |
| Axios | HTTP client for API communication |
| n8n | Automation workflow: Gmail trigger → JSON parse → Google Sheets |
| Google Sheets API | Reads booking data into the dashboard via a read-only GCP service account |
| Vitest + Testing Library | Component, validation, auth and MCP tool tests |
| Playwright | End-to-end booking path |
| MCP TypeScript SDK | Booking exposed as tools over stdio (`@modelcontextprotocol/sdk`, pinned) |
| Zod | Tool input schemas for the MCP server |
| Vercel | Hosts the public Next.js site |
| Render | Hosts the Express API and the private dashboard |

## Getting Started

### Public site

```bash
cd web
npm install
npm run dev
```

Visit `http://localhost:3000`. Copy `.env.example` to `.env.local` to point the booking form at a running API; `NEXT_PUBLIC_API_BASE_URL` defaults to `http://localhost:8080`:

```bash
cp .env.example .env.local
```

Gallery photos live in `web/public/img/`. The Artwork tab expects four files in `web/public/img/artwork/` -- see the README there.

### Backend API Server

```bash
cd server
npm install
cp serverInfo.example.json serverInfo.json
```

Edit `serverInfo.json` with your Gmail address and [App Password](https://support.google.com/accounts/answer/185833), then:

```bash
npm run build
DASHBOARD_USER=you DASHBOARD_PASSWORD=pick-something npm start
```

The API starts on `http://localhost:8080`. Those two variables are what unlock the dashboard and the other private routes; without them the public `POST /booking` and `/healthz` still work and everything else answers 503.

### Appointments dashboard

```bash
cd client
npm install
npm run build
```

Open `http://localhost:8080` and enter the credentials above. The backend serves the built bundle, so the dashboard shares its origin and needs no separate host.

### MCP server

See [MCP server](#mcp-server) above. It is a local stdio process, launched by whichever client connects to it.

## Tests

```bash
npm test           # web + server unit tests
npm run test:e2e   # Playwright booking path
```

Everything runs with no secrets. The end-to-end suite mounts the real booking handler with a recording mailer in place of NodeMailer, and the MCP tests stub the Sheets client alongside it, so no test reaches Gmail, Sheets or n8n. CI runs all three suites on every push and pull request.

## Deployment

Two hosts, because the pieces have different shapes. The site is static and belongs on a CDN; the API holds a long-lived IMAP connection and needs a process that stays up, which rules out a serverless function.

**No credential is committed.** `serverInfo.json` and `serviceAccount.json` are gitignored, and every value below is set in the host's own dashboard.

### Public site, Vercel

Project `henryhaistudio`, **Root Directory `web`**. Set under *Project Settings -> Environment Variables*:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Origin of the Render service, no trailing slash |
| `NEXT_PUBLIC_SITE_URL` | `https://henryhaistudio.vercel.app` |

Both are inlined into the bundle at build time, so **changing either one needs a redeploy** to take effect. `NEXT_PUBLIC_SITE_URL` is not cosmetic: `og:url`, `sitemap.xml` and `robots.txt` all derive from it, and its default is a domain that does not serve this site.

### API and dashboard, Render

`render.yaml` at the repo root describes the service: it builds `server/` and `client/`, starts `server/dist/boot.js`, and health-checks `/healthz`. The free tier **spins down after about 15 minutes idle, and the next request pays roughly 40 seconds of cold start**, which is fine for a dashboard one person opens a few times a day.

Set under *Dashboard -> the service -> Environment*:

| Variable | Value |
|---|---|
| `SERVER_INFO_JSON` | Entire contents of `server/serverInfo.json`, as one line |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Entire contents of `serviceAccount.json`, as one line |
| `DASHBOARD_USER` | Whatever username you want for the dashboard |
| `DASHBOARD_PASSWORD` | **The dashboard password. This is where you set it.** |

`Credentials.ts` writes the first two to the paths the server expects at startup, so `Appointments.ts` goes on handing a key file to `GoogleAuth` unchanged. A real file on disk always wins, so this is inert locally.

With `DASHBOARD_USER` or `DASHBOARD_PASSWORD` unset, every private route answers **503** rather than serving the dashboard openly. That is deliberate: a misconfigured deploy exposes nothing.

## API Endpoints

Public, deliberately unauthenticated:

| Method | Endpoint | Description |
|---|---|---|
| POST | `/booking` | Submit an appointment request; sends the client confirmation and owner notification |
| GET | `/healthz` | Liveness, for the host's health check |

`POST /booking` is called cross-origin by a browser that has no credentials to offer, so it cannot sit behind the auth guard. Its honeypot field and per-IP rate limit are what protect it.

Private, behind HTTP basic auth:

| Method | Endpoint | Description |
|---|---|---|
| GET | `/appointments` | List booking requests from the Google Sheet (newest first) |
| GET | `/mailboxes` | List all mailboxes |
| GET | `/mailboxes/:mailbox` | List messages in a mailbox |
| GET | `/messages/:mailbox/:id` | Get a specific message |
| DELETE | `/messages/:mailbox/:id` | Delete a message |
| POST | `/messages` | Send a new email |
| GET | `/contacts` | List all contacts |
| POST | `/contacts` | Add a contact |
| DELETE | `/contacts/:id` | Delete a contact |

Everything from `/mailboxes` down belongs to the retired mail client. The routes still work; nothing in the running app calls them.

## Project Structure

```
barber-booking/
├── package.json            # Monorepo scripts delegating to web/, server/, client/
├── render.yaml             # Render blueprint: API + dashboard, one free service
├── .github/workflows/ci.yml
├── screenshots/            # README images (static site + dashboard)
├── automation/
│   └── Barber_Log.json     # Exported n8n workflow (Gmail -> JSON parse -> Sheets)
├── web/                    # Next.js public site
│   ├── app/
│   │   ├── layout.tsx      # Root layout, metadata and Open Graph tags
│   │   ├── page.tsx        # The barbering site
│   │   ├── globals.css     # Tailwind entry point
│   │   ├── robots.ts
│   │   └── sitemap.ts
│   ├── components/
│   │   ├── Hero.tsx           # Triptych hero and the mobile single frame
│   │   ├── Logo.tsx           # Wordmark, rebuilt as SVG
│   │   ├── SectionIndex.tsx   # In-page navigation
│   │   ├── MobileMenu.tsx
│   │   ├── ServicesMenu.tsx   # Services and pricing
│   │   ├── GalleryTabs.tsx    # Tabbed gallery (Haircuts, Artwork) + lightbox
│   │   ├── Locations.tsx
│   │   ├── Reveal.tsx         # Scroll-reveal wrapper
│   │   └── BookingForm.tsx
│   ├── lib/
│   │   ├── site.ts         # Shop details, services, locations, policies
│   │   ├── gallery.ts      # Gallery tabs and photo lists
│   │   ├── booking.ts      # Booking form shape and client-side validation
│   │   ├── fonts.ts        # next/font faces
│   │   └── api.ts          # API base URL
│   ├── public/img/         # Barbering portfolio photos
│   ├── tests/
│   │   ├── unit/           # Vitest + React Testing Library
│   │   └── e2e/            # Playwright
│   ├── .env.example        # NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_SITE_URL
│   ├── tailwind.config.ts
│   ├── next.config.mjs
│   ├── playwright.config.ts
│   ├── vitest.config.ts
│   └── vercel.json
├── server/                 # Express REST API backend
│   ├── src/
│   │   ├── boot.ts         # Entry point: credentials, then main
│   │   ├── main.ts         # Express app and route definitions
│   │   ├── Auth.ts         # Basic-auth guard for the private zone
│   │   ├── Credentials.ts  # Writes credential files from the environment
│   │   ├── Booking.ts      # Booking validation, A..K payload, both emails
│   │   ├── BookingEmails.ts# HTML and plain-text email templates
│   │   ├── RateLimit.ts    # In-memory rate limiter
│   │   ├── Appointments.ts # Google Sheets reader (service account)
│   │   ├── SMTP.ts         # NodeMailer email sending
│   │   ├── IMAP.ts         # IMAP email reading (mail client, unwired)
│   │   ├── contacts.ts     # NeDB contact CRUD (mail client, unwired)
│   │   ├── ServerInfo.ts   # Config loader
│   │   └── mcp/
│   │       ├── main.ts         # MCP entry point (stdio)
│   │       ├── server.ts       # Tool registration and schemas
│   │       └── BookingTools.ts # Tool behaviour, no SDK, calls existing code
│   ├── tests/
│   │   ├── booking.test.ts
│   │   ├── emails.test.ts
│   │   ├── n8n-contract.test.ts
│   │   ├── ratelimit.test.ts
│   │   ├── auth.test.ts
│   │   ├── mcp.test.ts
│   │   └── e2e-harness.mjs # Real booking handler + recording mailer
│   ├── package.json
│   ├── tsconfig.json
│   └── serverInfo.example.json
└── client/                 # React appointments dashboard
    ├── src/
    │   ├── index.html
    │   ├── css/main.css
    │   └── code/
    │       ├── main.tsx         # React entry point
    │       ├── state.ts         # Centralized state management
    │       ├── config.ts        # API origin (empty: same origin)
    │       ├── theme.ts         # Material-UI theme
    │       ├── Appointments.ts  # Booking request API calls
    │       ├── IMAP.ts          # Mailbox API calls (unwired)
    │       ├── SMTP.ts          # Send email API calls (unwired)
    │       ├── Contacts.ts      # Contact API calls (unwired)
    │       └── components/
    │           ├── AppShell.tsx     # App bar over the dashboard
    │           ├── Dashboard.tsx    # The appointments view
    │           └── ...              # BaseLayout and the mail client, unwired
    ├── package.json
    ├── tsconfig.json
    └── webpack.config.js
```
