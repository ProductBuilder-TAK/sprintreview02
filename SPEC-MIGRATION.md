# SPEC COMPLÈTE — Migration React + Tailwind

> Ce document est la source de vérité. Aucune assumption. Tout est documenté.

---

## 1. STRATÉGIE CSS : Tailwind-first

### Principe
**Zéro fichier CSS vanilla copié.** Tout est soit :
- Des **classes Tailwind** dans le JSX (76 classes simples)
- Des **@apply rules** dans `@layer components` dans un seul fichier `design-system.css` (287 patterns réutilisables)
- Du **CSS custom** minimal pour animations + font-variation-settings (12 règles)

### tailwind.config.ts — Tokens exacts

```ts
// Tous les tokens viennent de sprint-review-dashboard/css/variables.css
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        paper:      { DEFAULT: '#fafaf7', 2: '#f3f1ea', 3: '#e9e5d9' },
        ink:        { DEFAULT: '#1a1a17', 2: '#3a3a34', 3: '#6b6b62', mute: '#9a9a8e' },
        line:       { DEFAULT: '#2a2a26', soft: '#d8d3c4', hair: '#ebe7da' },
        sage:       { DEFAULT: '#6b8559', 2: '#9bb38a', soft: '#dee5d4' },
        forest:     '#2a3e2d',
        amber:      { DEFAULT: '#c9a47a', soft: '#ecddc7' },
        ochre:      '#a8865c',
        rust:       { DEFAULT: '#b07564', soft: '#e8d3ca' },
        plum:       { DEFAULT: '#8a6e7e', soft: '#ddd0d6' },
        'ds-sky':   { DEFAULT: '#8499ad', soft: '#d6dde4' },
        // Semantic
        ok:         { DEFAULT: '#6b8559', soft: '#dee5d4' },
        warn:       { DEFAULT: '#a8865c', soft: '#ecddc7' },
        bad:        { DEFAULT: '#b07564', soft: '#e8d3ca' },
      },
      fontFamily: {
        display: ['"Fraunces"', '"Iowan Old Style"', 'Georgia', 'serif'],
        body:    ['"Inter"', '-apple-system', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '4px',    // vanilla --r-sm
        DEFAULT: '6px', // vanilla --r-md
        lg: '10px',   // vanilla --r-lg
      },
      boxShadow: {
        sm:         '0 1px 3px rgba(0,0,0,0.04)',
        md:         '0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)',
        lg:         '0 4px 16px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.03)',
        xl:         '0 12px 24px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)',
        card:       '0 1px 3px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08)',
      },
      zIndex: {
        dropdown: '100',
        sticky:   '200',
        overlay:  '300',
        modal:    '400',
        tooltip:  '500',
        toast:    '600',
      },
      maxWidth: {
        content: '1480px',
      },
    },
  },
}
```

> **Note** : `sky` est renommé `ds-sky` pour éviter le conflit avec Tailwind default `sky`.

### design-system.css — @layer components

Un seul fichier CSS avec les 287 @apply rules, organisé en sections :
1. Typographie éditoriale (.eyebrow, .h-display, .h-section, .h-card, .lede, .dek, .kicker, .mono, .tnum, .fineprint, .section__num, .section__deck, .arr)
2. Pills & tags (.pill, .pill--ok/warn/bad/ghost, .pill__dot, .tag, .tagrow)
3. Grids éditoriales (.kpi-grid, .kpi, .kpi__*, .grid-2, .grid-3, .grid-cell, .cell__*)
4. Cover (.cover, .cover__sprintno)
5. Section éditoriale (.section--editorial, .section__head, .section__title)
6. Toggle éditorial (.toggle, .toggle button)
7. Legend (.legend, .legend__item, .legend__sw)
8. Story Points (.sp, .sp__hero, .sp__bar, .sp__rows, .sp__row, .sp__completion-cards)
9. Scenarios (.scenarios, .scenario, .scenario__*)
10. Buttons éditoriaux (.btn--editorial, .btn--editorial-ghost, .btn--editorial-small)

### custom.css — CSS pur (12 règles)

- @keyframes (secretReveal, spin, fadeIn, etc.)
- font-variation-settings pour .h-display, .kpi__num, .scenario__big, .cover__sprintno, .masthead__brand-mark
- Pseudo-elements complexes (::before pour badges goal, ::after pour checkboxes)
- data-URI background-image pour .form__select
- backdrop-filter pour tweaks panel
- Density calc() : `padding: calc(20px * var(--density))`

