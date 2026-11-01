// Renders every image in assets/ in the girishthedecent.space style.
// Static: banner, links, codebook, experience, work cards, stack, footer. Live: leetcode.svg, github.svg.
// Run: node scripts/build.mjs        (GITHUB_TOKEN is needed for the GitHub card)
//      node scripts/build.mjs live   (only the daily cards; used by the workflow)
//
// GitHub shrinks README images to ~65%, so type sizes here are set for that (17px here ≈ 11px there).
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
  ink: "#f2f2f0", mu: "#a3a3a0", dim: "#77776f", body: "#d4d4d0", ac: "#e8432c", ok: "#22c55e",
};

// Marker colours: visually identical to the real ones, but unique, so animate() can find the shapes.
const M = {
  hi: "#a3a39f", first: "#f2f2f1", last: "#a3a3a1", role: "#f2f2ef", roleSub: "#a3a3a2",
  okPulse: "#22c55f", acPulse: "#e8432d", cursor: "#e8432b",
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

// ---------- element helpers (satori sizes are content-box: width excludes padding/border) ----------
const h = (type, props, ...kids) => {
  const children = kids.flat(Infinity).filter((k) => k !== null && k !== undefined && k !== false);
  return { type, props: { ...props, children: children.length === 1 ? children[0] : children } };
};
const div = (style, ...kids) => h("div", { style: { display: "flex", ...style } }, ...kids);
const img = (src, w, ht, style = {}) => h("img", { src, width: w, height: ht, style });
const mono = (size, color, text, style = {}) => div({ fontFamily: "Mono", fontSize: size, color, letterSpacing: 0.2, ...style }, text);
const serif = (size, color, text, style = {}) => div({ fontFamily: "Serif", fontSize: size, color, lineHeight: 1, ...style }, text);
const sans = (size, color, text, style = {}) => div({ fontFamily: "Sans", fontSize: size, color, ...style }, text);
const dot = (color, size = 9) => div({ width: size, height: size, borderRadius: 999, background: color });
const chip = (text, color = C.mu, size = 15) =>
  div({ padding: "6px 12px", border: `1px solid ${C.line2}`, borderRadius: 999, fontFamily: "Mono", fontSize: size, color, background: C.p2 }, text);

// Outer box fills the canvas; the inner one takes the padding.
const frame = (style, ...kids) =>
  div({ width: "100%", height: "100%" },
    div({ flex: 1, background: C.p, border: `1px solid ${C.line}`, borderRadius: 18, fontFamily: "Sans", color: C.ink, overflow: "hidden", ...style }, ...kids));

const svgUri = (inner, attrs = "") =>
  `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ${attrs}>${inner}</svg>`).toString("base64")}`;
const iconSvg = (path, fill) => svgUri(`<path fill="${fill}" d="${path}"/>`);
const stroke = (d, color = C.ink) =>
  svgUri(`<path d="${d}"/>`, `fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"`);
/** Dark brand colours (Express, Next.js...) are lifted to white so they read on black. */
const brand = (hex) => {
  if (!hex) return C.ink;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.18 ? C.ink : `#${hex}`;
};

// ---------- animation (CSS inside the SVG; GitHub plays it on every page load) ----------
const CSS = `
@keyframes rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes pop{from{opacity:0;transform:scale(.2)}to{opacity:1;transform:none}}
@keyframes ring{0%{opacity:.85;transform:scale(1)}80%,100%{opacity:0;transform:scale(3.4)}}
@keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}
@keyframes grow{from{transform:scaleX(0)}to{transform:none}}
.rise{animation:rise 1s cubic-bezier(.2,.7,.2,1) both}
.pop{transform-box:fill-box;transform-origin:center;animation:pop .55s cubic-bezier(.2,.8,.2,1.2) both}
.ring{transform-box:fill-box;transform-origin:center;animation:ring 2.4s ease-out infinite}
.blink{animation:blink 1.1s infinite}
.grow{transform-box:fill-box;transform-origin:left center;animation:grow 1.3s cubic-bezier(.2,.7,.2,1) both}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}`;

