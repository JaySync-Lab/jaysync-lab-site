# Graph Report - .  (2026-07-12)

## Corpus Check
- Corpus is ~21,890 words - fits in a single context window. You may not need a graph.

## Summary
- 339 nodes · 480 edges · 20 communities (16 shown, 4 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.84)
- Token cost: 137,166 input · 29,476 output

## Community Hubs (Navigation)
- [[_COMMUNITY_CLAUDE.md Conventions & Gotchas|CLAUDE.md Conventions & Gotchas]]
- [[_COMMUNITY_App Layout & Branding|App Layout & Branding]]
- [[_COMMUNITY_Changelog & Motion Utilities|Changelog & Motion Utilities]]
- [[_COMMUNITY_Loading Link & Docs Hero Components|Loading Link & Docs Hero Components]]
- [[_COMMUNITY_Dependencies (Fumadocs, Tailwind)|Dependencies (Fumadocs, Tailwind)]]
- [[_COMMUNITY_Live Status Badge (Uptime Kuma)|Live Status Badge (Uptime Kuma)]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Hardware & Storage Docs|Hardware & Storage Docs]]
- [[_COMMUNITY_404 Page & Sitemap|404 Page & Sitemap]]
- [[_COMMUNITY_Docs Landing Redesign Plan (historical)|Docs Landing Redesign Plan (historical)]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]

