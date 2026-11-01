// Renders every image in assets/ in the girishthedecent.space style.
// Static: banner, codebook, experience, work cards, stack. Live: leetcode.svg, github.svg.
// Run: node scripts/build.mjs   (GITHUB_TOKEN is needed for the GitHub card)
import fs from "node:fs/promises";
import satori from "satori";
import * as si from "simple-icons";

const root = new URL("..", import.meta.url);
const read = (p) => fs.readFile(new URL(p, root));
const write = (p, s) => fs.writeFile(new URL(p, root), s);
const dataUri = async (p, mime) => `data:${mime};base64,${(await read(p)).toString("base64")}`;

const USER = "girishthedecent";
const C = {
  bg: "#000", p: "#0b0b0b", p2: "#111", p3: "#161616", line: "#1f1f1f", line2: "#2b2b2b",
  ink: "#f2f2f0", mu: "#a3a3a0", dim: "#66665f", body: "#d4d4d0", ac: "#e8432c", ok: "#22c55e",
};

const fonts = [
  ["Serif", "InstrumentSerif-Regular.ttf", 400, "normal"],
  ["Serif", "InstrumentSerif-Italic.ttf", 400, "italic"],
  ["Sans", "Geist-Regular.ttf", 400],
  ["Sans", "Geist-Medium.ttf", 500],
  ["Sans", "Geist-SemiBold.ttf", 600],
  ["Mono", "GeistMono-Regular.ttf", 400],
  ["Mono", "GeistMono-Medium.ttf", 500],
];
const fontData = await Promise.all(
  fonts.map(async ([name, file, weight, style = "normal"]) => ({ name, data: await read(`fonts/${file}`), weight, style })),
);

// ---------- tiny element helpers ----------
const h = (type, props, ...kids) => {
  const children = kids.flat(Infinity).filter((k) => k !== null && k !== undefined && k !== false);
  return { type, props: { ...props, children: children.length === 1 ? children[0] : children } };
};
const div = (style, ...kids) => h("div", { style: { display: "flex", ...style } }, ...kids);
const img = (src, w, ht, style = {}) => h("img", { src, width: w, height: ht, style });
const mono = (size, color, text, style = {}) => div({ fontFamily: "Mono", fontSize: size, color, letterSpacing: 0.2, ...style }, text);
const serif = (size, color, text, style = {}) => div({ fontFamily: "Serif", fontSize: size, color, lineHeight: 1, ...style }, text);
const sans = (size, color, text, style = {}) => div({ fontFamily: "Sans", fontSize: size, color, ...style }, text);

const render = (node, width, height) => satori(node, { width, height, fonts: fontData });
// Outer box fills the canvas; the inner one takes padding (satori adds padding outside a 100% width).
const frame = (style, ...kids) =>
  div({ width: "100%", height: "100%" }, div({ flex: 1, background: C.p, border: `1px solid ${C.line}`, borderRadius: 18, fontFamily: "Sans", color: C.ink, overflow: "hidden", ...style }, ...kids));

const chip = (text, color = C.mu) =>
  div({ padding: "5px 11px", border: `1px solid ${C.line2}`, borderRadius: 999, fontFamily: "Mono", fontSize: 13, color, background: C.p2 }, text);

const iconSvg = (path, fill) =>
  `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${fill}" d="${path}"/></svg>`).toString("base64")}`;
/** Dark brand colours (Express, Next.js...) are lifted to white so they read on black. */
const brand = (hex) => {
  if (!hex) return C.ink;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.18 ? C.ink : `#${hex}`;
};
const dot = (color, size = 8) => div({ width: size, height: size, borderRadius: 999, background: color });