### Composants avec PROPRE CSS (page-specific, en @layer)

Fichiers séparés pour garder la maintenabilité :
- `admin-components.css` — .admin-page, .admin-section, .admin-page__grid, .form, .form__*, .team-chip, .story-points-grid/auto, .snapshot-*, .admin-notice
- `navigation-components.css` — .masthead, .masthead__*, .tab, .tab__num, .tab--secret, .tab--right, .navigation
- `file-upload-components.css` — .file-upload, .file-upload__dropzone, .file-upload__checklist*, .dropzone__icon
- `tweaks-components.css` — .twk-fab, .twk-panel, .twk-*, .twk-seg, .twk-toggle
- `modal-components.css` — .modal-overlay, .modal, .modal__*
- `review-components.css` — .review-page, .export-dropdown, .sp-table__*, .sp-layout, .velocity-card
- `forecast-components.css` — forecast-specific layouts
- `gauge-components.css` — .gauge, .gauge__*, .sp-gauge, .ring-gauge, etc.
- `loader-components.css` — .loader, .spinner, .skeleton, .progress, .empty-state
- `badge-components.css` — .badge, .badge--*, .count-badge

**TOTAL CSS custom : ~10 petits fichiers** dans `src/styles/components/` + 1 `design-system.css` + 1 `custom.css`.

---

## 2. TEXTES EXACTS PAR PAGE

### Navigation
| Élément | Texte exact | Classes |
|---|---|---|
| Brand | "Sprint Review" | .masthead__brand-mark |
| Tab 1 | "Préparation" | .tab, num "§ 01" |
| Tab 2 | "Review" | .tab, num "§ 02" |
| Tab 3 | "Forecast" | .tab, num "§ 03" |
| Secret 1 | "StarAc" | .tab.tab--secret, num "§ ★" |
| Secret 2 | "How Many" | .tab.tab--secret, num "§ #" |
| RGPD | "RGPD" | .tab.tab--right, num "¶" |
| Edition | `<strong>{sprintLabel}</strong> — {teamName}` | .masthead__edition |

### AdminPage ("Préparation")
| Section | Texte exact |
|---|---|
| eyebrow | "§ 00 — Préparation" |
| h-display | "Préparation de la `<em>`review`</em>`" |
| lede | "Charger les exports Jira, choisir le sprint à présenter, saisir les engagements — tout reste sur cette machine." |
| §01 num | "§ 01 — Sources" |
| §01 title | "Fichiers Jira" |
| §02 num | "§ 02 — Engagements" |
| §02 title | "Story points par sprint" |
| §02 deck | "Saisir les engagements et livrés sur six sprints — sert au calcul de vélocité recommandée." |
| §03 num | "§ 03 — Archives" |
| §03 title | "Snapshots sauvegardés" |
| §03 button | "Sauvegarder →" |
| fineprint | "Tout reste local · Aucun serveur · Conforme RGPD" |

### FileUploader
| Élément | Texte exact |
|---|---|
| icon | "↗" (dans .dropzone__icon, cercle 36px) |
| titre | "Déposer les CSV ici" (strong, Fraunces 18px weight 500) |
| description | "Sprint Review & Time in Status — exports EazyBI" (.dek) |
| bouton | "Parcourir →" (.btn--editorial.btn--editorial-small, label) |
| checklist header | "Fichiers" + "X/Y requis" |
| item non chargé | "○" + nom fichier |
| item chargé | "✓" + nom fichier + bouton "✕" |

### ReviewPage
| Élément | Texte exact |
|---|---|
| h-display | "{teamName}" (PAS "Sprint X") |
| cover__sprintno | "`<sup>`N°`</sup>`{sprintNumber}" |
| export button | "Exporter ▾" |
| §01 num | "§ 01 — Story points" |
| §01 title | "Engagement et livraison" |
| §02 num | "§ 02 — Indicateurs" |
| §02 title | "Six chiffres pour résumer le sprint" |
| §02 deck | "Comparé à la médiane des six derniers sprints." |
| §03 num | "§ 03 — Tendances" |
| §03 title | "Six sprints en perspective" |
| fineprint | "Sprint Review · {teamName} — {sprintLabel} · 100 % local · Aucune donnée transmise" |