const attr = (tag, name) => tag.match(new RegExp(` ${name}="([^"]*)"`))?.[1];
/**
 * Post-processes satori's SVG: `pick(tag)` returns { cls, delay, fill, ring } for shapes to animate.
 * `fill` swaps a marker colour back to the real one; `ring` adds a pulsing halo around a dot.
 */
function animate(svg, pick) {
  const out = svg.replace(/<(path|rect)\b[^>]*?\/>/g, (tag) => {
    const a = pick(tag, { fill: attr(tag, "fill"), x: +attr(tag, "x"), y: +attr(tag, "y"), w: +attr(tag, "width"), h: +attr(tag, "height") });
    if (!a) return tag;
    let t = tag;
    if (a.fill) t = t.replace(/ fill="[^"]*"/, ` fill="${a.fill}"`);
    if (a.cls) t = t.replace(/\/>$/, ` class="${a.cls}"${a.delay ? ` style="animation-delay:${a.delay.toFixed(2)}s"` : ""}/>`);
    if (a.ring) {
      const { x, y, w, color } = a.ring;
      t += `<circle cx="${x + w / 2}" cy="${y + w / 2}" r="${w / 2}" fill="none" stroke="${color}" stroke-width="1.4" class="ring"/>`;
    }
    return t;
  });
  return out.replace(/(<svg[^>]*>)/, `$1<style>${CSS}</style>`);
}
const real = Object.fromEntries(Object.entries(M).map(([k, v]) => [v, { hi: C.mu, first: C.ink, last: C.mu, role: C.ink, roleSub: C.mu, okPulse: C.ok, acPulse: C.ac, cursor: C.ac }[k]]));
/** Default picker: entrance for the hero text, halos for live dots, blinking cursor. */
function basicPick(tag, s) {
  const fill = real[s.fill];
  if (!fill) return null;
  const order = { [M.hi]: 0.05, [M.first]: 0.15, [M.last]: 0.3, [M.role]: 0.5, [M.roleSub]: 0.6 };
  if (s.fill in order) return { fill, cls: "rise", delay: order[s.fill] };
  if (s.fill === M.okPulse || s.fill === M.acPulse) return { fill, ring: { x: s.x, y: s.y, w: s.w, color: fill } };
  if (s.fill === M.cursor) return { fill, cls: "blink" };
  return null;
}

