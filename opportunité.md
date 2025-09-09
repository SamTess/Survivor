Super — j’ai ouvert tes 4 fichiers et regardé les colonnes/distributions pour adapter l’algorithme à **tes** données réelles (pas un truc générique hors-sol). Voici une proposition clé-en-main pour **détecter et suivre des opportunités** dans les deux sens (Startup → Investisseur/Partenaire et Investisseur/Partenaire → Startup).

# 1) Ce qu’on a dans les données (résumé très rapide)

* **S\_STARTUP** (38 lignes) : `id, name, sector, maturity, description, address, email, …` + signaux d’intérêt `viewsCount, likesCount, bookmarksCount`.
* **S\_STARTUP\_DETAIL** : par startup, `project_status, needs, description, website_url, social_media_url`.
* **S\_INVESTOR** (11 lignes) : `id, name, investor_type, investment_focus, description, address, …`.
* **S\_PARTNER** (15 lignes) : `id, name, partnership_type, description, address, …`.

> Remarque utile : côté investisseurs/partenaires, on n’a pas (encore) de champs “stage/ticket/sector strict” — on s’appuie donc sur `investment_focus` / `partnership_type` + **description** + **géographie**.

---

# 2) Normalisation & features (pré-processing)

## 2.1. Nettoyage & extraction

* **Pays** : extraire le pays depuis `address` (dernier token “France/Portugal/…”) et uniformiser (ISO-3166).
* **Texte** : pour `description`, `needs`, `investment_focus`, `partnership_type` :

  * lowercasing, suppression stopwords, lemmatisation simple,
  * extraire des **mots-clés** (unigrams/bigrams) + tags normalisés (ex: “fintech”, “edtech”, “AI”, “healthcare”, “cleantech”…).
* **Secteur & maturité** : mapper `sector` et `maturity` vers des ensembles fermés (ex: `maturity ∈ {idea, mvp, early, growth, scale}`).

## 2.2. Vecteurs & tags

* Construire 2 représentations pour chaque entité :

  1. **Tags** (set de mots-clés) → pour Jaccard/overlap rapide.
  2. **Vecteur TF-IDF** du texte concaténé pertinent :

     * Startup: `sector + description + needs`
     * Investor: `investment_focus + description`
     * Partner: `partnership_type + description`

---

# 3) Matching bidirectionnel (scoring)

On calcule un **score composite** ∈ \[0, 100] avec des pondérations (ajustables).
On a trois familles de paires : (Startup, Investor), (Startup, Partner), (Investor, Startup).

## 3.1. Filtres durs (hard filters)

Avant de scorer, éliminer si :

* **Conflit géographique fort** (optionnel) : si l’investisseur/partenaire exclut explicitement des zones (quand tu les ajouteras).
* **Incompatibilité évidente** : ex. `sector` non pertinent et aucun overlap de mots-clés (score de texte=0 **et** overlap tags=0).

## 3.2. Sous-scores

### A) Alignement thématique (40 pts)

* **Overlap Tags** (Jaccard) entre:

  * Startup.tags vs Investor.tags (dérivés de `investment_focus/description`)
  * Startup.tags vs Partner.tags (dérivés de `partnership_type/description`)

  `score_tags = 40 * Jaccard(tagsA, tagsB)`

### B) Similarité sémantique (30 pts)

* **Cosine(TF-IDF)** entre les textes concaténés :

  `score_text = 30 * cosine(tfidfA, tfidfB)`

### C) Stade / besoins (20 pts)

* **Maturité** vs ce que suggère `investment_focus`/`partnership_type`/`needs` :

  * Heuristique simple (en attendant un champ “stage” côté investisseur/partenaire) :

    * si `needs` contient “fundraise”, “seed”, “pre-seed”, “Series A” → mapper vers un **stage**.
    * si `partnership_type` contient “Go-to-market”, “Distribution”, “Pilot”, “Tech provider”, etc., mapper vers des **types de besoins** (GT, pilotage, intégration).
  * `score_stage = 20` si correspondance; `= 10` si “voisin”; `= 0` sinon.