### ForecastPage
| Élément | Texte exact |
|---|---|
| eyebrow | "Forecast" |
| h-display | "Sprint `<em>`{nextSprintNumber}`</em>`" |
| cover__sprintno | "{nextSprintNumber}`<sup>`N+1`</sup>`" |

### Tweaks Panel
| Option | Valeurs |
|---|---|
| Palette | Sauge (earth) / Rose (rose) / Encre (ink) |
| Densité | Dense (compact) / Normal (normal) / Aéré (cozy) |
| Typographie | Éditorial (editorial) / Sans (sans) / Mono (mono) |
| Thème | checkbox "Mode sombre" |

---

## 3. DATA FLOW

```
CSV drop/select
    ↓
FileUploader.processFiles()
    ├── identifyFileType(filename) → 'unified' | 'timeInStatus'
    ├── parseUnifiedCSV(text) → { tickets[], teams[], summary }
    └── parseTimeInStatusCSV(text) → { tickets[], teams[], statuses[], summary }
    ↓
buildUnifiedCsvData() → {
  tickets,            // from parseUnifiedCSV
  teams,              // from parseUnifiedCSV  
  summary,            // from parseUnifiedCSV
  timeInStatus?,      // from parseTimeInStatusCSV (optional)
  teamsTimeInStatus?, // teams from TiS
  commonTeams?        // intersection
}
    ↓
store.setCsvData(csvData)  // OBJET UNIQUE, pas 2 clés
store.setCsvLoaded(true)
    ↓
AdminPage useEffect → 
  getAvailableSprints(csvData.tickets) → [{ sprint: number, label: string }]
  setAvailableSprints(sprints)
  setSelectedSprint(lastSprint.sprint)  // NUMBER, pas string
    ↓
AdminPage useEffect (quand selectedSprint change) →
  transformAllDataV2(csvData, selectedSprint, selectedTeams)
  // 3 arguments : rawData=csvData, selectedSprint=number, selectedTeams=string[]
    ↓
store.setSprintMetrics(result)
    ↓
ReviewPage / ForecastPage (reactent via useAppStore)
```

---

## 4. BACKLOG DE SPRINTS

### Sprint 1 — Fondation Tailwind + Config (pas de UI)
**But** : projet React qui compile, avec les tokens, le design system CSS, et les services portés.

| # | Tâche | Critère de succès |
|---|---|---|
| 1.1 | Scaffolding Vite + React + TS | `npm run dev` démarre |
| 1.2 | tailwind.config.ts avec TOUS les tokens (couleurs, fonts, radii, shadows, z-index) | Les classes `bg-paper`, `text-ink-3`, `font-display`, `rounded-sm`, `shadow-card` existent |
| 1.3 | design-system.css : @layer components avec les 287 @apply rules | Les classes `.eyebrow`, `.h-display`, `.kpi`, `.pill`, `.toggle`, `.cover` etc. fonctionnent |
| 1.4 | custom.css : animations, font-variation-settings, pseudo-elements | `.h-display` a font-variation-settings: "opsz" 144 |
| 1.5 | Component CSS files (10 fichiers dans src/styles/components/) | Toutes les classes admin, navigation, file-upload, etc. fonctionnent |
| 1.6 | Copier + adapter les 9 services JS + 4 utils + config.ts | Imports corrigés, eventBus neutralisé |
| 1.7 | Zustand store (csvData=objet unique, selectedSprint=number) | Types corrects |
| 1.8 | Tests unitaires services | csvParserV2, dataTransformerV2, metricsCalculator, validators, formatters → vitest pass |
| 1.9 | `npm run build` OK | Build sans erreurs |

**Zéro composant React UI dans ce sprint.** Juste les fondations.

---

### Sprint 2 — Shell App + Navigation + AdminPage pixel-perfect
**But** : la page Admin est visuellement identique au vanilla.

