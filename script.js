// Mythologica, SPA front end
// Loads curated JSON from /data, routes in-page, no LLM in this build.

const DATA_DIR = "data/";
const MANIFEST_URL = "data/manifest.json";

const TOPIC_TITLE_TO_ID = {
  "Temples and Sanctuaries": "temples-and-sanctuaries",
  "Oracles and Divination": "oracles-and-divination",
  "Religious Festivals": "greek-festivals",
  "Minor Deities, Daimones & Mythical Creatures": "minor-deities-and-creatures",
  "Death and the Afterlife": "death-and-afterlife",
  "Greek Philosophy and Religion": "greek-philosophy-and-religion",
};

const catalog = { greek: [], byId: new Map() };
const entryCache = new Map();
let catalogReady = null;
let currentHash = null;
let renderGen = 0;

const viewEl = () => document.getElementById("view");

function categoryLabel(cat) {
  const labels = { god: "God", hero: "Hero", event: "Event", religion: "Religion & Practice" };
  return labels[cat] || cat;
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function displayName(id) {
  const hit = catalog.byId.get(id);
  if (hit) return hit.title;
  return id.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function hrefFor(entryOrType, id) {
  if (typeof entryOrType === "object") {
    const e = entryOrType;
    if (e.type === "character") return `#/character/${e.id}`;
    if (e.type === "event") return `#/event/${e.id}`;
    return `#/topic/${e.id}`;
  }
  if (entryOrType === "character") return `#/character/${id}`;
  if (entryOrType === "event") return `#/event/${id}`;
  return `#/topic/${id}`;
}

function hrefForId(id) {
  const e = catalog.byId.get(id);
  if (!e) return null;
  return hrefFor(e);
}

async function loadManifest() {
  const res = await fetch(MANIFEST_URL);
  if (!res.ok) {
    throw new Error("Could not load data/manifest.json. Serve the folder over HTTP (for example: npx serve .) rather than opening the HTML file directly.");
  }
  const data = await res.json();
  catalog.greek = data.greek || [];
  catalog.byId = new Map(catalog.greek.map(e => [e.id, e]));
  return catalog.greek;
}

function ensureCatalog() {
  if (!catalogReady) catalogReady = loadManifest().catch(err => {
    catalogReady = null;
    throw err;
  });
  return catalogReady;
}

async function loadEntry(id) {
  if (entryCache.has(id)) return entryCache.get(id);
  const res = await fetch(`${DATA_DIR}${id}.json`);
  if (!res.ok) throw new Error(`Could not load entry: ${id}.json`);
  const json = await res.json();
  entryCache.set(id, json);
  return json;
}

function parseRoute() {
  const raw = (location.hash || "#/").replace(/^#/, "") || "/";
  const [pathPart, queryPart] = raw.split("?");
  const parts = pathPart.split("/").filter(Boolean);
  const params = new URLSearchParams(queryPart || "");
  return { parts, params };
}

function cardHTML(entry) {
  return `
    <a class="card" href="${hrefFor(entry)}" data-nav>
      <div class="cat-label">${categoryLabel(entry.category).toUpperCase()}</div>
      <h3>${escapeHtml(entry.title)}</h3>
      <p>${escapeHtml(entry.summary)}</p>
    </a>`;
}

function browseCardHTML(entry) {
  return `
    <a class="card browse-card" href="${hrefFor(entry)}" data-nav>
      <div class="browse-card-body">
        <div class="cat-label">${categoryLabel(entry.category).toUpperCase()}</div>
        <h3>${escapeHtml(entry.title)}</h3>
        <p>${escapeHtml(entry.summary)}</p>
        <span class="browse-card-link">Open entry <span aria-hidden="true">&#8594;</span></span>
      </div>
    </a>`;
}

function homeCardHTML(entry) {
  const imageNames = { "trojan-war": "trojanwar1.jpg" };
  const imageSrc = `images/greek/${imageNames[entry.id] || `${entry.id}.jpg`}`;
  return `
    <a class="card home-card" href="${hrefFor(entry)}" data-nav>
      <div class="home-card-image"><img src="${imageSrc}" alt="${escapeHtml(entry.title)}"></div>
      <div class="home-card-body">
        <div class="cat-label">${categoryLabel(entry.category).toUpperCase()}</div>
        <h3>${escapeHtml(entry.title)}</h3>
        <p>${escapeHtml(entry.summary)}</p>
        <span class="home-card-link">Open entry <span aria-hidden="true">&#8594;</span></span>
      </div>
    </a>`;
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function linkToEntry(id) {
  const href = hrefForId(id);
  const name = displayName(id);
  if (!href) return `<span class="missing" title="No page yet">${escapeHtml(name)}</span>`;
  return `<a href="${href}" data-nav>${escapeHtml(name)}</a>`;
}

function linkifyAspect(text) {
  let out = escapeHtml(text);
  for (const [title, id] of Object.entries(TOPIC_TITLE_TO_ID)) {
    out = out.replace(`'${title}'`, `<a class="inline-link" href="#/topic/${id}" data-nav>${title}</a>`);
  }
  return out;
}

function renderHome() {
  const featured = ["zeus", "athena", "odysseus", "trojan-war"]
    .map(id => catalog.byId.get(id))
    .filter(Boolean);
  const counts = {
    god: catalog.greek.filter(e => e.category === "god").length,
    hero: catalog.greek.filter(e => e.category === "hero").length,
    event: catalog.greek.filter(e => e.category === "event").length,
    religion: catalog.greek.filter(e => e.category === "religion").length,
  };
  return `
    <div class="home-hero">
      <img class="home-hero-image" data-tilt-image src="images/greek/download.jpg" alt="A Greek warrior and ancient ruins across a misty battlefield">
      <div class="home-hero-shade"></div>
      <div class="home-hero-copy">
      <div class="eyebrow">A REFERENCE FOR THE MYTHIC AND THE HISTORICAL</div>
      <h1>THE ANCIENT GREECE</h1>
      <div class="oxide-rule"></div>
      <p>An encyclopedia of Greek mythology and religion, covering the Olympians, the heroes who challenged them, the wars and journeys that defined them, and the temples, oracles, and rites through which they were worshipped.</p>
      <div class="hero-actions">
        <a class="hero-action hero-action-primary" href="#/browse" data-nav>Explore the collection <span aria-hidden="true">&#8594;</span></a>
        <a class="hero-action" href="#/browse?filter=god" data-nav>Meet the gods</a>
      </div>
      </div>
      <a class="scroll-cue" href="#home-categories" aria-label="Scroll to explore categories"><span>Explore below</span><span aria-hidden="true">&#8595;</span></a>
    </div>
    <div class="page" style="padding-top:0;">
      <div class="home-categories" id="home-categories">
      <div class="home-stats home-reveal" aria-label="Collection statistics">
        <div><strong>${counts.god}</strong><span>Gods</span></div>
        <div><strong>${counts.hero}</strong><span>Heroes</span></div>
        <div><strong>${counts.event}</strong><span>Events</span></div>
        <div><strong>${counts.religion}</strong><span>Practices</span></div>
      </div>
      <section class="category-section home-reveal">
      <div class="section-head"><h2>Explore by category</h2></div>
      <div class="gateway">
        <a href="#/browse?filter=god" data-nav>
          <div class="num">${counts.god} ENTRIES</div>
          <h3>Gods</h3>
          <p>The Twelve Olympians and their domains, myths, and family ties.</p>
        </a>
        <a href="#/browse?filter=hero" data-nav>
          <div class="num">${counts.hero} ENTRIES</div>
          <h3>Heroes</h3>
          <p>Mortal figures whose cunning and trials still structure the epics.</p>
        </a>
        <a href="#/browse?filter=event" data-nav>
          <div class="num">${counts.event} ENTRIES</div>
          <h3>Events</h3>
          <p>Wars and journeys that span many characters rather than one profile.</p>
        </a>
        <a href="#/browse?filter=religion" data-nav>
          <div class="num">${counts.religion} ENTRIES</div>
          <h3>Religion</h3>
          <p>Temples, oracles, festivals, and how myth was actually practised.</p>
        </a>
      </div>
      </section>
      <section class="collection-section home-reveal">
      <div class="section-head">
        <h2>Start here</h2>
        <a href="#/browse" data-nav>Browse all ${catalog.greek.length}</a>
      </div>
      <div class="grid home-featured-grid">${featured.map(homeCardHTML).join("")}</div>
      </section>
      </div>
    </div>`;
}

function filteredEntries(filter, query) {
  let filtered = catalog.greek;
  if (filter && filter !== "all") filtered = filtered.filter(e => e.category === filter);
  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(e =>
      e.title.toLowerCase().includes(q) || e.summary.toLowerCase().includes(q)
    );
  }
  return filtered;
}

function renderBrowse(params) {
  const filter = params.get("filter") || "all";
  const query = (params.get("q") || "").trim();
  const filtered = filteredEntries(filter, query);
  const tabs = [
    ["all", "All", "✦"],
    ["god", "Gods", "♔"],
    ["hero", "Heroes", "⚔"],
    ["event", "Events", "◈"],
    ["religion", "Religion & Practice", "◉"],
  ];
  const counts = Object.fromEntries(["god", "hero", "event", "religion"].map(category => [category, catalog.greek.filter(entry => entry.category === category).length]));
  return `
    <div class="crumb"><a href="#/" data-nav>Home</a> / Greek</div>
    <div class="page">
      <div class="greek-browse-hero">
        <img class="greek-browse-image foreground-image" src="images/greek/greek1.jpg" alt="Ancient Greek learning and culture">
        <div class="greek-browse-shade"></div>
        <div class="eyebrow">GREEK MYTHOLOGY & RELIGION</div>
        <h1>Browse the full collection</h1>
        <div class="oxide-rule"></div>
      </div>
      <div class="greek-collection">
      <input class="browse-search" id="browse-search" type="search" placeholder="Filter this list…" value="${escapeHtml(query)}">
      <div class="browse-stats">
        <span><strong>${catalog.greek.length}</strong> entries</span>
        <span><strong>${counts.god}</strong> gods</span>
        <span><strong>${counts.hero}</strong> heroes</span>
        <span><strong>${counts.event + counts.religion}</strong> stories and practices</span>
      </div>
      <div class="section-head" style="margin-top:24px;">
        <div class="tabs">
          ${tabs.map(([id, label, symbol]) =>
            `<button class="tab${filter === id ? " active" : ""}" data-filter="${id}"><span class="tab-symbol" aria-hidden="true">${symbol}</span>${label}</button>`
          ).join("")}
        </div>
        <span class="count" id="result-count">${filtered.length} entries</span>
      </div>
      <div class="grid" id="landing-grid">
        ${filtered.length ? filtered.map(browseCardHTML).join("") : `<p class="empty-state">No entries match “${escapeHtml(query)}”.</p>`}
      </div>
      </div>
    </div>`;
}

function paintBrowseGrid(filter, query) {
  const filtered = filteredEntries(filter, query);
  const grid = document.getElementById("landing-grid");
  const countEl = document.getElementById("result-count");
  if (grid) {
    grid.classList.add("is-refreshing");
    requestAnimationFrame(() => {
      grid.innerHTML = filtered.length
        ? filtered.map(browseCardHTML).join("")
        : `<p class="empty-state">No entries match “${escapeHtml(query)}”.</p>`;
      grid.classList.remove("is-refreshing");
    });
  }
  if (countEl) countEl.textContent = `${filtered.length} entries`;
}

function wireBrowse(params) {
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      const next = new URLSearchParams(params);
      const f = tab.dataset.filter;
      if (f === "all") next.delete("filter");
      else next.set("filter", f);
      const input = document.getElementById("browse-search");
      if (input?.value.trim()) next.set("q", input.value.trim());
      else next.delete("q");
      const q = next.toString();
      location.hash = q ? `#/browse?${q}` : "#/browse";
    });
  });
  const input = document.getElementById("browse-search");
  if (!input) return;
  input.addEventListener("input", () => {
    const filter = params.get("filter") || "all";
    paintBrowseGrid(filter, input.value.trim());
  });
}