### D) Proximité géographique (10 pts)

* Pays égal → `+10`
* Même région linguistique (francophone, ibérique…) → `+5`
* Sinon → `+0`

  *(Tu pourras raffiner par fuseaux horaires ou “EU vs non-EU”.)*

**Score final**
`Score = score_tags + score_text + score_stage + score_geo`
Clampé à \[0, 100].
Seuils pratiques : `Lead ≥ 60`, `Warm 45–59`, `Cold 30–44`.

---

# 4) Génération d’opportunités (dans les 2 sens)

## 4.1. Startup → Investor

Pour chaque Startup S :

1. Candidats = tous les Investors.
2. Appliquer filtres durs.
3. Calculer `Score(S, I)`; garder top-K (ex: 10) ≥ seuil.
4. Créer/mettre à jour une **Opportunity** `direction="S→I"`.

## 4.2. Startup → Partner

Même process que ci-dessus avec Partenaires, en remplaçant le sous-score “stage” par un mapping “**needs** ↔ **partnership\_type**”.

## 4.3. Investor/Partner → Startup

Symétrique :

1. Pour chaque Investor/Partner A, scorer contre toutes les Startups.
2. Mêmes filtres/pondérations, mais **bonus +5** si la Startup a des signaux d’intérêt élevés (voir ci-dessous).

---

# 5) Priorisation par signaux & fraicheur

## 5.1. Signal d’intérêt (données existantes)

* **viewsCount, likesCount, bookmarksCount** (S\_STARTUP) → calculer un **engagement\_score** avec décroissance temporelle (exponentielle) à partir de `created_at` :

  ```
  z = 0.5*norm(views) + 1.0*norm(likes) + 1.5*norm(bookmarks)
  decay = exp(-λ * age_days)   # λ ~ 0.02
  engagement_score = 10 * z * decay  # max bonus +10
  ```

* Ajouter `engagement_score` au score final en **bonus** (cap à +10).

## 5.2. Fraicheur/activité

* Bonus +3 si `S_STARTUP_DETAIL.project_status` ∈ {“active”, “raising”, “pilot in progress”} (à normaliser).
* Bonus +2 si `needs` contient des termes “urgents” (ex: “now”, “this quarter”, “Q3”).

---

# 6) Modèle de données (tracking pipeline)

## 6.1. Table `OPPORTUNITY`

Minimaliste et prête pour Prisma/SQL :

```
OPPORTUNITY (
  id                UUID PK,
  direction         ENUM('S->I','S->P','I->S','P->S'),
  source_type       ENUM('STARTUP','INVESTOR','PARTNER'),
  source_id         INT,
  target_type       ENUM('INVESTOR','PARTNER','STARTUP'),
  target_id         INT,
  score             NUMERIC(5,2),
  score_breakdown   JSONB,        -- {tags:.., text:.., stage:.., geo:.., engagement:..}
  status            ENUM('new','qualified','contacted','in_discussion','pilot','deal','lost'),
  reason            TEXT,         -- pourquoi qualifié/perdu
  next_action       TEXT,         -- rappel concret
  owner_user_id     INT NULL,     -- si tu assignes un SDR/AM
  created_at        TIMESTAMP,
  updated_at        TIMESTAMP
);
```

## 6.2. Table `OPPORTUNITY_EVENT`

Historiser toutes les interactions/changements :

```
OPPORTUNITY_EVENT (
  id              UUID PK,
  opportunity_id  UUID FK,
  occurred_at     TIMESTAMP DEFAULT now(),
  type            ENUM('auto_created','rescored','status_changed','note','email_sent','meeting','pilot_started','deal_signed'),
  payload         JSONB
);
```

> **Status machine** (recommandée) : `new → qualified → contacted → in_discussion → {pilot|deal|lost}`.
> Règles d’auto-transition possibles (ex: si score > 70 et engagement\_score > 6 → passer en `qualified`).

---

# 7) Pseudocode d’implémentation (Node/TS, Prisma-friendly)