// ---------- content (mirrors portfolio/site/src/content/site.ts) ----------
const now = [
  ["working", "SWE Intern @ AppWeave"],
  ["building", "CodeBook, agentic RAG"],
  ["studying", "B.Tech CSE, IIIT Nuzvid"],
  ["based", "India"],
];
const impact = [
  { product: "Collected", accent: "#22c55e", tag: "feature · end to end", big: "4 × 7", unit: "badge tiers × categories", text: "Built the gamified achievements system with progress tracking and automated awards." },
  { product: "Certifico", accent: "#38bdf8", tag: "architecture", big: "−80%", unit: "route-layer code", text: "Re-architected the monolithic backend into a modular service layer, with 128% more tests." },
  { product: "Marketplace", accent: "#2dd4bf", tag: "testing", big: "Playwright", unit: "E2E suite migrated", text: "Moved the legacy end-to-end suite to Playwright, covering critical user workflows." },
  { product: "Watch scrapers", accent: "#a78bfa", tag: "data", big: "33%", unit: "failing sites restored", text: "Fixed scraping across four platforms, improving listing availability and status accuracy." },
];
const work = [
  { slug: "hotelbooking", name: "HotelBooking", accent: "#ef4444", tagline: "Distributed reservation system", year: 2026, short: "Four microservices for auth, hotels, reservations and notifications. Redis distributed locks and idempotency keys around bookings, BullMQ for async notifications.", stack: ["TypeScript", "Node.js", "MySQL", "Redis", "BullMQ"] },
  { slug: "algo-backend", name: "Algo Backend", accent: "#a78bfa", tagline: "Distributed online judge", year: 2026, short: "Problems, submissions and evaluation as three services over Redis and BullMQ. Runs untrusted C++ and Python in isolated, resource-limited Docker sandboxes.", stack: ["TypeScript", "MongoDB", "Redis", "Docker", "BullMQ"] },
  { slug: "meetly", name: "Meetly", accent: "#f59e0b", tagline: "Real-time video meetings", year: 2025, short: "Multi-user video calls in the browser with WebRTC and Socket.IO signaling, live chat, screen sharing and per-user meeting history.", stack: ["React", "WebRTC", "Socket.IO", "Node.js", "MongoDB"], live: "meetly.girishthedecent.space" },
  { slug: "play-for-impact", name: "Play for Impact", accent: "#22c55e", tagline: "Subscription & prize-draw platform", year: 2026, short: "Golf subscriptions with monthly charity prize draws. Rolling score windows in PostgreSQL transactions, atomic draw results and jackpot rollover.", stack: ["TypeScript", "React", "Express", "PostgreSQL", "Stripe"], live: "play-for-impact.vercel.app" },
];
const stack = [
  { group: "Languages", color: "#3b82f6", items: [["TypeScript", "siTypescript"], ["JavaScript", "siJavascript"], ["C++", "siCplusplus"], ["Java", "siOpenjdk"], ["Python", "siPython"]] },
  { group: "Backend", color: "#22c55e", items: [["Node.js", "siNodedotjs"], ["Express", "siExpress"], ["FastAPI", "siFastapi"], ["Socket.IO", "siSocketdotio"], ["BullMQ"], ["Inngest"]] },
  { group: "AI", color: "#a78bfa", items: [["RAG"], ["Agents"], ["pgvector", "siPostgresql"], ["Tree-sitter"]] },
  { group: "Frontend", color: "#38bdf8", items: [["React", "siReact"], ["Next.js", "siNextdotjs"], ["Vite", "siVite"], ["Tailwind", "siTailwindcss"]] },
  { group: "Data", color: "#f97316", items: [["PostgreSQL", "siPostgresql"], ["MySQL", "siMysql"], ["MongoDB", "siMongodb"], ["Redis", "siRedis"], ["Prisma", "siPrisma"]] },
  { group: "Ops & Testing", color: "#2dd4bf", items: [["Docker", "siDocker"], ["AWS"], ["Linux", "siLinux"], ["GitHub Actions", "siGithubactions"], ["Playwright"], ["Vitest", "siVitest"]] },
];

