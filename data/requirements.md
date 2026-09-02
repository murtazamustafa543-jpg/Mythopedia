# Mythology Encyclopedia — Requirements Document (v1.0 — finalized)

> All open questions are resolved. This is the settled scope for Phase 1 (Greek). Future phases (Islamic, possibly Hindu) are noted but not yet started.

## 1. Project Overview

A web-based encyclopedia of world mythologies, starting with **Greek mythology and religion** in full depth, with Islamic (and possibly Hindu) planned as future phases. Covers gods, heroes, characters, their relationships, achievements, and historical/cultural context. The site combines curated reference content with an AI assistant that can answer free-form questions about any character, grounded strictly in the site's own content.

**Working name:** [TBD]

## 2. Goals

- Present mythological and historical information in a visually rich, professional, and engaging way (not a plain wiki).
- Let users explore by mythology, category, or search.
- Show relationships between characters (family trees, alliances, rivalries).
- Let users ask an LLM follow-up questions about a character while viewing their page.
- Be easy to expand with new mythologies/characters over time.

## 3. Target Mythologies

**Phase 1 (build focus): Greek mythology — and also Greek religion.** Full depth here first before expanding elsewhere. Better to get one mythology fully right than three half-built. Scope now includes:
- **Greek mythology:** gods, heroes, creatures, myths, relationships, signature quotes.
- **Greek religion:** ancient Greek religious practice itself — worship, temples, priesthood, oracles (e.g. Delphi), festivals, rituals, and how mythology and lived religion connected in ancient Greek society. This sits alongside the mythology content as its own sub-category (see Section 4.2) rather than being folded into individual god/hero pages.

**Later phases (not started yet, scope stays reserved for when we get there):**
- Islamic history — historical/religious figures, centered on the era of the Prophet Muhammad, other significant religious figures, and the major Caliphates. Note: this is history/biography rather than "mythology" in the traditional sense, since Islam is a living religion — content here should stay factual, well-sourced, and respectful in tone.
- Hindu mythology — gods and major mythological events.

The site structure (Section 4 onward) is designed to support multiple mythologies from the start, so adding Islamic and Hindu later is a content/theming exercise, not a rebuild — but no work happens on them until Greek is solid.

## 4. Core Site Structure

### 4.1 Home Page
- Hero/banner section introducing the site
- Featured/highlighted characters (rotating)
- Quick links into each mythology
- Global search bar