function relationshipsHTML(relationships) {
  if (!relationships?.length) return "";
  const relByType = {};
  relationships.forEach(r => {
    relByType[r.type] = relByType[r.type] || [];
    relByType[r.type].push(r.target);
  });
  const items = Object.entries(relByType).flatMap(([type, targets]) =>
    targets.map(t => `<li><span class="rel-type">${cap(type)}</span>${linkToEntry(t)}</li>`)
  ).join("");
  return `<div class="sidebar-block"><h3>Relationships</h3><ul class="rel-list">${items}</ul></div>`;
}

async function renderCharacter(id) {
  const d = await loadEntry(id);
  document.title = `${d.name}, Mythologica`;
  const altName = d.alt_names?.[0] ? `<div class="alt-name">${escapeHtml(d.alt_names[0])}</div>` : "";
  const symbols = (d.symbols || []).map(s => `<span class="symbol-tag">${escapeHtml(s)}</span>`).join("");
  const eventsHTML = (d.related_events || [])
    .map(e => `<li>${linkToEntry(e)}</li>`).join("");
  const sourcesHTML = (d.sources || []).map(s => `<li>${escapeHtml(s)}</li>`).join("");
  const achievementsHTML = (d.achievements || []).map(a => `<li>${escapeHtml(a)}</li>`).join("");
  const initial = (d.name || "?").charAt(0);

  // Check for image path in JSON
  const imageSrc = d.image || d.image_url;
  const portraitHTML = imageSrc
    ? `<img class="portrait-img foreground-image" src="${escapeHtml(imageSrc)}" alt="${escapeHtml(d.name)}" />`
    : `<span>${escapeHtml(initial)}</span>`;

  const quoteHTML = d.signature_quote?.text
  ? `<div class="quote-block">
       <p>"${escapeHtml(d.signature_quote.text)}"</p>
       ${d.signature_quote.note ? `<div class="quote-note">${escapeHtml(d.signature_quote.note)}</div>` : ""}
     </div>`
  : "";

    
    


  return `
    <div class="crumb"><a href="#/" data-nav>Home</a> / <a href="#/browse" data-nav>Greek</a> / <a href="#/browse?filter=${d.category}" data-nav>${categoryLabel(d.category)}</a> / ${escapeHtml(d.name)}</div>
    <div class="page">
      <div class="hero">
        <div class="portrait">${portraitHTML}</div>
        <div class="hero-text">
          <div class="domain-label">${categoryLabel(d.category)}, ${escapeHtml(d.domain_role || "")}</div>
          <h1 class="title">${escapeHtml(d.name)}</h1>
          ${altName}
          <div class="oxide-rule"></div>
          <p class="summary">${escapeHtml(d.summary)}</p>
          <h3>Symbols</h3>
          <div class="symbols">${symbols}</div>
          ${quoteHTML}
        </div>
      </div>
         
      <div class="content">
        <aside class="sidebar">
          ${relationshipsHTML(d.relationships)}
          ${eventsHTML ? `<div class="sidebar-block"><h3>Related Events</h3><ul class="rel-list">${eventsHTML}</ul></div>` : ""}
          ${sourcesHTML ? `<div class="sidebar-block"><h3>Sources</h3><ul class="sources-list">${sourcesHTML}</ul></div>` : ""}
        </aside>
        <main class="main">
          <details class="content-drawer" open><summary>Origin</summary><p>${escapeHtml(d.origin_story || "")}</p></details>
          ${achievementsHTML ? `<details class="content-drawer" open><summary>Achievements</summary><ul class="achievements">${achievementsHTML}</ul></details>` : ""}
        </main>
      </div>
    </div>`;
}

