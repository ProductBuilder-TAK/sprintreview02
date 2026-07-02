
> Cadrage, pas implémentation. Aucun code ne sera écrit tant que tu n'as pas validé ce document. Skill utilisé : **spec-driven**.

L'intention n'ayant pas été précisée, je pars par défaut sur une feature **« Sprint Review »** : un outil léger pour préparer, animer et journaliser une revue de sprint (démos, feedback, décisions). Si ce n'est pas ça, dis-le en une phrase et je réécris le cadrage.

---

## 1. Ancrage — ce qui existe déjà

Exploration du repo :

- Stack : **TanStack Start v1** (SSR), React 19, Vite 7, Tailwind v4, shadcn/ui complet dans `src/components/ui/`.
- Routing fichier dans `src/routes/` — seul `index.tsx` existe (placeholder probable), `__root.tsx` fournit le shell HTML + boundaries 404/erreur.
- **Aucun backend, aucune table, aucun modèle métier**. Lovable Cloud n'est pas activé.
- Rien de réutilisable côté domaine — c'est un template neuf.

**Point d'insertion** : nouvelles routes sous `src/routes/`, nouvelles tables via Lovable Cloud à activer.

**Incertitudes assumées** (non masquées) : je ne sais pas si tu veux un outil mono-utilisateur (perso, un facilitateur) ou multi-utilisateurs (équipe qui contribue en live). C'est structurant → question forcée plus bas.

---

## 2. Problème & JTBD *(à confirmer par toi)*

Hypothèse de travail :
> *En tant que* facilitateur d'équipe agile, *je veux* préparer une revue de sprint puis en garder une trace exploitable, *afin de* ne pas perdre les démos montrées, les feedbacks reçus et les décisions prises.

Signal à confirmer : **pour qui exactement** ? (facilitateur seul, équipe qui co-édite, stakeholders en lecture ?)

---

## 3. Scope / Hors-scope

**Dans le scope (proto)**
- Créer une revue de sprint (titre, sprint #, date, équipe).
- Ajouter des items de démo (titre, auteur, description, statut : done / partiel / bloqué).
- Capturer feedback par item (texte libre + auteur).
- Capturer décisions & next steps.
- Lister les revues passées + vue détail.

**Hors-scope explicite**
- Rétrospective (feature distincte).
- Planning poker / estimation.
- Intégration Jira / Linear / GitHub.
- Vote en temps réel, présence multi-curseurs.
- Export PDF (nice-to-have, pas proto).

---

## 4. Règles métier

- **RG-01** Une revue appartient à une équipe et un sprint (numéro libre, ex. « Sprint 42 »).
- **RG-02** Un item de démo a un et un seul auteur ; le statut est parmi `done | partiel | bloqué`.
- **RG-03** Un feedback est rattaché à un item ; il n'existe pas de feedback « orphelin ».
- **RG-04** Une décision est rattachée à la revue, pas à un item (portée globale).
- **RG-05** Suppression d'une revue → cascade sur items, feedbacks, décisions (soft-delete recommandé mais hors scope proto).

---

## 5. Critères d'acceptation

**Créer une revue**
- [ ] *Given* je suis sur `/reviews`, *when* je clique « Nouvelle revue » et remplis titre + sprint, *then* la revue apparaît en tête de liste et je suis redirigé sur son détail.
- [ ] *Given* le titre est vide, *when* je soumets, *then* le formulaire refuse et affiche une erreur inline.

**Gérer les items de démo**
- [ ] *Given* je suis sur le détail d'une revue, *when* j'ajoute un item avec titre + auteur + statut, *then* il s'affiche dans la liste avec un badge de statut coloré.
- [ ] *Given* un item existe, *when* je change son statut, *then* la modification est persistée sans reload.

**Feedback & décisions**
- [ ] *Given* un item existe, *when* j'ajoute un feedback, *then* il s'affiche sous l'item avec son auteur.
- [ ] *Given* je suis sur le détail, *when* j'ajoute une décision, *then* elle apparaît dans une section « Décisions » séparée.

**Historique**
- [ ] *Given* plusieurs revues existent, *when* je vais sur `/reviews`, *then* je les vois triées par date décroissante avec un compteur d'items.

---

## 6. Plan technique

**Insertion dans l'archi existante**

Nouveaux fichiers :
```
src/routes/reviews.index.tsx         → liste
src/routes/reviews.new.tsx           → création (ou dialog sur la liste)
src/routes/reviews.$reviewId.tsx     → détail
src/lib/reviews.functions.ts         → createServerFn (list/get/create/update)
src/components/review/*              → composants dédiés (ItemCard, FeedbackList…)
```

Fichiers modifiés :
- `src/routes/__root.tsx` : titre + meta app-spécifiques (pas « Lovable App »).
- `src/routes/index.tsx` : remplacer placeholder par redirection vers `/reviews` ou landing courte.

**Données** — via Lovable Cloud (Postgres) :
- `reviews (id, title, sprint_label, team, review_date, created_at)`
- `review_items (id, review_id, title, author, description, status)`
- `review_feedbacks (id, item_id, author, body, created_at)`
- `review_decisions (id, review_id, body, created_at)`

RLS + GRANT à définir selon la réponse « qui écrit ? ». Auth à activer si multi-user.

**Décisions techniques cohérentes avec l'existant**
- Reads : loader + `ensureQueryData` + `useSuspenseQuery` (pattern canonique du template).
- Writes : `createServerFn` dans `src/lib/reviews.functions.ts`.
- UI : shadcn (déjà présent) — pas de nouvelle lib.

**Décision structurante à trancher (nouvelle, pas issue de l'existant)** : auth ou pas.

---

## 7. Hypothèses & risques

Hypothèses que je prends par défaut, **corrige-moi maintenant sinon j'avance dessus** :

1. **Mono-utilisateur / facilitateur seul** — pas d'auth au proto, données locales ou table publique. *Si équipe co-édite → auth requise, ça change la RLS et les GRANT.*
2. **Persistance via Lovable Cloud** activée dans la foulée (pas de localStorage : la trace historique est le cœur de la valeur).
3. **Pas de temps réel** — un reload / une refetch après mutation suffit au proto.
4. **Auteur = champ texte libre** (pas de FK vers `auth.users`) tant qu'on est mono-user.
5. **Statuts figés** aux trois valeurs `done | partiel | bloqué` (pas de configuration).

**Risques**
- Si tu voulais en fait une **rétro** (formats mad/sad/glad, dot-voting) et pas une **review**, tout le modèle change → dis-le avant que je code.
- Activer Lovable Cloud pour un proto mono-user est légèrement sur-dimensionné, mais l'alternative (localStorage) casse la promesse « garder une trace ».

---

## Prochaine étape

Quand tu valides ce cadrage, **colle-le dans le Project Knowledge avant de lancer le build**. C'est lui qui deviendra la source de vérité du développement.

Réponds notamment sur :
- (a) Bonne feature ? (Sprint Review vs autre chose)
- (b) Mono-user sans auth, ou multi-user avec auth ?
- (c) Un item que tu veux ajouter/retirer du scope ?