// ---------- static images ----------
const avatar = await dataUri("assets/avatar.png", "image/png");

async function banner() {
  const W = 1280, H = 440;
  const node = frame(
    { background: C.bg, backgroundImage: `radial-gradient(circle, #232323 1.1px, transparent 1.3px)`, backgroundSize: "26px 26px", padding: "40px 52px", flexDirection: "column", justifyContent: "space-between" },
    div({ justifyContent: "space-between", alignItems: "center" },
      div({ alignItems: "center", gap: 12 },
        img(avatar, 38, 38, { borderRadius: 999, border: `1px solid ${C.line2}` }),
        div({ fontFamily: "Sans", fontSize: 19, fontWeight: 500 }, "girish", div({ color: C.dim }, "the"), "decent"),
      ),
      div({ alignItems: "center", gap: 10, padding: "8px 16px", borderRadius: 999, border: `1px solid ${C.line2}`, background: C.p },
        dot(C.ok), mono(14, C.body, "open to internships"),
      ),
    ),
    div({ justifyContent: "space-between", alignItems: "flex-end" },
      div({ flexDirection: "column" },
        mono(20, C.mu, "hi, I'm", { marginBottom: 6 }),
        div({ alignItems: "baseline" },
          serif(124, C.ink, "Girish", { marginRight: 26, letterSpacing: -2 }),
          serif(124, C.mu, "Pasupuleti", { fontStyle: "italic", letterSpacing: -2 }),
        ),
        div({ alignItems: "center", gap: 12, marginTop: 18 },
          sans(26, C.ink, "Backend & Full Stack Engineer", { fontWeight: 500 }),
          div({ width: 5, height: 5, borderRadius: 9, background: C.ac }),
          sans(26, C.mu, "AI Engineering"),
        ),
      ),
      div({ flexDirection: "column", width: 392, border: `1px solid ${C.line2}`, borderRadius: 12, background: C.p, overflow: "hidden" },
        div({ justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderBottom: `1px solid ${C.line}` },
          mono(13, C.mu, "now.json"),
          div({ gap: 6 }, dot(C.line2, 9), dot(C.line2, 9), dot(C.line2, 9)),
        ),
        div({ flexDirection: "column", padding: "14px 16px", gap: 7, fontFamily: "Mono", fontSize: 13.5, whiteSpace: "nowrap" },
          div({ color: C.dim }, "{"),
          ...now.map(([k, v], i) =>
            div({ paddingLeft: 16 },
              div({ color: "#7dd3fc" }, `"${k}"`), div({ color: C.dim }, ": "),
              div({ color: "#fde68a" }, `"${v}"`), div({ color: C.dim }, i < now.length - 1 ? "," : ""),
            ),
          ),
          div({ color: C.dim }, "}"),
        ),
      ),
    ),
    div({ justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${C.line}`, paddingTop: 18 },
      mono(14, C.dim, "Software Engineering Intern at AppWeave  ·  B.Tech CSE at IIIT Nuzvid"),
      mono(14, C.ac, "girishthedecent.space ↗"),
    ),
  );
  await write("assets/banner.svg", await render(node, W, H));
}

async function codebook() {
  const W = 1280, H = 580;
  const shot = await dataUri("assets/codebook.jpg", "image/jpeg");
  const fact = (n, l) =>
    div({ flexDirection: "column", padding: "12px 16px", border: `1px solid ${C.line2}`, borderRadius: 10, background: C.p2, flex: 1 },
      serif(36, C.ink, String(n)), mono(12, C.mu, l, { marginTop: 4 }));
  const btn = (t, pri) =>
    div({ padding: "11px 18px", borderRadius: 999, fontFamily: "Sans", fontWeight: 500, fontSize: 16, background: pri ? C.ac : C.p2, color: pri ? "#fff" : C.ink, border: `1px solid ${pri ? C.ac : C.line2}` }, t);
  const node = frame(
    { padding: 36, gap: 36, alignItems: "center", backgroundImage: `radial-gradient(circle at 85% 0%, #e8432c22, transparent 55%)` },
    div({ flexDirection: "column", width: 450, gap: 16 },
      div({ alignItems: "center", gap: 10 }, dot(C.ac), mono(14, C.ac, "live"), mono(14, C.dim, "·  agentic rag workspace  ·  2026")),
      serif(76, C.ink, "CodeBook", { letterSpacing: -1.5 }),
      sans(17.5, C.body, "Ask a book and a codebase in one question. Ingests PDFs, websites and GitHub repos, retrieves with pgvector + full-text search fused by weighted RRF, and answers through a multi-step agent with streaming, cited sources.", { lineHeight: 1.5 }),
      div({ gap: 10 }, fact(9, "agent tools"), fact(65, "eval cases"), fact(3, "source types")),
      div({ gap: 10, flexWrap: "wrap" }, ...["TypeScript", "PostgreSQL", "pgvector", "Inngest"].map((s) => chip(s))),
      div({ gap: 10, marginTop: 4 }, btn("Live demo ↗", true), btn("Case study →"), btn("Code ↗")),
    ),
    div({ flex: 1, borderRadius: 12, border: `1px solid ${C.line2}`, overflow: "hidden", boxShadow: "0 30px 80px -30px #e8432c55" },
      img(shot, 718, 449, { objectFit: "cover" }),
    ),
  );
  await write("assets/codebook.svg", await render(node, W, H));
}

async function experience() {
  const W = 1280, H = 470;
  const logo = await dataUri("assets/appweave-icon.svg", "image/svg+xml");
  const collected = await dataUri("assets/collected.svg", "image/svg+xml");
  const tile = (t) =>
    div({ flexDirection: "column", justifyContent: "space-between", width: 322, height: 148, padding: "20px 22px", background: C.p2, border: `1px solid ${C.line2}`, borderRadius: 14, borderTop: `3px solid ${t.accent}` },
      div({ justifyContent: "space-between", alignItems: "center" },
        div({ alignItems: "center", gap: 8 },
          t.product === "Collected" ? img(collected, 24, 13) : dot(t.accent),
          sans(16, C.ink, t.product, { fontWeight: 500 })),
        mono(12, t.accent, t.tag),
      ),
      div({ alignItems: "baseline", gap: 10 }, serif(46, C.ink, t.big), mono(12, C.mu, t.unit)),
      sans(14.5, C.mu, t.text, { lineHeight: 1.45 }),
    );
  const node = frame(
    { padding: 32, gap: 28 },
    div({ flexDirection: "column", justifyContent: "space-between", width: 400, padding: "6px 4px" },
      div({ flexDirection: "column", gap: 16 },
        mono(13, C.dim, "01  /  experience"),
        div({ alignItems: "center", gap: 14, marginTop: 6 },
          div({ width: 58, height: 58, borderRadius: 14, background: C.p3, border: `1px solid ${C.line2}`, alignItems: "center", justifyContent: "center" }, img(logo, 36, 36)),
          div({ flexDirection: "column", gap: 4 }, serif(48, C.ink, "AppWeave"), mono(13, C.mu, "appweave.tech ↗"))),
        sans(20, C.ink, "Software Engineering Intern", { fontWeight: 500, marginTop: 6 }),
        mono(14, C.mu, "May 2026 — present"),
        sans(17, C.body, "Shipping product features, re-architecting backends and owning test automation across AppWeave's products.", { lineHeight: 1.5 }),
      ),
      div({ gap: 8, flexWrap: "wrap" }, ...impact.map((t) => chip(t.product, t.accent))),
    ),
    div({ flexWrap: "wrap", gap: 16, flex: 1, alignContent: "center" }, ...impact.map(tile)),
  );
  await write("assets/experience.svg", await render(node, W, H));
}

async function workCards() {
  for (const p of work) {
    const node = frame(
      { flexDirection: "column", justifyContent: "space-between", padding: "26px 28px", borderTop: `3px solid ${p.accent}`, backgroundImage: `radial-gradient(circle at 100% 0%, ${p.accent}1f, transparent 60%)` },
      div({ flexDirection: "column", gap: 12 },
        div({ justifyContent: "space-between", alignItems: "center" },
          div({ alignItems: "center", gap: 9 }, dot(p.accent), mono(13, p.accent, p.tagline.toLowerCase())),
          mono(13, C.dim, String(p.year))),
        serif(54, C.ink, p.name, { letterSpacing: -0.8 }),
        sans(16.5, C.mu, p.short, { lineHeight: 1.5 }),
      ),
      div({ justifyContent: "space-between", alignItems: "flex-end", gap: 12 },
        div({ gap: 7, flexWrap: "wrap", maxWidth: 420 }, ...p.stack.map((s) => chip(s))),
        mono(14, C.ink, p.live ? "live + code ↗" : "code ↗"),
      ),
    );
    await write(`assets/work-${p.slug}.svg`, await render(node, 630, 330));
  }
}

async function stackGrid() {
  const W = 1280, H = 460;
  const item = ([name, key]) => {
    const ic = key ? si[key] : null;
    return div({ alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, border: `1px solid ${C.line2}`, background: C.p2 },
      ic ? img(iconSvg(ic.path, brand(ic.hex)), 17, 17)
        : div({ width: 17, height: 17, borderRadius: 4, background: C.p3, border: `1px solid ${C.line2}`, alignItems: "center", justifyContent: "center", fontFamily: "Mono", fontSize: 8, color: C.mu }, name.slice(0, 2).toUpperCase()),
      sans(15, C.body, name));
  };
  const node = frame(
    { flexWrap: "wrap", padding: 24, gap: 16, background: C.bg },
    ...stack.map((g) =>
      div({ flexDirection: "column", gap: 14, width: 361, height: 159, padding: "18px 18px", background: C.p, border: `1px solid ${C.line}`, borderRadius: 14 },
        div({ alignItems: "center", gap: 9 }, dot(g.color), mono(13, g.color, g.group.toLowerCase())),
        div({ flexWrap: "wrap", gap: 8 }, ...g.items.map(item)),
      )),
  );
  await write("assets/stack.svg", await render(node, W, H));
}

const stroke = (d) =>
  `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${C.ink}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`).toString("base64")}`;
const links = [
  ["site", "girishthedecent.space", stroke("M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"), C.ac],
  ["linkedin", "LinkedIn", iconSvg("M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C21.6 8.65 22 11.2 22 14.5V21h-4v-5.8c0-1.4-.03-3.2-1.95-3.2-1.95 0-2.25 1.5-2.25 3.1V21h-4z", "#0a84ff")],
  ["x", "X", iconSvg(si.siX.path, C.ink)],
  ["leetcode", "LeetCode", iconSvg(si.siLeetcode.path, "#f5a524")],
  ["email", "Email", stroke("M3 6h18v12H3zM3 7l9 6 9-6")],
  ["resume", "Resume", stroke("M7 3h7l5 5v13H7zM14 3v5h5M12 11v6M9.5 14.5 12 17l2.5-2.5")],
];

async function linkPills() {
  for (const [key, label, icon, color] of links) {
    const W = Math.round(58 + label.length * 8.6);
    const node = div({ width: "100%", height: "100%" },
      div({ flex: 1, alignItems: "center", justifyContent: "center", gap: 9, borderRadius: 999, border: `1px solid ${color ?? C.line2}`, background: C.p },
        img(icon, 16, 16), mono(14, color ?? C.ink, label)));
    await write(`assets/link-${key}.svg`, await render(node, W, 40));
  }
}

// ---------- live cards ----------
const DAY = 86_400_000;
const fmt = (n) => n.toLocaleString("en-US");
const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

function heatmap(weeks, colors) {
  return div({ gap: 2.6 },
    ...weeks.map((w) =>
      div({ flexDirection: "column", gap: 2.6 },
        ...Array.from({ length: 7 }, (_, r) => {
          const d = w.find((x) => x.row === r);
          return div({ width: 8, height: 8, borderRadius: 2, background: d ? colors[d.level] : "transparent" });
        }))));
}
const legend = (colors) =>
  div({ alignItems: "center", gap: 4 }, mono(11, C.dim, "less", { marginRight: 4 }),
    ...colors.map((c) => div({ width: 8, height: 8, borderRadius: 2, background: c })), mono(11, C.dim, "more", { marginLeft: 4 }));
const stat = (v, l) => div({ flexDirection: "column", alignItems: "flex-end", gap: 2 }, serif(30, C.ink, v), mono(11, C.mu, l));
const cardHead = (left) =>
  div({ justifyContent: "space-between", alignItems: "center" }, mono(12, C.mu, left), mono(12, C.dim, `updated ${today}`));

async function leetcode() {
  const res = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json", Referer: "https://leetcode.com", "User-Agent": "Mozilla/5.0" },
    body: JSON.stringify({
      query: "query($u:String!){userContestRanking(username:$u){rating topPercentage attendedContestsCount badge{name}} matchedUser(username:$u){submitStatsGlobal{acSubmissionNum{difficulty count}} userCalendar{streak totalActiveDays submissionCalendar}}}",
      variables: { u: USER },
    }),
    signal: AbortSignal.timeout(15000),
  });
  const { data } = await res.json();
  const r = data.userContestRanking;
  const cal = data.matchedUser.userCalendar;
  const solved = data.matchedUser.submitStatsGlobal.acSubmissionNum.find((x) => x.difficulty === "All").count;
  const counts = new Map(Object.entries(JSON.parse(cal.submissionCalendar)).map(([ts, n]) => [new Date(+ts * 1000).toISOString().slice(0, 10), n]));
  const d = new Date();
  const end = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  let start = end - 364 * DAY;
  start -= new Date(start).getUTCDay() * DAY;
  const weeks = [];
  let subs = 0;
  for (let t = start, i = 0; t <= end; t += DAY, i++) {
    const n = counts.get(new Date(t).toISOString().slice(0, 10)) ?? 0;
    subs += n;
    (weeks[Math.floor(i / 7)] ??= []).push({ row: new Date(t).getUTCDay(), level: n === 0 ? 0 : n <= 2 ? 1 : n <= 5 ? 2 : n <= 9 ? 3 : 4 });
  }
  const green = [C.p3, "#0f3d22", "#17693a", "#22a351", "#2cbb5d"];
  const knight = await dataUri("assets/knight.png", "image/png");
  const node = frame(
    { flexDirection: "column", justifyContent: "space-between", padding: "22px 26px", backgroundImage: `radial-gradient(circle at 0% 0%, #f5a52418, transparent 55%)` },
    cardHead(`leetcode / ${USER}`),
    div({ justifyContent: "space-between", alignItems: "center" },
      div({ alignItems: "center", gap: 14 },
        img(knight, 64, 64),
        div({ flexDirection: "column", gap: 4 },
          serif(56, C.ink, String(Math.round(r.rating))),
          mono(12, "#f5a524", `${(r.badge?.name ?? "knight").toLowerCase()} · top ${r.topPercentage}%`))),
      div({ gap: 26 }, stat(fmt(solved), "solved"), stat(String(r.attendedContestsCount), "contests"), stat(`${cal.streak}d`, "streak")),
    ),
    heatmap(weeks, green),
    div({ justifyContent: "space-between", alignItems: "center" }, mono(11, C.dim, `${fmt(subs)} submissions · ${cal.totalActiveDays} active days`), legend(green)),
  );
  await write("assets/leetcode.svg", await render(node, 620, 310));
}