async function renderEvent(id) {
  const d = await loadEntry(id);
  document.title = `${d.title}, Mythologica`;
  const phasesHTML = (d.phases || []).map(p =>
    `<li><span class="phase-title">${escapeHtml(p.title)}</span>${escapeHtml(p.description)}</li>`).join("");
  const charsHTML = (d.characters_involved || []).map(c => `<li>${linkToEntry(c)}</li>`).join("");
  const sourcesHTML = (d.sources || []).map(s => `<li>${escapeHtml(s)}</li>`).join("");
  const landscapeImage = d.image_landscape
    ? `<img class="foreground-image" src="${escapeHtml(d.image_landscape)}" alt="${escapeHtml(d.title)}">`
    : `<span>Landscape image space</span>`;
  const portraitImage = d.image_portrait
    ? `<img class="foreground-image" src="${escapeHtml(d.image_portrait)}" alt="${escapeHtml(d.title)}">`
    : `<span>Portrait image space</span>`;
  return `
    <div class="crumb"><a href="#/" data-nav>Home</a> / <a href="#/browse" data-nav>Greek</a> / <a href="#/browse?filter=event" data-nav>Events</a> / ${escapeHtml(d.title)}</div>
    <div class="page">
      <div class="media-intro">
        <div class="hero-text">
          <div class="domain-label">Event</div>
          <h1 class="title">${escapeHtml(d.title)}</h1>
          <div class="oxide-rule"></div>
          <p class="summary">${escapeHtml(d.summary)}</p>
        </div>
        <div class="landscape-slot">${landscapeImage}</div>
      </div>
      <div class="content">
        <aside class="sidebar">
          ${charsHTML ? `<div class="sidebar-block"><h3>Characters Involved</h3><ul class="rel-list">${charsHTML}</ul></div>` : ""}
          ${sourcesHTML ? `<div class="sidebar-block"><h3>Sources</h3><ul class="sources-list">${sourcesHTML}</ul></div>` : ""}
          <div class="portrait-slot">${portraitImage}</div>
        </aside>
        <main class="main">
          <details class="content-drawer" open><summary>Timeline</summary><ol class="phase-list">${phasesHTML}</ol></details>
        </main>
      </div>
    </div>`;
}