```ts
type Entity = {
  id: number;
  type: 'STARTUP'|'INVESTOR'|'PARTNER';
  country?: string;
  tags: Set<string>;
  tfidfVec: number[]; // calculé offline, stocké en table FEATURE_VECTOR
  maturity?: 'idea'|'mvp'|'early'|'growth'|'scale';
  needsText?: string; // startup only
  signals?: { views: number, likes: number, bookmarks: number, createdAt: Date }; // startup only
  meta: Record<string, any>; // raw fields if utile
};

function jaccard(a: Set<string>, b: Set<string>): number {
  const inter = new Set([...a].filter(x => b.has(x))).size;
  const uni = new Set([...a, ...b]).size;
  return uni ? inter/uni : 0;
}

function cosine(a: number[], b: number[]): number {
  let dot=0, na=0, nb=0;
  for (let i=0;i<Math.min(a.length,b.length);i++){
    dot += a[i]*b[i]; na += a[i]*a[i]; nb += b[i]*b[i];
  }
  return (na && nb) ? dot / (Math.sqrt(na)*Math.sqrt(nb)) : 0;
}

function stageHeuristic(startup: Entity, other: Entity): number {
  // Exemple: si needsText contient 'seed' et investment_focus contient 'early'
  const sNeeds = (startup.meta.needsText || '').toLowerCase();
  const oFocus = ((other.meta.investment_focus || other.meta.partnership_type || '') + ' ' + (other.meta.description||'')).toLowerCase();
  if (!sNeeds && !startup.maturity) return 0;
  const good = ['seed','pre-seed','series a','pilot','gtm','distribution','integration'];
  const hit = good.some(g => sNeeds.includes(g) && oFocus.includes(g));
  if (hit) return 20;
  // sinon voisinage par maturité
  if (startup.maturity && /early|mvp|idea/.test(startup.maturity) && /early|seed/.test(oFocus)) return 10;
  return 0;
}

function geoScore(a?: string, b?: string): number {
  if (!a || !b) return 0;
  if (a === b) return 10;
  const fr = new Set(['France','Belgium','Switzerland','Luxembourg','Canada']); // francophonie simple
  if (fr.has(a) && fr.has(b)) return 5;
  return 0;
}

function engagementBonus(signals?: {views:number,likes:number,bookmarks:number,createdAt:Date}): number {
  if (!signals) return 0;
  const z = 0.5*norm(signals.views) + 1.0*norm(signals.likes) + 1.5*norm(signals.bookmarks);
  const ageDays = (Date.now() - new Date(signals.createdAt).getTime())/(1000*3600*24);
  const decay = Math.exp(-0.02 * Math.max(0, ageDays));
  return Math.min(10, 10 * z * decay);
}

function scorePair(A: Entity, B: Entity): {score:number, breakdown:any} {
  const sTags = 40 * jaccard(A.tags, B.tags);
  const sText = 30 * cosine(A.tfidfVec, B.tfidfVec);
  let sStage = 0, sGeo = 0, sEng = 0;

  if (A.type === 'STARTUP') {
    sStage = stageHeuristic(A, B);
    sEng = engagementBonus(A.signals);
  } else if (B.type === 'STARTUP') {
    sStage = stageHeuristic(B, A);
    sEng = engagementBonus(B.signals);
  }
  sGeo = geoScore(A.country, B.country);

  const score = Math.min(100, sTags + sText + sStage + sGeo + sEng);
  return { score, breakdown: {tags:sTags, text:sText, stage:sStage, geo:sGeo, engagement:sEng} };
}
```

**Batch quotidien** (ou à chaque upsert):

1. Recalculer features (tags, TF-IDF) si `updated_at` a changé.
2. Pour chaque entité, scorer le “camp d’en face” et **upsert** dans `OPPORTUNITY`.
3. Écrire un `OPPORTUNITY_EVENT(type='rescored')` si le score varie de ±10.
4. Auto-promotions de `status` selon des règles (ex: score > 70 → `qualified`).

---

# 8) UI/ops (pour suivre)