### 4.2 Category / Mythology Pages
- One landing page per mythology (Greek, Islamic, Hindu, ...)
- Sub-categories, e.g.:
  - Gods / Deities
  - Heroes
  - Creatures / Beings
  - **Events / Myths** (new — for stories that span multiple characters and don't belong to just one profile: e.g. the Trojan War, Odysseus's journey home (the Odyssey), the quest for the Golden Fleece. These get their own page, and link out to the characters involved — which link back in via a "Related Events" section on the character's profile.)
  - **Religion & Practice** (worship, temples, priesthood, oracles, festivals, rituals; content pages rather than character profiles, since these are practices/places/institutions, not people)
  - Historical figures / events (if included — see 3 above)
  - Places / Realms
- Grid or gallery layout with imagery

### 4.3 Character Profile Page
Each character page includes:
- Name (+ alternate names/spellings)
- Portrait / representative image
- Short summary
- Domain / role / titles
- Origin story
- Key achievements / myths / events
- Relationships (parents, siblings, spouses, children, allies, rivals) — listed as clickable links; clicking a related character navigates straight to their profile (no visual tree/graph needed)
- Symbols / associated animals, objects
- A signature quote attributed to the character (where one genuinely exists/is well documented — see note in Section 7)
- Historical or cultural context
- Sources / references
- "Ask about [Character]" — LLM Q&A box (see Section 6)

### 4.4 Search
- Global search across all mythologies
- Filters: by mythology, by category (god/hero/creature/etc.), by relationship
- **[TBD]** — Autocomplete? Search by attribute (e.g. "gods of war" across mythologies)?

### 4.5 Relationships View
- No family-tree diagram. Instead, relationships are shown as a simple list on each character's profile (e.g. "Father: Zeus", "Sibling: Athena"), each one a clickable link that takes the user to that character's page — so users browse the mythology by following connections rather than looking at a graph.

## 5. UI / UX Direction

- **Overall style:** Professional, elegant, minimal-but-rich — clean grid layouts, generous white space, strong typography, refined color palette, precise/orderly structure with clear visual hierarchy (the "German" reference). Confirmed direction.
- **Per-mythology theming:** since Phase 1 is Greek-only, we focus entirely on nailing the Greek theme first: marble, stone, and gold-leaf tones; classical serif typography; sculpture/pottery-inspired imagery — mature, museum-grade, not cartoonish. The Islamic and Hindu theme directions noted below stay reserved for when those phases start, so the overall design system already anticipates them, but no design work happens there yet:
  - *(later)* Islamic: geometric pattern work, calligraphy-inspired typographic accents, deep blues/greens/gold — used tastefully as design motifs, not religious symbolism.
  - *(later)* Hindu: rich warm palette (deep reds, saffron, gold), motifs from temple architecture and classical Indian art, restrained and premium.
- **Imagery-forward:** each character/category is a visual entry point, not just a text block.
- Responsive (desktop + mobile).
- **No dark mode.** Just the one well-crafted themed light mode per mythology described above.

## 6. LLM Integration

- On each character page, a chat/ask box lets users ask free-form questions about that character.
- **Confirmed:** answers are grounded strictly in the site's own curated content for that character (and possibly related characters), not the LLM's open general knowledge. This keeps answers consistent with what's published on the page and avoids contradicting the site's own content.
- Implementation implication: the character's full profile (and relevant related-character data) gets injected into the LLM's context automatically, and the LLM is instructed to answer only from that material — saying it doesn't know rather than guessing if the answer isn't in the provided content.
- **Confirmed: limited usage.** A small cap per visitor per character (e.g. 2 questions per character per session) rather than unlimited chatting. Exact number is easy to tune later — starting at 2 is a reasonable default.
- **Confirmed LLM provider: Google Gemini API, free tier.** No credit card required to start. Free tier gives Gemini 2.5 Flash at 10 requests/minute and 250 requests/day (or Flash-Lite at 15 RPM / 1,000 RPD if we want more headroom), which comfortably covers a personal/small-audience site at the usage cap above. One thing to keep in mind: enabling billing later on the same Google Cloud project removes the free tier entirely for that project, so if we ever want a paid tier as backup, it should be a separate project rather than upgrading this one.

## 7. Content Model (Data Structure) — Preliminary

Each character entry will likely need structured fields:
```
- id
- name / alt names
- mythology (Greek / Islamic / Hindu / ...)
- category (god / hero / creature / historical figure / ...)
- summary
- domain/role
- image(s)
- origin_story
- achievements[]
- relationships[] (type: parent/sibling/spouse/child/ally/rival, target: character id)
- symbols[]
- signature_quote (a well-documented quote or saying attributed to the character, shown on their profile — e.g. a famous line attributed to a Greek god or hero in the myths. Only included where one genuinely and reliably exists — not invented. For later phases: for the Prophet Muhammad this could be a well-known Hadith. **Confirmed.**)
- sources[]
```
**Confirmed sourcing approach:** content will be researched and compiled from multiple reputable sources across the internet (encyclopedic, academic, and cultural references), rather than being fully hand-written from scratch or fully AI-generated. Fact-checking and citing sources per character (the `sources[]` field) will matter, especially for the Islamic history section given its sensitivity — this applies to signature quotes too, since misattributed Hadith or quotes are a real risk and each one should be traceable to a source.

**Events entry** (new — separate schema, since an event spans multiple characters rather than belonging to one):
```
- id
- title (e.g. "The Trojan War", "The Odyssey")
- mythology (Greek / ...)
- summary
- timeline / phases[] (key stages of the event, e.g. for the Odyssey: departure from Troy, the Cyclops, Circe, the Underworld, return to Ithaca)
- characters_involved[] (links to character ids — shows up bidirectionally, so e.g. Odysseus's profile shows "Related Events: The Odyssey")
- image(s)
- sources[]
```

**Religion & Practice entry** (new — for the topic-level content under that sub-category, e.g. "Ancient Greek Religion" as a whole, or a specific temple/oracle/festival):
```
- id
- title (e.g. "Ancient Greek Religion", "The Oracle of Delphi")
- mythology (Greek / ...)
- summary
- key_aspects[] (title + description pairs — e.g. worship & sacrifice, temples & priesthood, oracles, festivals)
- related_deities[] (links to relevant god/character ids)
- image(s)
- sources[]
```

## 8. Technical Notes (high-level only — no build yet)

You said you want this to stay mostly front end, with as little backend hassle as possible. Here's the recommended approach:

- **Front end:** Plain HTML/CSS/JavaScript (no heavy framework needed). Keeps things simple to understand, edit, and host. If the site grows large and you want reusable components later, we can revisit React — but it's not required to start.
- **Content storage:** Static JSON files (one per character, or one per mythology) sitting alongside the site. No database needed — this fits a content set that you (and I) curate/update directly, rather than something users edit live. Easy to host anywhere (e.g. GitHub Pages, Netlify, Vercel) for free or near-free.
- **The one unavoidable bit of "backend":** the LLM Q&A feature needs a Gemini API key, and API keys can't safely live in front-end code (anyone could view-source and steal it). This requires one small serverless function (a single file, not a full backend server) that sits between the page and the Gemini API — it receives the question + character context, calls Gemini, and returns the answer. Services like Vercel or Netlify let you deploy this as part of the same project, with no server to manage. This also gives you a natural place to enforce the "2 questions per character" limit from Section 6.
- **Image sourcing — confirmed approach:** a mix of AI-generated images (for a consistent, custom look matching the Greek marble/gold theme) and images found via Google. One flag worth knowing before we build: directly linking to images found on Google (hotlinking) is unreliable — links break when the source site changes, and reusing copyrighted images publicly can be a legal risk even if just linked. Better approach: download/generate the images and host them yourself as part of the site, and stick to sources that are actually free to reuse (public domain art, museum open-access collections, or your own AI-generated art) rather than hotlinking random search results. We can sort out the exact image for each character as we build out content in step 7.

This keeps ~95% of the project as plain front-end work, with one small, contained serverless piece just for the AI feature.

## 9. Open Questions Summary

All open questions resolved. Islamic mythology/history is a likely future phase (Hindu less certain), but no work starts on either until Greek is fully built — see Section 3 and the roadmap in Section 11.

### Resolved
- Mythology scope: Phase 1 = Greek mythology **and** Greek religion. Islamic likely a future phase; Hindu possible.
- Relationships shown as clickable links, not a visual family tree.
- Per-mythology theming confirmed, Greek direction locked in Section 5.
- LLM answers restricted strictly to the site's own content, capped at ~2 questions per character per session.
- Content will be researched/compiled from multiple online sources, with citations.
- Signature quote field confirmed.
- No dark mode.
- No accounts, no comments.
- Tech stack: plain HTML/CSS/JS front end, static JSON content, one small serverless function just for the LLM feature.
- Images: a mix of **AI-generated images** (you mentioned tools like Gemini) for original character/scene art, and **Google Images links** for reference where useful. Note: AI-generated images are fine to use freely since we control the output; anything pulled from Google Images should be checked for usage rights before publishing, since search results aren't automatically free to reuse — worth a quick pass on this once we're actually picking images.
- Scope addition: **Greek religion** included alongside Greek mythology — worship, temples, priesthood, oracles, festivals, rituals — as its own sub-category (Section 4.2).

## 10. Out of Scope (for now)

- No code, wireframes, or implementation yet — this document only.
- **Confirmed: no user accounts / login.**
- **Confirmed: no comments or user-submitted content.**

## 11. Proposed Step-by-Step Plan

Once this document is finalized, here's the rough order we'd work in — each step produces something you can see/review before moving to the next:

1. **This requirements doc is finalized** — starting point for step 2.
2. **Content model + first sample entries** — lock the exact JSON structures from Section 7 (character + event), then fill them in for a small starter set to prove the structure works before we write content at scale. Proposed 5–6 to start:
   - Zeus (god)
   - Athena (god)
   - Hercules (hero)
   - Odysseus (hero)
   - The Trojan War (event)
   - The Odyssey (event)
   
   Not building anything else beyond this set yet — just enough to test the templates and see how character pages and event pages link to each other.
3. **Visual design direction** — before touching layout code, we mock up the look and feel: the shared "mature/museum" base style plus the Greek theme from Section 5, so you can react to actual visuals rather than descriptions.
4. **Static page templates** — build the Home page, the Greek mythology landing page, and a Character profile page as working HTML/CSS using the sample characters from step 2. This is the first "real" version of the site, just without search or AI yet.
5. **Search** — add search/filter functionality across Greek characters.
6. **LLM Q&A feature** — add the serverless function and the "Ask about [Character]" box, grounded in the character's content, with the usage cap.
7. **Content buildout** — once the template and features are proven, scale up: research and add the full roster of Greek gods, heroes, and figures.
8. **Polish + launch prep** — responsive/mobile pass, image licensing check, final QA.
9. **(Future) Expand to Islamic, and possibly Hindu** — once Greek is fully built and you're happy with it, repeat steps 2–7 using the same site structure. Islamic is the more likely next mythology based on where things stand now.
10. **"Greek Philosophy & the Soul" split** — done. See `greek-philosophy-and-religion.json`, separated out of the main `greek-religion` entry.

**Content status as of this point:** 24 sample entries built — the full Twelve Olympians (Zeus, Hera, Poseidon, Demeter, Athena, Ares, Apollo, Artemis, Aphrodite, Hephaestus, Hermes, Dionysus), 2 heroes (Hercules, Odysseus), 2 events (Trojan War, Odyssey), and 8 Religion & Practice topic pages (Greek Religion overview, Philosophy & Religion, Minor Deities & Creatures, Temples & Sanctuaries, Oracles & Divination, Festivals, Death & Afterlife, Extent of Hellenic Culture). This is now well past "sample content" and close to a real first content pass for Greek — worth pausing here to build the actual page templates (Step 4) before adding more entries, so we can see how this volume of content actually looks and behaves on a page.

We can reorder this (e.g. see visuals before locking the content model) if you'd prefer — just say so.

---
*Next step: confirm the 2 remaining open questions, then we start step 1 of the plan above.*