async function renderTopic(id) {
  const d = await loadEntry(id);
  document.title = `${d.title} — Mythologica`;
  const aspectsHTML = (d.key_aspects || []).map(a =>
    `<div class="aspect"><h3>${escapeHtml(a.title)}</h3><p>${linkifyAspect(a.description)}</p></div>`).join("");
  const deitiesHTML = (d.related_deities || []).map(c => `<li>${linkToEntry(c)}</li>`).join("");
  const sourcesHTML = (d.sources || []).map(s => `<li>${escapeHtml(s)}</li>`).join("");
  const landscapeImage = d.image_landscape
    ? `<img class="foreground-image" src="${escapeHtml(d.image_landscape)}" alt="${escapeHtml(d.title)}">`
    : `<span>Landscape image space</span>`;
  const portraitImage = d.image_portrait
    ? `<img class="foreground-image" src="${escapeHtml(d.image_portrait)}" alt="${escapeHtml(d.title)}">`
    : `<span>Portrait image space</span>`;
  return `
    <div class="crumb"><a href="#/" data-nav>Home</a> / <a href="#/browse" data-nav>Greek</a> / <a href="#/browse?filter=religion" data-nav>Religion & Practice</a> / ${escapeHtml(d.title)}</div>
    <div class="page">
      <div class="media-intro">
        <div class="hero-text">
          <div class="domain-label">Religion & Practice</div>
          <h1 class="title">${escapeHtml(d.title)}</h1>
          <div class="oxide-rule"></div>
          <p class="summary">${escapeHtml(d.summary)}</p>
        </div>
        <div class="landscape-slot">${landscapeImage}</div>
      </div>
      <div class="content">
        <aside class="sidebar">
          ${deitiesHTML ? `<div class="sidebar-block"><h3>Related Deities</h3><ul class="rel-list">${deitiesHTML}</ul></div>` : ""}
          ${sourcesHTML ? `<div class="sidebar-block"><h3>Sources</h3><ul class="sources-list">${sourcesHTML}</ul></div>` : ""}
          <div class="portrait-slot">${portraitImage}</div>
        </aside>
        <main class="main">${aspectsHTML.replace(/<div class="aspect">/g, '<details class="content-drawer aspect"><summary>').replace(/<\/h3><p>/g, '</summary><p>').replace(/<\/p><\/div>/g, '</p></details>')}</main>
      </div>
    </div>`;
}