* **Kanban pipeline** (statuts de l’opportunity).
* **Alerts** : “Nouvelles opportunités > 70 cette semaine” ; “Opportunités > 60 sans next\_action”.
* **Explainability** : afficher `score_breakdown` (tags/text/stage/geo/engagement) pour justifier le match.
* **Dedup** : éviter les doublons S→I et I→S en gardant la plus récente ou en fusionnant.
* **A/B Weights** : prévoir un fichier de config (ou table `SCORING_WEIGHTS`) pour ajuster pondérations par apprentissage empirique.

---

# 9) Roadmap d’amélioration (faciles à ajouter)

* Ajouter côté **Investor/Partner** des champs opt-in : `preferred_countries`, `excluded_sectors`, `stage_preference`, `check_size_min/max` → ils alimenteront les filtres durs et le sous-score “stage”.
* Passer TF-IDF → **embeddings** (cosine) quand tu veux monter en qualité.
* Rétroaction humaine : si un deal est signé/perdu, ajuster automatiquement les poids (petit gradient).

---

## TL;DR exécutable

1. **Extractor** : normalise pays, génère `tags`, calcule TF-IDF pour Startup/Investor/Partner.
2. **Scorer** : `Score = 40*Jaccard(tags) + 30*Cosine(tfidf) + 20*Stage/Needs + 10*Geo + bonus Engagement`.
3. **Opportunities** : créer/updater une ligne par paire au-dessus d’un seuil, avec `status`, `reason`, `next_action`, et un **journal d’événements**.
4. **Batch** quotidien + auto-promotions de statut + alerts.


# 1) Nouvelles entités & champs

## 1.1. Fonds d’investissement (multi-fonds par investisseur)

**INVESTMENT\_FUND**

* `id UUID PK`
* `investor_id INT FK -> INVESTOR(id)`
* `name TEXT` (ex. “Seed Fund I”)
* `vintage YEAR`
* `aum_eur NUMERIC(18,2)` — AUM (en EUR normalisé)
* `dry_powder_eur NUMERIC(18,2)`
* `investment_period_start DATE`, `investment_period_end DATE`
* `ticket_min_eur NUMERIC(18,2)`, `ticket_max_eur NUMERIC(18,2)`  *(ticket initial)*
* `follow_on_ratio NUMERIC(4,2)` *(% des réserves pour follow-on)*
* `sector_focus TEXT[]` *(tags)*
* `geo_focus TEXT[]` *(pays/régions)*
* `stage_focus TEXT[]` *(pre-seed/seed/A/…)*

> **INVESTOR** garde les infos “génériques” (thèse, description) et un investisseur peut avoir 0..N **funds**.

## 1.2. Budget côté partenaires

**PARTNER** (nouveaux champs)

* `budget_cycle ENUM('one_off','quarterly','annual')`
* `pilot_budget_min_eur NUMERIC(18,2)`, `pilot_budget_max_eur NUMERIC(18,2)` *(POC/pilot)*
* `program_names TEXT[]` *(ex. “Innovation Lab”, “Co-sell”)*

## 1.3. Besoin de financement côté startup

**S\_STARTUP** (nouveaux champs)

* `fundraising_status ENUM('not_raising','preparing','raising','closed')`
* `round ENUM('pre-seed','seed','A','B','C','growth') NULL`
* `ask_min NUMERIC(18,2)`, `ask_max NUMERIC(18,2)`  *(montant recherché, devise d’origine + conversion)*
* `ask_currency CHAR(3)` *(ex. “EUR”)*
* `ask_min_eur NUMERIC(18,2)`, `ask_max_eur NUMERIC(18,2)` *(normalisé)*
* `use_of_funds TEXT` *(mots-clés CAPEX/OPEX, GTM, R\&D…)*
* `revenue_arr_eur NUMERIC(18,2)`, `runway_months INT`

## 1.4. Opportunité enrichie (financier + type de deal)

**OPPORTUNITY** (ajouts)