| # | Tâche | Critère de succès |
|---|---|---|
| 2.1 | index.html avec Google Fonts, Material Symbols, meta tags | Fonts chargées |
| 2.2 | App.tsx avec HashRouter, ThemeApplier, SecretCodeListener | Routes fonctionnent |
| 2.3 | Navigation.tsx pixel-perfect (§ 01 Préparation, § 02 Review, § 03 Forecast, ¶ RGPD) | Visuellement identique à la capture d'écran |
| 2.4 | RGPD Modal (modal-overlay + modal) | S'ouvre, fond opaque, scrollable, fermeture |
| 2.5 | FileUploader.tsx pixel-perfect (dropzone ↗, "Déposer les CSV ici", "Parcourir →", checklist ○/✓) | Visuellement identique |
| 2.6 | AdminPage.tsx pixel-perfect (cover, §01 Sources 2 colonnes, §02 Engagements, §03 Archives) | Visuellement identique |
| 2.7 | Panel "Informations Sprint" (3 cas : sans CSV, 1 team, multi-team chips) | Les 3 cas fonctionnent |
| 2.8 | TweaksPanel (twk-fab ⚙, panneau Sauge/Rose/Encre, Dense/Normal/Aéré, etc.) | Visuellement identique |
| 2.9 | Upload CSV → parsing → sprints disponibles → sélection sprint → transformation | Flux complet fonctionne |
| 2.10 | Test E2E : upload demo CSV → vérifier que sprints apparaissent | Playwright pass |
| 2.11 | Comparaison visuelle : capture React vs capture vanilla côte à côte | Pixel-perfect |

---

### Sprint 3 — ReviewPage pixel-perfect
**But** : la page Review est visuellement identique au vanilla.

| # | Tâche | Critère de succès |
|---|---|---|
| 3.1 | ReviewPage cover (h-display = teamName, cover__sprintno = N°{num}, export dropdown) | Identique |
| 3.2 | §01 Story Points (SP block avec hero, barre, score de complétion global, rows) | Identique |
| 3.3 | §02 KPI Grid 3×2 (Throughput, Cycle Time, Stock Bugs, Mid-Sprint, MTTR, CFR) | Identique, bonnes valeurs |
| 3.4 | §03 Charts — Throughput (Recharts BarChart + toggle Tickets/SP) | Visuellement proche |
| 3.5 | §03 Charts — Cycle Time (Recharts LineChart) | Visuellement proche |
| 3.6 | §03 Charts — Répartition du cycle (2 Recharts PieChart donut) | Visuellement proche |
| 3.7 | §03 Charts — Bugs créés vs résolus | Visuellement proche |
| 3.8 | §03 Charts — WIP individuel moyen (full width) | Visuellement proche |
| 3.9 | Fineprint exact | Identique |
| 3.10 | Test E2E : upload CSV → Review → vérifier KPI values | Playwright pass |

---

### Sprint 4 — ForecastPage + Export
**But** : Forecast fonctionnel, export PDF/Markdown.

| # | Tâche |
|---|---|
| 4.1 | ForecastPage (cover, scénarios P15/P50/P85, velocity chart, distribution, contributeurs table) |
| 4.2 | Export hook (html2canvas + jsPDF, lazy-loaded) |
| 4.3 | Export Markdown |
| 4.4 | Menu dropdown export sur ReviewPage |
| 4.5 | Tests E2E forecast |

---

### Sprint 5 — Secrets + Polish
**But** : Pages secrètes, Konami codes, Sprint Goals interactifs.

| # | Tâche |
|---|---|
| 5.1 | useSecretCode hook (6 séquences exactes) |
| 5.2 | SharedContributorsPage (StarAc leaderboard) |
| 5.3 | HowManyPage (simulation) |
| 5.4 | Sprint Goals interactifs (add, cycle status, delete) |
| 5.5 | Pearson correlation card (secret "pear") |
| 5.6 | Burndown chart (secret "burn") |

---

### Sprint 6 — Storybook React + Tests + Deploy
**But** : Storybook complet, CI/CD, production-ready.

| # | Tâche |
|---|---|
| 6.1 | Storybook @storybook/react-vite avec toutes les stories (tokens, composants, layout) |
| 6.2 | Coverage tests : services ≥ 90%, composants ≥ 80% |
| 6.3 | GitHub Actions (ci.yml + deploy.yml) |
| 6.4 | Code splitting (React.lazy par page) |
| 6.5 | README.md |
| 6.6 | Build final + deploy GitHub Pages |
| 6.7 | Checklist Lovable |

---

## 5. RÈGLE D'OR

> **Avant d'écrire un composant React, ouvrir le render() vanilla correspondant et copier EXACTEMENT les textes, classes CSS, et structure HTML. Toute divergence est un bug.**