function renderNotFound(kind, id) {
  document.title = "Not found, Mythologica";
  return `
    <div class="page">
      <h1 class="title">No page for ${escapeHtml(id)}</h1>
      <p class="summary">That ${kind} is not in the JSON collection yet. Names that appear as italic text on other pages are mentioned in the source files but do not have their own entry.</p>
      <p><a href="#/browse" data-nav>Back to the collection</a></p>
    </div>`;
}

function setNavActive(route) {
  const filter = route.parts[0] === "browse" ? (route.params.get("filter") || "") : "";
  document.querySelectorAll(".nav-links a").forEach(a => {
    const f = a.dataset.navFilter;
    a.classList.toggle("active", Boolean(f && f === filter));
  });
}

function wireHomeTilt() {
  const hero = document.querySelector(".home-hero");
  const image = document.querySelector("[data-tilt-image]");
  if (!hero || !image || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  hero.addEventListener("pointermove", event => {
    const bounds = hero.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    image.style.setProperty("--image-tilt-x", `${(y * -7).toFixed(2)}deg`);
    image.style.setProperty("--image-tilt-y", `${(x * 7).toFixed(2)}deg`);
  });
  hero.addEventListener("pointerleave", () => {
    image.style.setProperty("--image-tilt-x", "0deg");
    image.style.setProperty("--image-tilt-y", "0deg");
  });
}

function wireHomeReveals() {
  const elements = document.querySelectorAll(".home-reveal");
  if (!elements.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    elements.forEach(element => element.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  elements.forEach(element => observer.observe(element));
}

function wireContentImages() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.querySelectorAll(".portrait, .landscape-slot, .portrait-slot").forEach(frame => {
    const image = frame.querySelector(".foreground-image");
    if (!image) return;
    frame.addEventListener("pointermove", event => {
      const bounds = frame.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      image.style.setProperty("--portrait-tilt-x", `${(y * -4).toFixed(2)}deg`);
      image.style.setProperty("--portrait-tilt-y", `${(x * 4).toFixed(2)}deg`);
    });
    frame.addEventListener("pointerleave", () => {
      image.style.setProperty("--portrait-tilt-x", "0deg");
      image.style.setProperty("--portrait-tilt-y", "0deg");
    });
  });
}

function wireGreekBrowseImage() {
  const frame = document.querySelector(".greek-browse-hero");
  const image = frame?.querySelector(".greek-browse-image");
  if (!frame || !image || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  frame.addEventListener("pointermove", event => {
    const bounds = frame.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    image.style.setProperty("--portrait-tilt-x", `${(y * -4).toFixed(2)}deg`);
    image.style.setProperty("--portrait-tilt-y", `${(x * 4).toFixed(2)}deg`);
  });
  frame.addEventListener("pointerleave", () => {
    image.style.setProperty("--portrait-tilt-x", "0deg");
    image.style.setProperty("--portrait-tilt-y", "0deg");
  });
}

async function renderRoute() {
  const hash = location.hash || "#/";
  if (hash === currentHash && viewEl().innerHTML) return;
  currentHash = hash;
  const gen = ++renderGen;
  const route = parseRoute();
  setNavActive(route);

  const root = viewEl();

  try {
    await ensureCatalog();
    if (gen !== renderGen) return;
    const { parts, params } = route;
    let html;
    if (parts.length === 0) {
      document.title = "Mythologica, A Greek Mythology Encyclopedia";
      html = renderHome();
    } else if (parts[0] === "browse") {
      document.title = "Greek Mythology, Mythologica";
      html = renderBrowse(params);
    } else if (parts[0] === "character" && parts[1]) {
      html = catalog.byId.has(parts[1]) ? await renderCharacter(parts[1]) : renderNotFound("character", parts[1]);
    } else if (parts[0] === "event" && parts[1]) {
      html = catalog.byId.has(parts[1]) ? await renderEvent(parts[1]) : renderNotFound("event", parts[1]);
    } else if (parts[0] === "topic" && parts[1]) {
      html = catalog.byId.has(parts[1]) ? await renderTopic(parts[1]) : renderNotFound("topic", parts[1]);
    } else {
      html = renderNotFound("page", parts.join("/"));
    }
    if (gen !== renderGen) return;
    root.innerHTML = html;
    root.classList.remove("is-leaving");
    root.classList.add("is-entering");
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (parts.length === 0) wireHomeTilt();
    if (parts.length === 0) {
      wireHomeReveals();
    }
    if (parts[0] === "browse") wireBrowse(params);
    if (["character", "event", "topic"].includes(parts[0])) wireContentImages();
    if (parts[0] === "browse") wireGreekBrowseImage();
    requestAnimationFrame(() => {
      if (gen === renderGen) root.classList.remove("is-entering");
    });
  } catch (err) {
    if (gen !== renderGen) return;
    root.classList.remove("is-leaving");
    root.innerHTML = `<div class="page"><p>${escapeHtml(err.message)}</p></div>`;
    showBootError(err.message);
  }
}

function showBootError(message) {
  const el = document.getElementById("boot-error");
  if (!el) return;
  el.hidden = false;
  el.textContent = message;
}

function migrateLegacyUrl() {
  const file = location.pathname.split("/").pop();
  const id = new URLSearchParams(location.search).get("id");
  const filter = new URLSearchParams(location.search).get("filter");
  const q = new URLSearchParams(location.search).get("q");
  if (file === "character.html" && id) location.replace(`index.html#/character/${id}`);
  else if (file === "event.html" && id) location.replace(`index.html#/event/${id}`);
  else if (file === "topic.html" && id) location.replace(`index.html#/topic/${id}`);
  else if (file === "greek.html") {
    const next = new URLSearchParams();
    if (filter) next.set("filter", filter);
    if (q) next.set("q", q);
    const qs = next.toString();
    location.replace(`index.html#/browse${qs ? "?" + qs : ""}`);
  }
}

function onNavClick(e) {
  const a = e.target.closest("a[data-nav]");
  if (!a) return;
  const href = a.getAttribute("href");
  if (!href || !href.startsWith("#")) return;
  e.preventDefault();
  if (location.hash === href) renderRoute();
  else location.hash = href;
  closeSearch();
}

/* ---------- Search overlay ---------- */
function searchHits(query) {
  const q = query.toLowerCase().trim();
  if (!q) return catalog.greek.slice(0, 8);
  return catalog.greek.filter(e =>
    e.title.toLowerCase().includes(q) ||
    e.summary.toLowerCase().includes(q) ||
    e.category.toLowerCase().includes(q)
  );
}

function drawSearchResults(query) {
  const box = document.getElementById("search-results");
  const hits = searchHits(query);
  if (!hits.length) {
    box.innerHTML = `<p class="empty-state">No entries match “${escapeHtml(query)}”.</p>`;
    return;
  }
  box.innerHTML = hits.map(e => `
    <a class="search-hit" href="${hrefFor(e)}" data-nav>
      <div class="cat-label">${categoryLabel(e.category).toUpperCase()}</div>
      <h3>${escapeHtml(e.title)}</h3>
      <p>${escapeHtml(e.summary)}</p>
    </a>`).join("");
}

function openSearch() {
  const overlay = document.getElementById("search-overlay");
  overlay.hidden = false;
  const field = document.getElementById("search-field");
  field.value = "";
  drawSearchResults("");
  field.focus();
}

function closeSearch() {
  const overlay = document.getElementById("search-overlay");
  if (overlay) overlay.hidden = true;
}

function updateReadingProgress() {
  const progress = document.getElementById("reading-progress");
  const backToTop = document.getElementById("back-to-top");
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  if (progress) progress.style.width = `${percent}%`;
  if (backToTop) backToTop.classList.toggle("is-visible", window.scrollY > 420);
}

function wireChrome() {
  document.addEventListener("click", onNavClick);
  document.getElementById("search-toggle")?.addEventListener("click", openSearch);
  document.getElementById("search-close")?.addEventListener("click", closeSearch);
  document.getElementById("search-overlay")?.addEventListener("click", e => {
    if (e.target.id === "search-overlay") closeSearch();
  });
  document.getElementById("search-field")?.addEventListener("input", e => drawSearchResults(e.target.value));
  document.getElementById("search-field")?.addEventListener("keydown", e => {
    if (e.key === "Escape") closeSearch();
    if (e.key === "Enter") {
      const first = document.querySelector("#search-results a");
      if (first) first.click();
    }
  });
  document.addEventListener("keydown", e => {
    if (e.key === "/" && !e.target.closest("input, textarea")) {
      e.preventDefault();
      openSearch();
    }
    if (e.key === "Escape") closeSearch();
  });
  window.addEventListener("hashchange", renderRoute);
  window.addEventListener("scroll", updateReadingProgress, { passive: true });
  document.getElementById("back-to-top")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  updateReadingProgress();
}

migrateLegacyUrl();
wireChrome();
if (!location.hash) location.hash = "#/";
renderRoute();