* `deal_type ENUM('equity','convertible','safe','grant','revenue_based','partnership','pilot','license','commercial')`
* `round ENUM('pre-seed','seed','A','B','C','growth') NULL`
* `proposed_amount_eur NUMERIC(18,2)` *(pour S→I ou I→S)*
* `valuation_pre_money_eur NUMERIC(18,2) NULL`
* `ownership_target_pct NUMERIC(5,2) NULL`
* `fund_id UUID NULL FK -> INVESTMENT_FUND(id)` *(si un fonds précis est ciblé)*
* `budget_fit ENUM('below_range','within_range','above_range','unknown')`
* `budget_fit_score NUMERIC(5,2)` *(0–20 points, voir scoring)*
* `pilot_estimated_cost_eur NUMERIC(18,2) NULL` *(S↔P)*
* `pilot_budget_fit ENUM('within','over','under','unknown')`
* `term_deadline DATE NULL` *(date cible pour term sheet/POC)*

## 1.5. Historique financier

**OPPORTUNITY\_EVENT** (déjà existante) — ajouter dans `payload` des snapshots financiers :

* `payload.financial = { proposed_amount_eur, fund_id, budget_fit, … }`

## 1.6. Normalisation des devises

**CURRENCY\_RATE** *(optionnelle si tu normalises côté ETL)*

* `code CHAR(3) PK`, `rate_to_eur NUMERIC(18,8)`, `as_of DATE`

> Tous les montants *stockés* en parallèle en EUR (`*_eur`) pour la comparaison/scoring rapide.

---

# 2) Scoring : dimension “budget/fonds”

On ajoute un **sous-score financier (max 20 pts)** et un **routing par fonds**.

### 2.1. Compatibilité ticket (S ↔ Fund)

* Si `ask_[min,max]_eur` **overlap** `[ticket_min_eur, ticket_max_eur]` → `budget_fit='within_range'`, `budget_fit_score = 20`.
* Si `ask_max_eur < ticket_min_eur` → `'below_range'`, score = `max(5, 20 * ask_max / ticket_min)`.
* Si `ask_min_eur > ticket_max_eur` → `'above_range'`, score = `max(5, 20 * ticket_max / ask_min)`.
* Si inconnu → `'unknown'`, score = 10 \* (round/stage pertinents ? 1 : 0).

### 2.2. Compatibilité “pilot” (S ↔ Partner)

* Si `pilot_estimated_cost_eur` dans `[pilot_budget_min_eur, pilot_budget_max_eur]` → `pilot_budget_fit='within'`, +15 pts.
* Sinon pente décroissante similaire (min 5 pts si proche).

### 2.3. Disponibilité du fonds (fenêtre d’investissement)

* Bonus +3 si `today ∈ [investment_period_start, investment_period_end]`.
* Bonus +2 si `dry_powder_eur / aum_eur ≥ 0.25`.

> **Nouveau score final (100 pts)**
> `Score = 40(tags) + 25(text) + 15(stage/needs) + 10(geo) + 10(engagement) + 20(budget/fund)`
> *(on a réajusté “text” 30→25 et “stage” 20→15 pour faire de la place au financier).*

---

# 3) Migrations (SQL) — extrait