async function github() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN not set");
  const q = `query($u:String!){user(login:$u){createdAt followers{totalCount}
    repositories(ownerAffiliations:OWNER,isFork:false,privacy:PUBLIC,first:100){totalCount nodes{stargazerCount languages(first:10,orderBy:{field:SIZE,direction:DESC}){edges{size node{name color}}}}}
    contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{contributionCount}}} totalCommitContributions}}}`;
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json", "User-Agent": USER },
    body: JSON.stringify({ query: q, variables: { u: USER } }),
    signal: AbortSignal.timeout(15000),
  });
  const json = await res.json();
  if (!json.data?.user) throw new Error(JSON.stringify(json.errors ?? json));
  const u = json.data.user;
  const cc = u.contributionsCollection;
  const active = cc.contributionCalendar.weeks.flatMap((w) => w.contributionDays).filter((d) => d.contributionCount > 0).length;
  const stars = u.repositories.nodes.reduce((s, r) => s + r.stargazerCount, 0);
  const langs = new Map();
  for (const r of u.repositories.nodes)
    for (const e of r.languages.edges) {
      if (["Jupyter Notebook", "Dockerfile", "Shell", "Procfile"].includes(e.node.name)) continue;
      const cur = langs.get(e.node.name) ?? { size: 0, color: e.node.color ?? C.mu };
      cur.size += e.size;
      langs.set(e.node.name, cur);
    }
  const total = [...langs.values()].reduce((s, l) => s + l.size, 0);
  const top = [...langs.entries()].sort((a, b) => b[1].size - a[1].size).map(([name, l]) => ({ name, color: l.color, pct: (l.size / total) * 100 })).filter((l) => l.pct >= 1).slice(0, 5);
  const ghIcon = iconSvg(si.siGithub.path, C.ink);
  const node = frame(
    { flexDirection: "column", justifyContent: "space-between", padding: "22px 26px", backgroundImage: `radial-gradient(circle at 0% 0%, #39d35314, transparent 55%)` },
    cardHead(`github / ${USER}`),
    div({ justifyContent: "space-between", alignItems: "center" },
      div({ alignItems: "center", gap: 14 },
        div({ width: 64, height: 64, borderRadius: 16, background: C.p3, border: `1px solid ${C.line2}`, alignItems: "center", justifyContent: "center" }, img(ghIcon, 34, 34)),
        div({ flexDirection: "column", gap: 4 },
          serif(56, C.ink, fmt(cc.contributionCalendar.totalContributions)),
          mono(12, "#39d353", "contributions · last year"))),
      div({ gap: 26 }, stat(fmt(cc.totalCommitContributions), "commits"), stat(String(u.repositories.totalCount), "repos"), stat(String(active), "active days")),
    ),
    div({ width: "100%", height: 10, borderRadius: 99, overflow: "hidden", background: C.p3 },
      ...top.map((l) => div({ width: `${l.pct}%`, height: "100%", background: l.color }))),
    div({ gap: 22, alignItems: "center" },
      ...top.map((l) => div({ alignItems: "center", gap: 6 }, dot(l.color), mono(11, C.body, l.name), mono(11, C.dim, `${l.pct.toFixed(0)}%`)))),
  );
  await write("assets/github.svg", await render(node, 620, 310));
  console.log("stars", stars, "followers", u.followers.totalCount);
}

// ---------- run ----------
const only = process.argv[2]; // "live" renders only the daily cards
const jobs = only === "live" ? { leetcode, github } : { banner, linkPills, codebook, experience, workCards, stackGrid, leetcode, github };
let failed = 0;
for (const [name, fn] of Object.entries(jobs)) {
  try {
    await fn();
    console.log("ok  ", name);
  } catch (e) {
    failed++;
    console.error("FAIL", name, e.message); // keep the previous image if a live fetch fails
  }
}
process.exitCode = failed && only !== "live" ? 1 : 0;