const render = (node, width, height) => satori(node, { width, height, fonts: fontData });

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
  { product: "Marketplace", accent: "#2dd4bf", tag: "testing", big: "Playwright", unit: "E2E suite", text: "Moved the legacy end-to-end suite to Playwright, covering critical user workflows." },
  { product: "Watch scrapers", accent: "#a78bfa", tag: "data", big: "33%", unit: "failing sites fixed", text: "Fixed scraping across four platforms, improving listing availability and status accuracy." },
];
const work = [
  { slug: "hotelbooking", name: "HotelBooking", accent: "#ef4444", tagline: "Distributed reservation system", year: 2026, short: "Four microservices for auth, hotels, reservations and notifications, with Redis locks and idempotency keys around every booking.", stack: ["TypeScript", "MySQL", "Redis", "BullMQ"] },
  { slug: "algo-backend", name: "Algo Backend", accent: "#a78bfa", tagline: "Distributed online judge", year: 2026, short: "An online judge that runs untrusted C++ and Python in isolated, resource-limited Docker sandboxes behind a BullMQ queue.", stack: ["TypeScript", "MongoDB", "Docker", "BullMQ"] },
  { slug: "meetly", name: "Meetly", accent: "#f59e0b", tagline: "Real-time video meetings", year: 2025, short: "Multi-user video calls in the browser with WebRTC and Socket.IO signaling, live chat and screen sharing.", stack: ["React", "WebRTC", "Socket.IO", "MongoDB"], live: true },
  { slug: "play-for-impact", name: "Play for Impact", accent: "#22c55e", tagline: "Subscriptions & prize draws", year: 2026, short: "Golf subscriptions with monthly charity prize draws: transactional score windows, atomic results, jackpot rollover.", stack: ["TypeScript", "React", "PostgreSQL", "Stripe"], live: true },
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
  const node = frame(
    { background: C.bg, backgroundImage: `radial-gradient(circle, #262626 1.1px, transparent 1.3px)`, backgroundSize: "26px 26px", padding: "40px 52px", flexDirection: "column", justifyContent: "space-between" },
    div({ justifyContent: "space-between", alignItems: "center" },
      div({ alignItems: "center", gap: 13 },
        img(avatar, 44, 44, { borderRadius: 999, border: `1px solid ${C.line2}` }),
        div({ fontFamily: "Sans", fontSize: 22, fontWeight: 500 }, "girish", div({ color: C.dim }, "the"), "decent"),
      ),
      div({ alignItems: "center", gap: 11, padding: "10px 18px", borderRadius: 999, border: `1px solid ${C.line2}`, background: C.p },
        dot(M.okPulse, 10), mono(17, C.body, "open to internships"),
      ),
    ),
    div({ justifyContent: "space-between", alignItems: "flex-end" },
      div({ flexDirection: "column" },
        mono(24, M.hi, "hi, I'm", { marginBottom: 4 }),
        div({ alignItems: "baseline" },
          serif(124, M.first, "Girish", { marginRight: 26, letterSpacing: -2 }),
          serif(124, M.last, "Pasupuleti", { fontStyle: "italic", letterSpacing: -2 }),
        ),
        div({ alignItems: "center", gap: 14, marginTop: 16 },
          sans(30, M.role, "Backend & Full Stack Engineer", { fontWeight: 500 }),
          div({ width: 6, height: 6, borderRadius: 9, background: C.ac }),
          sans(30, M.roleSub, "AI Engineering"),
        ),
      ),
      div({ flexDirection: "column", width: 404, border: `1px solid ${C.line2}`, borderRadius: 12, background: C.p, overflow: "hidden" },
        div({ justifyContent: "space-between", alignItems: "center", padding: "11px 16px", borderBottom: `1px solid ${C.line}` },
          mono(15, C.mu, "now.json"),
          div({ gap: 6 }, dot(C.line2, 10), dot(C.line2, 10), dot(C.line2, 10)),
        ),
        div({ flexDirection: "column", padding: "14px 16px", gap: 8, fontFamily: "Mono", fontSize: 15, whiteSpace: "nowrap" },
          div({ color: C.dim }, "{"),
          ...now.map(([k, v], i) =>
            div({ paddingLeft: 14 },
              div({ color: "#7dd3fc" }, `"${k}"`), div({ color: C.dim }, ": "),
              div({ color: "#fde68a" }, `"${v}"`), div({ color: C.dim }, i < now.length - 1 ? "," : ""),
            ),
          ),
          div({ alignItems: "center", gap: 4 }, div({ color: C.dim }, "}"), div({ width: 9, height: 18, background: M.cursor })),
        ),
      ),
    ),
    div({ justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${C.line}`, paddingTop: 18 },
      mono(17, C.dim, "SWE Intern at AppWeave  ·  B.Tech CSE at IIIT Nuzvid"),
      mono(17, C.ac, "girishthedecent.space ↗"),
    ),
  );
  await write("assets/banner.svg", animate(await render(node, 1280, 480), basicPick));
}

const links = [
  ["site", "girishthedecent.space", stroke("M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z", C.ac), C.ac],
  ["linkedin", "LinkedIn", iconSvg("M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C21.6 8.65 22 11.2 22 14.5V21h-4v-5.8c0-1.4-.03-3.2-1.95-3.2-1.95 0-2.25 1.5-2.25 3.1V21h-4z", "#0a84ff")],
  ["x", "X", iconSvg(si.siX.path, C.ink)],
  ["leetcode", "LeetCode", iconSvg(si.siLeetcode.path, "#f5a524")],
  ["email", "Email", stroke("M3 6h18v12H3zM3 7l9 6 9-6")],
  ["resume", "Resume", stroke("M7 3h7l5 5v13H7zM14 3v5h5M12 11v6M9.5 14.5 12 17l2.5-2.5")],
];
async function linkPills() {
  for (const [key, label, icon, color] of links) {
    const node = div({ width: "100%", height: "100%" },
      div({ flex: 1, alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 999, border: `1px solid ${color ?? C.line2}`, background: C.p },
        img(icon, 18, 18), mono(16, color ?? C.ink, label)));
    await write(`assets/link-${key}.svg`, await render(node, Math.round(64 + label.length * 9.8), 44));
  }
}

async function codebook() {
  const shot = await dataUri("assets/codebook.jpg", "image/jpeg");
  const fact = (n, l) =>
    div({ flexDirection: "column", padding: "12px 16px", border: `1px solid ${C.line2}`, borderRadius: 10, background: C.p2, flex: 1 },
      serif(42, C.ink, String(n)), mono(15, C.mu, l, { marginTop: 4 }));
  const btn = (t, pri) =>
    div({ padding: "12px 20px", borderRadius: 999, fontFamily: "Sans", fontWeight: 500, fontSize: 19, background: pri ? C.ac : C.p2, color: pri ? "#fff" : C.ink, border: `1px solid ${pri ? C.ac : C.line2}` }, t);
  const node = frame(
    { padding: 36, gap: 34, alignItems: "center", backgroundImage: `radial-gradient(circle at 85% 0%, #e8432c26, transparent 55%)` },
    div({ flexDirection: "column", width: 470, gap: 18 },
      div({ alignItems: "center", gap: 10 }, dot(M.acPulse), mono(17, C.ac, "live"), mono(17, C.dim, "·  agentic RAG workspace")),
      serif(84, C.ink, "CodeBook", { letterSpacing: -1.5 }),
      sans(21, C.body, "Ask a book and a codebase in one question. It ingests PDFs, websites and repos, retrieves with hybrid search, and answers through a multi-step agent with cited sources.", { lineHeight: 1.45 }),
      div({ gap: 10 }, fact(9, "agent tools"), fact(65, "eval cases"), fact(3, "source types")),
      div({ gap: 9, flexWrap: "wrap" }, ...["TypeScript", "PostgreSQL", "pgvector", "Inngest"].map((s) => chip(s, C.mu, 16))),
      div({ gap: 10, marginTop: 4 }, btn("Live demo ↗", true), btn("Case study →"), btn("Code ↗")),
    ),
    div({ flex: 1, borderRadius: 12, border: `1px solid ${C.line2}`, overflow: "hidden", boxShadow: "0 30px 80px -30px #e8432c66" },
      img(shot, 702, 439, { objectFit: "cover" }),
    ),
  );
  await write("assets/codebook.svg", animate(await render(node, 1280, 640), basicPick));
}

async function experience() {
  const logo = await dataUri("assets/appweave-icon.svg", "image/svg+xml");
  const collected = await dataUri("assets/collected.svg", "image/svg+xml");
  const tile = (t) =>
    div({ flexDirection: "column", justifyContent: "space-between", width: 345, height: 195, padding: "20px 22px", background: C.p2, border: `1px solid ${C.line2}`, borderRadius: 14, borderTop: `3px solid ${t.accent}` },
      div({ justifyContent: "space-between", alignItems: "center" },
        div({ alignItems: "center", gap: 9 },
          t.product === "Collected" ? img(collected, 28, 15) : dot(t.accent, 10),
          sans(19, C.ink, t.product, { fontWeight: 500 })),
        mono(15, t.accent, t.tag),
      ),
      div({ alignItems: "baseline", gap: 10 }, serif(54, C.ink, t.big), mono(14, C.mu, t.unit)),
      sans(17.5, C.mu, t.text, { lineHeight: 1.4 }),
    );
  const node = frame(
    { padding: 32, gap: 28 },
    div({ flexDirection: "column", justifyContent: "space-between", width: 380, padding: "4px 4px" },
      div({ flexDirection: "column", gap: 16 },
        mono(15, C.dim, "01  /  experience"),
        div({ alignItems: "center", gap: 16, marginTop: 4 },
          div({ width: 64, height: 64, borderRadius: 15, background: C.p3, border: `1px solid ${C.line2}`, alignItems: "center", justifyContent: "center" }, img(logo, 40, 40)),
          div({ flexDirection: "column", gap: 4 }, serif(56, C.ink, "AppWeave"), mono(15, C.mu, "appweave.tech ↗"))),
        sans(23, C.ink, "Software Engineering Intern", { fontWeight: 500, marginTop: 6 }),
        mono(16, C.mu, "May 2026 — present"),
        sans(19.5, C.body, "Shipping product features, re-architecting backends and owning test automation across AppWeave's products.", { lineHeight: 1.45 }),
      ),
      div({ gap: 8, flexWrap: "wrap" }, ...impact.map((t) => chip(t.product, t.accent, 15))),
    ),
    div({ flexWrap: "wrap", gap: 16, flex: 1, alignContent: "center" }, ...impact.map(tile)),
  );
  await write("assets/experience.svg", await render(node, 1280, 560));
}

async function workCards() {
  for (const p of work) {
    const node = frame(
      { flexDirection: "column", justifyContent: "space-between", padding: "26px 30px", borderTop: `3px solid ${p.accent}`, backgroundImage: `radial-gradient(circle at 100% 0%, ${p.accent}24, transparent 60%)` },
      div({ flexDirection: "column", gap: 12 },
        div({ justifyContent: "space-between", alignItems: "center" },
          div({ alignItems: "center", gap: 10 }, dot(p.accent, 10), mono(17, p.accent, p.tagline.toLowerCase())),
          mono(17, C.dim, String(p.year))),
        serif(64, C.ink, p.name, { letterSpacing: -0.8 }),
        sans(20, C.mu, p.short, { lineHeight: 1.45 }),
      ),
      div({ justifyContent: "space-between", alignItems: "center", gap: 12 },
        div({ gap: 8 }, ...p.stack.map((s) => chip(s, C.mu, 15))),
        mono(18, C.ink, p.live ? "live ↗" : "code ↗"),
      ),
    );
    await write(`assets/work-${p.slug}.svg`, await render(node, 630, 370));
  }
}

async function stackGrid() {
  const item = ([name, key]) => {
    const ic = key ? si[key] : null;
    return div({ alignItems: "center", gap: 9, padding: "9px 13px", borderRadius: 10, border: `1px solid ${C.line2}`, background: C.p2 },
      ic ? img(iconSvg(ic.path, brand(ic.hex)), 21, 21)
        : div({ width: 21, height: 21, borderRadius: 5, background: C.p3, border: `1px solid ${C.line2}`, alignItems: "center", justifyContent: "center", fontFamily: "Mono", fontSize: 10, color: C.mu }, name.slice(0, 2).toUpperCase()),
      sans(18, C.body, name));
  };
  const node = frame(
    { flexWrap: "wrap", padding: 24, gap: 16, background: C.bg },
    ...stack.map((g) =>
      div({ flexDirection: "column", gap: 16, width: 361, height: 199, padding: 18, background: C.p, border: `1px solid ${C.line}`, borderRadius: 14 },
        div({ alignItems: "center", gap: 10 }, dot(g.color, 10), mono(16, g.color, g.group.toLowerCase())),
        div({ flexWrap: "wrap", gap: 9 }, ...g.items.map(item)),
      )),
  );
  await write("assets/stack.svg", await render(node, 1280, 540));
}

/** VS Code-style status bar, like the portfolio's footer. */
async function footer() {
  const seg = (kids, style = {}) => div({ alignItems: "center", gap: 9, padding: "0 16px", height: "100%", whiteSpace: "nowrap", flexShrink: 0, ...style }, ...kids);
  const node = div({ width: "100%", height: "100%" },
    div({ flex: 1, justifyContent: "space-between", alignItems: "center", background: C.p, border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden", fontFamily: "Mono", fontSize: 16, color: C.mu },
      div({ height: "100%", alignItems: "center" },
        seg([dot(M.okPulse, 9), div({ color: "#fff" }, "open to internships")], { background: "#b8321f" }),
        seg([img(stroke("M6 3v12M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 9a9 9 0 0 1-9 9", C.mu), 16, 16), "main"]), seg(["backend · full stack · ai"]), seg(["IIIT Nuzvid · India"])),
      div({ height: "100%", alignItems: "center" },
        seg(["TypeScript"]), seg(["UTF-8"]), seg([div({ color: C.ac }, "girishthedecent.space ↗")])),
    ));
  await write("assets/footer.svg", animate(await render(node, 1280, 50), basicPick));
}

// ---------- live cards ----------
const DAY = 86_400_000;
const fmt = (n) => n.toLocaleString("en-US");
const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
const CELL = 8; // whole pixels keep the grid crisp

function heatmap(weeks, colors) {
  return div({ gap: 2, justifyContent: "center" },
    ...weeks.map((w) =>
      div({ flexDirection: "column", gap: 2 },
        ...Array.from({ length: 7 }, (_, r) => {
          const d = w.find((x) => x.row === r);
          return div({ width: CELL, height: CELL, borderRadius: 2, background: d ? colors[d.level] : "transparent" });
        }))));
}
const legend = (colors) =>
  div({ alignItems: "center", gap: 4 }, mono(14, C.dim, "less", { marginRight: 4 }),
    ...colors.map((c) => div({ width: 11, height: 11, borderRadius: 2, background: c })), mono(14, C.dim, "more", { marginLeft: 4 }));
const stat = (v, l) => div({ flexDirection: "column", alignItems: "flex-end", gap: 3 }, serif(36, C.ink, v), mono(14, C.mu, l, { whiteSpace: "nowrap" }));
const cardHead = (left) =>
  div({ justifyContent: "space-between", alignItems: "center" }, mono(15, C.mu, left), mono(14, C.dim, `updated ${today}`));

/** Heatmap cells pop in as a left-to-right wave. */
const wavePick = (minX, span, colors) => (tag, s) =>
  colors.includes(s.fill) && s.w <= CELL + 1 && s.h <= CELL + 1 ? { cls: "pop", delay: 0.2 + ((s.x - minX) / span) * 1.1 + (s.y % 70) / 700 } : basicPick(tag, s);

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
    { flexDirection: "column", justifyContent: "space-between", padding: "22px 28px", backgroundImage: `radial-gradient(circle at 0% 0%, #f5a5241c, transparent 55%)` },
    cardHead(`leetcode / ${USER}`),
    div({ justifyContent: "space-between", alignItems: "center" },
      div({ alignItems: "center", gap: 14 },
        img(knight, 72, 72),
        div({ flexDirection: "column", gap: 5 },
          serif(64, C.ink, String(Math.round(r.rating))),
          mono(15, "#f5a524", `${(r.badge?.name ?? "knight").toLowerCase()} · top ${r.topPercentage}%`))),
      div({ gap: 24 }, stat(fmt(solved), "solved"), stat(String(r.attendedContestsCount), "contests"), stat(`${cal.streak}d`, "streak")),
    ),
    heatmap(weeks, green),
    div({ justifyContent: "space-between", alignItems: "center" }, mono(14, C.dim, `${fmt(subs)} submissions · ${cal.totalActiveDays} days`), legend(green)),
  );
  const svg = await render(node, 620, 350);
  await write("assets/leetcode.svg", animate(svg, wavePick(28, 560, green)));
}

async function github() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN not set");
  const q = `query($u:String!){user(login:$u){
    repositories(ownerAffiliations:OWNER,isFork:false,privacy:PUBLIC,first:100){totalCount nodes{languages(first:10,orderBy:{field:SIZE,direction:DESC}){edges{size node{name color}}}}}
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
  const active = cc.contributionCalendar.weeks.flatMap((w) => w.contributionDays).filter((x) => x.contributionCount > 0).length;
  const langs = new Map();
  for (const r of u.repositories.nodes)
    for (const e of r.languages.edges) {
      if (["Jupyter Notebook", "Dockerfile", "Shell", "Procfile"].includes(e.node.name)) continue;
      const cur = langs.get(e.node.name) ?? { size: 0, color: e.node.color ?? C.mu };
      cur.size += e.size;
      langs.set(e.node.name, cur);
    }
  const total = [...langs.values()].reduce((s, l) => s + l.size, 0);
  const top = [...langs.entries()].sort((a, b) => b[1].size - a[1].size).map(([name, l]) => ({ name, color: l.color, pct: (l.size / total) * 100 })).filter((l) => l.pct >= 1).slice(0, 4);
  const node = frame(
    { flexDirection: "column", justifyContent: "space-between", padding: "22px 28px", backgroundImage: `radial-gradient(circle at 0% 0%, #39d35318, transparent 55%)` },
    cardHead(`github / ${USER}`),
    div({ justifyContent: "space-between", alignItems: "center" },
      div({ alignItems: "center", gap: 14 },
        div({ width: 72, height: 72, borderRadius: 18, background: C.p3, border: `1px solid ${C.line2}`, alignItems: "center", justifyContent: "center" }, img(iconSvg(si.siGithub.path, C.ink), 38, 38)),
        div({ flexDirection: "column", gap: 5 },
          serif(64, C.ink, fmt(cc.contributionCalendar.totalContributions)),
          mono(15, "#39d353", "contributions · 1 yr", { whiteSpace: "nowrap" }))),
      div({ gap: 20 }, stat(fmt(cc.totalCommitContributions), "commits"), stat(String(u.repositories.totalCount), "repos"), stat(String(active), "active days")),
    ),
    div({ flexDirection: "column", gap: 14 },
      div({ width: "100%", height: 12, borderRadius: 99, overflow: "hidden", background: C.p3 },
        ...top.map((l) => div({ width: `${l.pct}%`, height: 12, background: l.color }))),
      div({ gap: 22, alignItems: "center" },
        ...top.map((l) => div({ alignItems: "center", gap: 7 }, dot(l.color, 10), mono(15, C.body, l.name), mono(15, C.dim, `${l.pct.toFixed(0)}%`)))),
    ),
    mono(14, C.dim, "public repos · private contributions counted"),
  );
  const svg = await render(node, 620, 350);
  // language bar segments (the only 12px-tall shapes) grow in from the left, one after another
  let i = 0;
  await write("assets/github.svg", animate(svg, (tag, s) => (s.h === 12 && s.w > 1 && s.w < 560 && s.fill !== "#fff" ? { cls: "grow", delay: 0.3 + i++ * 0.25 } : basicPick(tag, s))));
}

// ---------- run ----------
const only = process.argv[2]; // "live" renders only the daily cards
const jobs = only === "live" ? { leetcode, github } : { banner, linkPills, codebook, experience, workCards, stackGrid, footer, leetcode, github };
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