```sql
-- 1) Funds
CREATE TABLE INVESTMENT_FUND (
  id UUID PRIMARY KEY,
  investor_id INT NOT NULL REFERENCES INVESTOR(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  vintage INT,
  aum_eur NUMERIC(18,2),
  dry_powder_eur NUMERIC(18,2),
  investment_period_start DATE,
  investment_period_end DATE,
  ticket_min_eur NUMERIC(18,2),
  ticket_max_eur NUMERIC(18,2),
  follow_on_ratio NUMERIC(4,2),
  sector_focus TEXT[],
  geo_focus TEXT[],
  stage_focus TEXT[],
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 2) Partner budgets
ALTER TABLE PARTNER
  ADD COLUMN budget_cycle TEXT CHECK (budget_cycle IN ('one_off','quarterly','annual')),
  ADD COLUMN pilot_budget_min_eur NUMERIC(18,2),
  ADD COLUMN pilot_budget_max_eur NUMERIC(18,2),
  ADD COLUMN program_names TEXT[];

-- 3) Startup funding needs
ALTER TABLE S_STARTUP
  ADD COLUMN fundraising_status TEXT CHECK (fundraising_status IN ('not_raising','preparing','raising','closed')),
  ADD COLUMN round TEXT CHECK (round IN ('pre-seed','seed','A','B','C','growth')),
  ADD COLUMN ask_currency CHAR(3),
  ADD COLUMN ask_min NUMERIC(18,2),
  ADD COLUMN ask_max NUMERIC(18,2),
  ADD COLUMN ask_min_eur NUMERIC(18,2),
  ADD COLUMN ask_max_eur NUMERIC(18,2),
  ADD COLUMN use_of_funds TEXT,
  ADD COLUMN revenue_arr_eur NUMERIC(18,2),
  ADD COLUMN runway_months INT;

-- 4) Opportunity financials
ALTER TABLE OPPORTUNITY
  ADD COLUMN deal_type TEXT CHECK (deal_type IN ('equity','convertible','safe','grant','revenue_based','partnership','pilot','license','commercial')),
  ADD COLUMN round TEXT CHECK (round IN ('pre-seed','seed','A','B','C','growth')),
  ADD COLUMN proposed_amount_eur NUMERIC(18,2),
  ADD COLUMN valuation_pre_money_eur NUMERIC(18,2),
  ADD COLUMN ownership_target_pct NUMERIC(5,2),
  ADD COLUMN fund_id UUID REFERENCES INVESTMENT_FUND(id),
  ADD COLUMN budget_fit TEXT CHECK (budget_fit IN ('below_range','within_range','above_range','unknown')),
  ADD COLUMN budget_fit_score NUMERIC(5,2),
  ADD COLUMN pilot_estimated_cost_eur NUMERIC(18,2),
  ADD COLUMN pilot_budget_fit TEXT CHECK (pilot_budget_fit IN ('within','over','under','unknown')),
  ADD COLUMN term_deadline DATE;
```

*(+ indexer `ticket_min_eur, ticket_max_eur, investment_period_*`, et `proposed_amount_eur` pour les filtres.)*

---

# 4) Prisma — extrait de modèles

```prisma
model InvestmentFund {
  id                     String   @id @default(uuid())
  investor               INVESTOR @relation(fields: [investorId], references: [id], onDelete: Cascade)
  investorId             Int
  name                   String
  vintage                Int?
  aum_eur                Decimal?
  dry_powder_eur         Decimal?
  investment_period_start DateTime?
  investment_period_end   DateTime?
  ticket_min_eur         Decimal?
  ticket_max_eur         Decimal?
  follow_on_ratio        Decimal? @db.Decimal(4,2)
  sector_focus           String[]
  geo_focus              String[]
  stage_focus            String[]
  opportunities          OPPORTUNITY[]

  created_at             DateTime @default(now())
  updated_at             DateTime @updatedAt
}

model PARTNER {
  id                      Int      @id @default(autoincrement())
  // ...existants
  budget_cycle            PartnerBudgetCycle?
  pilot_budget_min_eur    Decimal?
  pilot_budget_max_eur    Decimal?
  program_names           String[]
}

enum PartnerBudgetCycle { one_off quarterly annual }

model S_STARTUP {
  id               Int      @id @default(autoincrement())
  // ...existants
  fundraising_status FundraisingStatus?
  round              Round?
  ask_currency       String? @db.Char(3)
  ask_min            Decimal?
  ask_max            Decimal?
  ask_min_eur        Decimal?
  ask_max_eur        Decimal?
  use_of_funds       String?
  revenue_arr_eur    Decimal?
  runway_months      Int?
}

enum FundraisingStatus { not_raising preparing raising closed }
enum Round { pre_seed seed A B C growth } // utiliser underscores si besoin

model OPPORTUNITY {
  id                      String   @id @default(uuid())
  // ...existants
  deal_type               DealType?
  round                   Round?
  proposed_amount_eur     Decimal?
  valuation_pre_money_eur Decimal?
  ownership_target_pct    Decimal? @db.Decimal(5,2)
  fund                    InvestmentFund? @relation(fields: [fundId], references: [id])
  fundId                  String?
  budget_fit              BudgetFit?
  budget_fit_score        Decimal? @db.Decimal(5,2)
  pilot_estimated_cost_eur Decimal?
  pilot_budget_fit        PilotBudgetFit?
  term_deadline           DateTime?
}

enum DealType { equity convertible safe grant revenue_based partnership pilot license commercial }
enum BudgetFit { below_range within_range above_range unknown }
enum PilotBudgetFit { within over under unknown }
```