## God Nodes (most connected - your core abstractions)
1. `Changelog Page` - 20 edges
2. `compilerOptions` - 16 edges
3. `inventory.yaml (Single Source of Truth)` - 16 edges
4. `ServiceNode` - 15 edges
5. `HostSpec` - 13 edges
6. `Playground Controller (CT 105)` - 11 edges
7. `getInventory()` - 9 edges
8. `fadeUp` - 8 edges
9. `Rebuild from Docs Workflow` - 8 edges
10. `Media Stack (CT 104)` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Real End-to-End Verification Convention` --semantically_similar_to--> `Mobile Ctrl Toolbar Real-Device Bug Fix`  [INFERRED] [semantically similar]
  CLAUDE.md → content/changelog.mdx
- `Docs Folder Restructure + RULEBOOK.md (2026-07-03)` --rationale_for--> `Rebuild from Docs Workflow`  [INFERRED]
  content/changelog.mdx → .github/workflows/rebuild-from-docs.yml
- `Wide Diagram Scroll Affordance Pattern` --conceptually_related_to--> `VMID Band Taxonomy (100-199)`  [INFERRED]
  CLAUDE.md → src/data/inventory.yaml
- `inventory.yaml (Single Source of Truth)` --references--> `HP ProDesk 400 G3 MT Host`  [EXTRACTED]
  src/data/inventory.yaml → content/infrastructure/hardware.mdx
- `jaysync-lab-site Overview (CLAUDE.md)` --references--> `JaySync-Lab (hub repo / homelab source of truth)`  [EXTRACTED]
  CLAUDE.md → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Docs Auto-Sync Pipeline** — workflows_rebuild_from_docs_workflow, data_inventory_inventory_yaml, content_index_lab_doc, claude_overview [INFERRED 0.85]
- **Playground Sandbox Architecture** — services_playground_controller_playground_controller, services_playground_controller_golden_template, services_playground_controller_dual_homed_bridge, data_inventory_vmid_bands [INFERRED 0.80]
- **Docs Landing Redesign Planning Trio** — specs_2026_06_19_cinematic_redesign_design_spec, specs_2026_06_23_docs_landing_redesign_spec, plans_2026_06_23_docs_landing_redesign_plan [INFERRED 0.90]
- **Lab Service Topology** — infrastructure_proxmox_host_proxmox_host, services_pi_hole_pi_hole, services_uptime_kuma_uptime_kuma, services_home_assistant_home_assistant, services_media_stack_media_stack, services_playground_controller_playground_controller [EXTRACTED 1.00]

## Communities (20 total, 4 thin omitted)

### Community 0 - "CLAUDE.md Conventions & Gotchas"
Cohesion: 0.05
Nodes (62): Real End-to-End Verification Convention, isLiveNode() Convention, jaysync-lab-site Overview (CLAUDE.md), scanline-overlay Overflow-Hidden Requirement, Splash Screen Every-Load Behavior, Wide Diagram Scroll Affordance Pattern, Changelog Page, Narrowly Scoped Controller API Token (+54 more)

### Community 1 - "App Layout & Branding"
Cohesion: 0.05
Nodes (43): JaySync-Lab "J/S" Monogram Icon, BASE, generateMetadata(), inter, mono, ArchitecturePage(), metadata, BAND_COLORS (+35 more)

### Community 2 - "Changelog & Motion Utilities"
Cohesion: 0.08
Nodes (24): ChangelogEntry, getNodes(), easeOut, fadeIn, fadeUp, spring, springScale, stagger (+16 more)

### Community 3 - "Loading Link & Docs Hero Components"
Cohesion: 0.07
Nodes (18): LoadingLink(), Props, DocsHero(), Props, WORDS, Nav(), NAV_LINKS, ACCENT (+10 more)

### Community 4 - "Dependencies (Fumadocs, Tailwind)"
Cohesion: 0.07
Nodes (27): dependencies, fumadocs-core, fumadocs-mdx, fumadocs-ui, js-yaml, lucide-react, motion, next (+19 more)

### Community 5 - "Live Status Badge (Uptime Kuma)"
Cohesion: 0.12
Nodes (13): DOT, HeartbeatEntry, HeartbeatResponse, MonitorEntry, Props, StatusBadge(), StatusPageResponse, StatusValue (+5 more)

### Community 6 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 7 - "Hardware & Storage Docs"
Cohesion: 0.14
Nodes (18): BIOS Pre-Installation Configuration, Hardware Specs Page, HP ProDesk 400 G3 MT Host, SSD/HDD Storage Tiering, Single Flat-LAN Bridge Design Rationale, Intel iGPU Passthrough Setup, Proxmox Host Page, Proxmox Storage Pool Definitions (+10 more)

### Community 8 - "404 Page & Sitemap"
Cohesion: 0.17
Nodes (7): LINES, NotFound(), BASE, source, generateMetadata(), Page(), Props

### Community 9 - "Docs Landing Redesign Plan (historical)"
Cohesion: 0.14
Nodes (15): superpowers:executing-plans skill, Docs Landing Page Redesign — Implementation Plan, superpowers:subagent-driven-development skill, Task 1: Restructure Routing ([[...slug]] -> [...slug]), Task 2: Build Five Landing Components, Task 3: Wire the Landing Page, Docs Zone Grey Palette, Full-Send Motion System (+7 more)

### Community 10 - "Community 10"
Cohesion: 0.33
Nodes (4): Counter(), Props, Props, StatRow

### Community 11 - "Community 11"
Cohesion: 0.67
Nodes (3): getStatus(), removed, walk()

## Knowledge Gaps
- **124 isolated node(s):** `withMDX`, `nextConfig`, `name`, `version`, `private` (+119 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `inventory.yaml (Single Source of Truth)` connect `CLAUDE.md Conventions & Gotchas` to `Docs Landing Redesign Plan (historical)`, `Hardware & Storage Docs`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `Changelog Page` connect `CLAUDE.md Conventions & Gotchas` to `Hardware & Storage Docs`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `Docs Landing Page Redesign — Implementation Plan` connect `Docs Landing Redesign Plan (historical)` to `CLAUDE.md Conventions & Gotchas`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `withMDX`, `nextConfig`, `name` to the rest of the system?**
  _135 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CLAUDE.md Conventions & Gotchas` be split into smaller, more focused modules?**
  _Cohesion score 0.05288207297726071 - nodes in this community are weakly interconnected._
- **Should `App Layout & Branding` be split into smaller, more focused modules?**
  _Cohesion score 0.05028248587570622 - nodes in this community are weakly interconnected._
- **Should `Changelog & Motion Utilities` be split into smaller, more focused modules?**
  _Cohesion score 0.08408408408408409 - nodes in this community are weakly interconnected._