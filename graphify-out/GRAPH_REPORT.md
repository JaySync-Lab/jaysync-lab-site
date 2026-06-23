# Graph Report - .  (2026-06-22)

## Corpus Check
- Corpus is ~8,659 words - fits in a single context window. You may not need a graph.

## Summary
- 176 nodes · 272 edges · 12 communities (10 shown, 2 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 25 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Package & Build Dependencies|Package & Build Dependencies]]
- [[_COMMUNITY_Motion & Animation System|Motion & Animation System]]
- [[_COMMUNITY_VMID Band Visualization|VMID Band Visualization]]
- [[_COMMUNITY_Root Layout & Fonts|Root Layout & Fonts]]
- [[_COMMUNITY_Interactive UI Components|Interactive UI Components]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Uptime Kuma Status Monitor|Uptime Kuma Status Monitor]]
- [[_COMMUNITY_Docs Routing & Source|Docs Routing & Source]]
- [[_COMMUNITY_Fumadocs Build Pipeline|Fumadocs Build Pipeline]]
- [[_COMMUNITY_Changelog System|Changelog System]]
- [[_COMMUNITY_Dev Launch Config|Dev Launch Config]]
- [[_COMMUNITY_Claude Settings|Claude Settings]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `fadeUp` - 14 edges
3. `ServiceNode` - 12 edges
4. `stagger` - 9 edges
5. `getInventory()` - 8 edges
6. `PageHeader()` - 7 edges
7. `SectionReveal()` - 7 edges
8. `SiteLayout()` - 6 edges
9. `Hero()` - 6 edges
10. `ServiceCard()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Uptime Kuma Alert Email Template` --conceptually_related_to--> `ServiceNode`  [INFERRED]
  content/templates/uptime-kuma-alert.html → src/lib/inventory.ts
- `ServiceCard()` --semantically_similar_to--> `SectionPreviewCards()`  [INFERRED] [semantically similar]
  src/components/site/ServiceCard.tsx → src/components/site/SectionPreviewCards.tsx
- `Package Manifest (jaysync-lab-site)` --references--> `Fumadocs MDX Documentation System`  [EXTRACTED]
  package.json → next.config.ts
- `DocsPage (catch-all slug)` --implements--> `Fumadocs MDX Documentation System`  [EXTRACTED]
  src/app/docs/[[...slug]]/page.tsx → next.config.ts
- `DocsLayout` --implements--> `Fumadocs MDX Documentation System`  [EXTRACTED]
  src/app/docs/layout.tsx → next.config.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Site Route Pages Group (Home, Services, Architecture, Changelog)** — site_page_homepage, site_services_servicespage, site_architecture_architecturepage, site_changelog_changelogpage [INFERRED 0.95]
- **Fumadocs MDX Build & Runtime System** — next_config, source_config, docs_layout_docslayout, slug_page_docspage [EXTRACTED 1.00]
- **VMID Band Visualization Flow (Architecture Page + VmidBandDiagram + Concept)** — site_architecture_architecturepage, components_vmidband_vmidbanddiagram, concept_vmid_band_system [INFERRED 0.95]
- **Shared Motion Variant System (fadeUp, stagger, wordReveal used across site components)** — lib_motion_fadeup, lib_motion_stagger, lib_motion_wordreveal, site_hero_hero, site_pageheader_pageheader, site_sectionreveal_sectionreveal, site_timeline_timeline, site_servicecard_servicecard, site_sectionpreviewcards_sectionpreviewcards [EXTRACTED 1.00]
- **Inventory Data Pipeline (YAML → getInventory → ServiceNode → NodeConstellation/ServiceCard)** — lib_inventory_getinventory, lib_inventory_servicenode, site_nodeconstellation_nodeconstellation, site_servicecard_servicecard [EXTRACTED 1.00]
- **Reduced Motion Accessibility Pattern across animated components** — concept_reduced_motion_accessibility, site_counter_counter, site_nodeconstellation_nodeconstellation, lib_motion_fadeup [INFERRED 0.85]

## Communities (12 total, 2 thin omitted)

### Community 0 - "Package & Build Dependencies"
Cohesion: 0.07
Nodes (27): dependencies, fumadocs-core, fumadocs-mdx, fumadocs-ui, js-yaml, lucide-react, motion, next (+19 more)

### Community 1 - "Motion & Animation System"
Cohesion: 0.16
Nodes (19): metadata, CSS Keyframe Animation (No JS), easeOut, fadeIn, fadeUp, spring, springScale, stagger (+11 more)

### Community 2 - "VMID Band Visualization"
Cohesion: 0.15
Nodes (20): ArchitecturePage(), BAND_COLORS, Props, VmidBandDiagram(), VMID Banding Scheme, getBands(), getInventory(), getNodes() (+12 more)

### Community 3 - "Root Layout & Fonts"
Cohesion: 0.14
Nodes (15): inter, metadata, mono, RootLayout(), VmidBandDiagram, Homelab Topology (Proxmox + ZTE + Tailscale), Scroll-Aware Navigation Glass Effect, VMID Band Partitioning (100-199) (+7 more)

### Community 4 - "Interactive UI Components"
Cohesion: 0.15
Nodes (13): Reduced Motion Accessibility Pattern, Counter(), Props, CENTER, NODE_COLOR, NodeConstellation(), ORBIT, Props (+5 more)

### Community 5 - "TypeScript Config"
Cohesion: 0.12
Nodes (17): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+9 more)

### Community 6 - "Uptime Kuma Status Monitor"
Cohesion: 0.21
Nodes (11): DOT, fetchMonitorStatus(), HeartbeatEntry, HeartbeatResponse, MonitorEntry, Props, StatusBadge(), StatusPageResponse (+3 more)

### Community 7 - "Docs Routing & Source"
Cohesion: 0.20
Nodes (4): source, Props, exclude, include

### Community 8 - "Fumadocs Build Pipeline"
Cohesion: 0.18
Nodes (8): Fumadocs MDX Documentation System, DocsLayout, nextConfig, withMDX, Package Manifest (jaysync-lab-site), config, DocsPage (catch-all slug), { docs, meta }

### Community 9 - "Changelog System"
Cohesion: 0.44
Nodes (6): ChangelogPage(), metadata, ChangelogEntry, getChangelog(), Props, Timeline()

## Knowledge Gaps
- **83 isolated node(s):** `withMDX`, `nextConfig`, `name`, `version`, `private` (+78 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `HomePage()` connect `Root Layout & Fonts` to `VMID Band Visualization`, `Interactive UI Components`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Why does `fadeUp` connect `Motion & Animation System` to `Changelog System`, `VMID Band Visualization`, `Interactive UI Components`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **What connects `withMDX`, `nextConfig`, `name` to the rest of the system?**
  _85 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Package & Build Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._
- **Should `Root Layout & Fonts` be split into smaller, more focused modules?**
  _Cohesion score 0.1437908496732026 - nodes in this community are weakly interconnected._
- **Should `Interactive UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.14705882352941177 - nodes in this community are weakly interconnected._
- **Should `TypeScript Config` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._