---

# 5) Logique d’appariement (pseudocode — ajouts clés)

```ts
function budgetScore(startup: Entity, fund?: Fund, partner?: Partner): {score:number, fit:string} {
  if (fund) {
    if (!startup.askMinEur && !startup.askMaxEur) return {score:10, fit:'unknown'};
    const sMin = startup.askMinEur ?? startup.askMaxEur;
    const sMax = startup.askMaxEur ?? startup.askMinEur;
    if (sMax >= fund.ticketMin && sMin <= fund.ticketMax) return {score:20, fit:'within_range'};
    if (sMax < fund.ticketMin)  return {score:Math.max(5, 20 * (Number(sMax)/Number(fund.ticketMin))), fit:'below_range'};
    if (sMin > fund.ticketMax)  return {score:Math.max(5, 20 * (Number(fund.ticketMax)/Number(sMin))), fit:'above_range'};
    return {score:10, fit:'unknown'};
  }
  if (partner) {
    if (!startup.pilotCostEur || !partner.pilotBudgetMin || !partner.pilotBudgetMax) return {score:10, fit:'unknown'};
    if (startup.pilotCostEur >= partner.pilotBudgetMin && startup.pilotCostEur <= partner.pilotBudgetMax)
      return {score:15, fit:'within'};
    if (startup.pilotCostEur < partner.pilotBudgetMin)
      return {score:Math.max(5, 15 * (startup.pilotCostEur/partner.pilotBudgetMin)), fit:'under'};
    return {score:Math.max(5, 15 * (partner.pilotBudgetMax/startup.pilotCostEur)), fit:'over'};
  }
  return {score:0, fit:'unknown'};
}

function availabilityBonus(fund?: Fund): number {
  if (!fund) return 0;
  const now = new Date();
  const inWindow =
    (!fund.periodStart || now >= fund.periodStart) &&
    (!fund.periodEnd   || now <= fund.periodEnd);
  let bonus = inWindow ? 3 : 0;
  const dpRatio = fund.dryPowder && fund.aum ? Number(fund.dryPowder) / Number(fund.aum) : 0;
  if (dpRatio >= 0.25) bonus += 2;
  return bonus;
}
```

---

# 6) Suivi & UI

* **Routing automatique** vers le **meilleur fonds** de l’investisseur (champ `fund_id` + “why”: window active, ticket range, dry powder).
* **Badges** sur la carte opportunité : `Within ticket`, `Above ticket`, `Fund window active`, `Dry powder OK`.
* **Filtres**: `deal_type`, `round`, `budget_fit`, `fund_id`.
* **Alertes**: “Opportunités within ticket & score > 70 sans contact sous 7 jours”.

---

# 7) ETL / Data quality (rapide)

* Convertir toute entrée `ask_*`/`ticket_*` dans la **devise originale + EUR** (côté ETL).
* Enrichir `sector_focus`, `stage_focus`, `geo_focus` des fonds à partir des descriptions existantes (mots-clés, tags).
* Faire remonter côté **Partner** les budgets POC si connus ; sinon laisser `unknown` (score 10 par défaut).

---

Si tu veux, je peux te générer les **migrations Prisma** complètes + un petit script d’**auto-routing** (Startup → meilleur **fund** du même investisseur) et la mise à jour du **scoring** avec ces nouveaux champs.
