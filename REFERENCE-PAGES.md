# Pages et Modules — Sprint Review Dashboard

## Navigation (masthead)

### Brand
- Texte : "Sprint Review"
- Classes : `masthead__brand-mark` (Fraunces, 700, 26px, italic, tracking -0.02em)

### Edition line
- Après chargement : `<strong>{sprintLabel}</strong> — {teamName}` (Fraunces italic 13px)

### Tabs
| ID | Label | Numéro | Notes |
|---|---|---|---|
| admin | **Préparation** | § 01 | Tab par défaut |
| review | Review | § 02 | Désactivé si pas de CSV |
| forecast | Forecast | § 03 | Désactivé si pas de CSV |
| shared | StarAc | § ★ | Secret (↑↑↓↓) |
| howmany | How Many | § # | Secret (←←→→) |
| rgpd | RGPD | ¶ | Aligné à droite, ouvre le modal |

### Tab styling
- Font : Inter 13px, weight 500, color ink-3
- Numéro : JetBrains Mono 10px, weight 500, color ink-mute (sage quand actif)
- Actif : `aria-selected="true"`, border-bottom 2px ink
- Secret : gradient #667eea → #764ba2, texte blanc, border-radius top

---

## Page Admin ("Préparation")

### Cover
```
eyebrow : "§ 00 — Préparation"
h-display : "Préparation de la <em>review</em>"
lede : "Charger les exports Jira, choisir le sprint à présenter, saisir les engagements — tout reste sur cette machine."
```

### § 01 — Sources / Fichiers Jira
- Layout : grille 2 colonnes (`admin-page__grid`)
- Colonne gauche : FileUploader (dropzone + checklist)
- Colonne droite : panel "Informations Sprint"
  - Avant CSV : inputs Nom d'équipe + Sprint (texte)
  - Après CSV 1 équipe : input Nom équipe + select Sprint
  - Après CSV multi-équipes : team-chips + select Sprint

### FileUploader — Dropzone
```
dropzone__icon : cercle 36px avec "+" (Fraunces italic 22px)
eyebrow : "Déposer les CSV ici"
dek : "Sprint Review & Time in Status — exports EazyBI"
btn : "Parcourir →" (btn--editorial)
```

### FileUploader — Checklist
```
header : "Sélect. fichiers" + count "X / 2"
items : 
  - "Sprint Review.csv" (required)
  - "Time in status.csv" (required)
```
- Item loaded : background sage-soft, icône ✓ en cercle sage
- Item pending : background paper, icône —

### § 02 — Engagements / Story points par sprint
- deck : "Saisir les engagements et livrés sur six sprints — sert au calcul de vélocité recommandée."
- Sans CSV : grille manuelle 6 sprints (Sprint actuel + Sprint -1 à -5)
- Avec CSV : tableau auto (3 derniers sprints + moyenne), avec badges completion (success/warning/danger)

### § 03 — Archives / Snapshots
- Bouton : "Sauvegarder →" (btn--editorial btn--editorial-small)
- Liste de snapshots : nom + date + boutons charger/supprimer
- Empty : "Aucun snapshot sauvegardé"

### Fineprint
"Tout reste local · Aucun serveur · Conforme RGPD"

---

## Page Review

### Cover
```
h-display : "{teamName}" (PAS "Sprint X")
cover__sprintno : "<sup>N°</sup>{sprintNumber}" (géant, Fraunces italic)
Actions : dropdown export (PDF Radial, PDF Classique, Markdown)
```

### § 01 — Story points / Engagement et livraison
- Bloc SP (.sp) avec hero, barre, score de complétion global, rows (moyenne, vélocité recommandée)

### § 02 — Indicateurs / Six chiffres pour résumer le sprint
- deck : "Comparé à la médiane des six derniers sprints."
- KPI grid 3×2 :
  - Row 1 : Throughput (feat), Cycle Time (★ hors bugs), Stock de bugs
  - Row 2 : Ajouts mid-sprint, MTTR, Change Failure Rate
  - (Secret) : Corrélation SP/CT (après "pear")

### § 03 — Tendances / Six sprints en perspective
- grid-2 :
  - Throughput (bar chart, toggle Tickets/SP)
  - Cycle Time (line chart)
  - Répartition du cycle (2 doughnuts : Sprint vs 6 sprints)
  - Bugs créés vs résolus (bar chart)
  - WIP individuel moyen (full width)
  - (Secret) Burndown (full width, après "burn")

### Fineprint
"Sprint Review · {teamName} — {sprintLabel} · 100 % local · Aucune donnée transmise"

---

## Page Forecast

### Cover
```
eyebrow : "Forecast"
h-display : "Sprint <em>{nextSprintNumber}</em>"
lede : "Projection Monte Carlo basée sur X sprints d'historique"
cover__sprintno : "{nextSprintNumber}<sup>N+1</sup>"
```

### Sections
- Scénarios Monte Carlo (3 cartes : Pessimiste P15, Réaliste P50, Optimiste P85)
- Vélocité d'équipe (bar chart)
- Distribution Monte Carlo (histogramme)
- Table contributeurs (nom, sprints, moy. tickets, moy. SP, fiabilité)

---

## Pages Secrètes

### StarAc (SharedContributorsPage)
- Leaderboard des contributeurs (🥇🥈🥉)
- Stats : contributeurs, moy. tickets/sprint/pers., fiabilité moyenne

### How Many (HowManyPage)
- Tendance, stabilité, sprints analysés
- Projections par horizon

---

## RGPD Modal
- Ouvert par le tab ¶ RGPD
- Classe : `modal-overlay` + `modal-overlay--visible`
- Contenu : doc complète conformité RGPD (100% client-side, pas de serveur, localStorage)
- Fermeture : bouton × ou clic overlay

---

## Tweaks Panel
- FAB en bas à droite : "⚙" (classe `twk-fab`)
- Panel aside : `twk-panel`
- Options :
  - Palette : Sauge (earth) / Rose / Encre (ink)
  - Densité : Dense (compact) / Normal / Aéré (cozy)
  - Typographie : Éditorial / Sans / Mono
  - Thème : checkbox "Mode sombre"
