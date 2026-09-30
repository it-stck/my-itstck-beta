import { ThemeDefinition, FontPairingDefinition, SectionType } from '../types';

export const THEMES: Record<string, ThemeDefinition> = {
  'obsidian-slate': {
    id: 'obsidian-slate',
    name: 'Obsidian Slate',
    category: 'Dark',
    description: 'Deep slate engineering console with high-contrast cobalt blue accents.',
    bgCanvas: '#0B0F17',
    bgSurface: '#111827',
    bgElevated: '#1E293B',
    textPrimary: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#64748B',
    borderSubtle: '#1E293B',
    accentPrimary: '#3B82F6',
    accentText: '#60A5FA',
    codeBg: '#090D16',
  },
  'paper-editorial': {
    id: 'paper-editorial',
    name: 'Paper Editorial',
    category: 'Editorial',
    description: 'Warm archival paper inspired by academic papers and Swiss technical briefs.',
    bgCanvas: '#FAF9F5',
    bgSurface: '#F3F1EA',
    bgElevated: '#EAE7DC',
    textPrimary: '#141413',
    textSecondary: '#3F3E3A',
    textMuted: '#78756E',
    borderSubtle: '#E2DFD5',
    accentPrimary: '#DC2626',
    accentText: '#B91C1C',
    codeBg: '#EFECE4',
  },
  'github-dark': {
    id: 'github-dark',
    name: 'Primer Dark (README)',
    category: 'Dark',
    description: 'Native GitHub Dark default aesthetics for seamless repository parity.',
    bgCanvas: '#0D1117',
    bgSurface: '#161B22',
    bgElevated: '#21262D',
    textPrimary: '#E6EDF3',
    textSecondary: '#9198A1',
    textMuted: '#6E7681',
    borderSubtle: '#30363D',
    accentPrimary: '#2F81F7',
    accentText: '#58A6FF',
    codeBg: '#161B22',
  },
  'github-light': {
    id: 'github-light',
    name: 'Primer Daylight',
    category: 'Light',
    description: 'Crisp white surface optimized for daytime legibility and clean print export.',
    bgCanvas: '#FFFFFF',
    bgSurface: '#F6F8FA',
    bgElevated: '#EAEEF2',
    textPrimary: '#1F2328',
    textSecondary: '#4D5562',
    textMuted: '#656D76',
    borderSubtle: '#D0D7DE',
    accentPrimary: '#0969DA',
    accentText: '#0969DA',
    codeBg: '#F6F8FA',
  },
  'europass-swiss': {
    id: 'europass-swiss',
    name: 'Europass Institutional',
    category: 'Light',
    description: 'Standardized European curriculum with clean institutional navy structure.',
    bgCanvas: '#F8FAFC',
    bgSurface: '#FFFFFF',
    bgElevated: '#F1F5F9',
    textPrimary: '#0F172A',
    textSecondary: '#334155',
    textMuted: '#64748B',
    borderSubtle: '#E2E8F0',
    accentPrimary: '#1D4ED8',
    accentText: '#1E40AF',
    codeBg: '#F1F5F9',
  },
  'nordic-frost': {
    id: 'nordic-frost',
    name: 'Nordic Frost',
    category: 'Dark',
    description: 'Sub-zero arctic palette engineered for low eye strain during long reviews.',
    bgCanvas: '#191D24',
    bgSurface: '#222831',
    bgElevated: '#2E3440',
    textPrimary: '#ECEFF4',
    textSecondary: '#D8DEE9',
    textMuted: '#81A1C1',
    borderSubtle: '#2E3440',
    accentPrimary: '#38BDF8',
    accentText: '#7DD3FC',
    codeBg: '#14171D',
  },
  'brutalist-mono': {
    id: 'brutalist-mono',
    name: 'Monochrome Brutalist',
    category: 'Dark',
    description: 'Stark jet-black contrast with razor-thin hairline borders and amber accents.',
    bgCanvas: '#050505',
    bgSurface: '#0F0F10',
    bgElevated: '#18181B',
    textPrimary: '#F4F4F0',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',
    borderSubtle: '#27272A',
    accentPrimary: '#F59E0B',
    accentText: '#FBBF24',
    codeBg: '#0A0A0B',
  },
  'solarized-vellum': {
    id: 'solarized-vellum',
    name: 'Solarized Vellum',
    category: 'Editorial',
    description: 'Precision calibrated parchment for extended technical reading.',
    bgCanvas: '#FDF6E3',
    bgSurface: '#EEE8D5',
    bgElevated: '#E4DEC8',
    textPrimary: '#073642',
    textSecondary: '#586E75',
    textMuted: '#839496',
    borderSubtle: '#D8D1BA',
    accentPrimary: '#268BD2',
    accentText: '#1D6FA5',
    codeBg: '#EFE9D6',
  },
};

export const FONT_PAIRINGS: Record<string, FontPairingDefinition> = {
  'jakarta-jetbrains': {
    id: 'jakarta-jetbrains',
    name: 'Plus Jakarta Sans + JetBrains Mono',
    description: 'Contemporary technical balance with high legibility across screens.',
    headingFontFamily: "'Plus Jakarta Sans', sans-serif",
    bodyFontFamily: "'Plus Jakarta Sans', sans-serif",
    monoFontFamily: "'JetBrains Mono', monospace",
    headingClass: 'font-display-jakarta tracking-tight',
  },
  'syne-jakarta': {
    id: 'syne-jakarta',
    name: 'Syne Display + Plus Jakarta Sans',
    description: 'Bold architectural headlines paired with geometric prose.',
    headingFontFamily: "'Syne', sans-serif",
    bodyFontFamily: "'Plus Jakarta Sans', sans-serif",
    monoFontFamily: "'JetBrains Mono', monospace",
    headingClass: 'font-display-syne tracking-tight',
  },
  'instrument-jakarta': {
    id: 'instrument-jakarta',
    name: 'Instrument Serif + Plus Jakarta Sans',
    description: 'Editorial academic aesthetic for research fellows and Staff Engineers.',
    headingFontFamily: "'Instrument Serif', Georgia, serif",
    bodyFontFamily: "'Plus Jakarta Sans', sans-serif",
    monoFontFamily: "'JetBrains Mono', monospace",
    headingClass: 'font-display-serif tracking-normal font-normal',
  },
  'jetbrains-mono': {
    id: 'jetbrains-mono',
    name: 'JetBrains Mono Full Suite',
    description: 'Full monospace tabular environment styled like an RFC specification.',
    headingFontFamily: "'JetBrains Mono', monospace",
    bodyFontFamily: "'JetBrains Mono', monospace",
    monoFontFamily: "'JetBrains Mono', monospace",
    headingClass: 'font-display-mono tracking-tight',
  },
};

export const SECTION_TYPE_CATALOG: Array<{
  type: SectionType;
  label: string;
  europassCode: string;
  description: string;
  defaultTitle: string;
  defaultSubtitle: string;
  templateContent: string;
}> = [
  {
    type: 'readme_overview',
    label: 'README.md Overview',
    europassCode: 'EP-01 · Executive Summary',
    description: 'GitHub repository-style presentation with core architecture and mission context.',
    defaultTitle: 'README.md — Executive Summary & Architecture',
    defaultSubtitle: 'Technical profile, distributed systems design philosophy, and verified production metrics',
    templateContent: `> [!NOTE]
> Currently architecting low-latency distributed platforms and mission-critical cloud-native systems.

### Engineering Philosophy

I design resilient platforms combining **strict static typing**, end-to-end distributed tracing, and immutable delivery pipelines.

| Operational Dimension | Architecture Target | Measured Production Impact |
| :--- | :--- | :--- |
| **Availability** | Multi-region active-active | 99.995% annual SLA |
| **P99 Latency** | Edge termination & zero-copy cache | < 16 ms global |
| **CI/CD Throughput** | Automated canary + instant rollback | 45+ daily verified deploys |`,
  },
  {
    type: 'work_experience',
    label: 'Work Experience (Europass)',
    europassCode: 'EP-02 · Employment Record',
    description: 'Chronological employment history with quantified achievements and technologies.',
    defaultTitle: 'Work Experience',
    defaultSubtitle: 'Verifiable track record in software architecture and technical leadership',
    templateContent: `### Principal Systems Architect · CloudScale Europe
**March 2023 – Present** · *Remote (Zurich / London) · Cloud Infrastructure*

Technical lead for real-time telemetry and edge routing engines processing 2.4M events/sec.

- Decreased compute expenditures by **36% annually** ($480k saved) by migrating bottleneck services from Node.js to **Rust** and **Go**.
- Spearheaded company-wide zero-trust service mesh adoption with automated mTLS and OpenTelemetry distributed tracing.
- Mentored 12 staff engineers and authored fundamental system RFCs.

---

### Senior Staff Full-Stack Engineer · FinTech Core
**June 2020 – February 2023** · *Berlin, Germany · SEPA Instant Banking*

- Engineered an idempotent distributed reconciliation ledger on **PostgreSQL** and **Kafka**.
- Built client integration tooling in **TypeScript** and **React**, lowering integration times from 14 days to 4 hours.`,
  },
  {
    type: 'tech_stack',
    label: 'IT Stack & Digital Competences',
    europassCode: 'EP-03 · Technical Competence Matrix',
    description: 'Categorized inventory of languages, frameworks, databases, and infrastructure tools.',
    defaultTitle: 'IT Stack & Technical Ecosystem',
    defaultSubtitle: 'Production technologies grouped by architectural layer and operational maturity',
    templateContent: `| System Layer | Core Technologies | Level / Experience | Production Use Case |
| :--- | :--- | :--- | :--- |
| **Systems Languages** | TypeScript, Rust, Go, SQL, Python | Expert (10+ yrs) | Low-latency daemons, typed APIs, distributed consensus |
| **Frontend & UI** | React 19, Tailwind CSS, Vite, WebAssembly | Expert (8+ yrs) | Real-time consoles, markdown studios, SSG compilers |
| **Data & Storage** | PostgreSQL 17, Redis, ClickHouse, Kafka | Expert (7+ yrs) | Log partitioning, CQRS pipelines, columnar analytics |
| **Infra & DevOps** | Kubernetes, Docker, Terraform, Linux, eBPF | Advanced (7+ yrs) | GitOps pipelines, kernel packet filtering, mTLS mesh |`,
  },
  {
    type: 'projects',
    label: 'Projects & Open Source Portfolio',
    europassCode: 'EP-04 · Open Source & Work Portfolio',
    description: 'Featured production software, open-source repositories, and technical case studies.',
    defaultTitle: 'Featured Projects & Open Source',
    defaultSubtitle: 'Production software, public libraries, and architectural case studies',
    templateContent: `### 01. HyperEdge KV — Distributed In-Memory Cache in Rust
**Repository:** \`github.com/alexturner/hyperedge-kv\` · **License:** Apache-2.0 · **Stars:** 3,120+

High-throughput key-value engine with Redis protocol compatibility and asynchronous WAL persistence via \`io_uring\`.

\`\`\`rust
pub async fn replicate_frame(node: &ClusterNode, payload: &[u8]) -> Result<AckMetrics, EdgeError> {
    let digest = blake3::hash(payload);
    node.broadcast_quorum(digest.as_bytes(), payload).await
}
\`\`\`

---

### 02. ItStack Static Engine (\`my.itstck.com\`)
**Canonical Route:** \`my.itstck.com/@alexturner\` · **Stack:** TypeScript, React 19, Express, SSG

Zero-dependency compiler that outputs 11 KB standalone HTML5 documents with inline critical styles and JSON-LD structured data.`,
  },
  {
    type: 'education',
    label: 'Education & Qualifications (Europass)',
    europassCode: 'EP-05 · EQF Qualifications',
    description: 'University degrees, European Qualifications Framework (EQF) levels, and thesis work.',
    defaultTitle: 'Education and Academic Training',
    defaultSubtitle: 'Official degrees classified under the European Qualifications Framework (EQF)',
    templateContent: `### M.Sc. in Distributed Computing & High Performance Systems
**2016 – 2018** · *Technical University of Munich (TUM)* · **EQF Level:** Level 7 (Master)

- **Master Thesis:** *Adaptive Raft Consensus over Geo-Distributed Networks with Asymmetric Latency* (Grade: 1.0 with Distinction).
- **Core Topics:** Distributed algorithms, compiler design, applied cryptography, operating system internals.

---

### B.Sc. in Computer Science
**2012 – 2016** · *University of Edinburgh* · **EQF Level:** Level 6 (Bachelor)

- First Class Honours in Software Engineering and Computer Architecture.`,
  },
  {
    type: 'languages_cefr',
    label: 'Languages (CEFR Europass A1–C2)',
    europassCode: 'EP-06 · European Language Passport',
    description: 'Standardized Common European Framework of Reference for Languages matrix.',
    defaultTitle: 'Language Competences (CEFR Framework)',
    defaultSubtitle: 'Common European Framework of Reference for Languages (A1 · A2 · B1 · B2 · C1 · C2)',
    templateContent: `| Language | Listening | Reading | Spoken Interaction | Spoken Production | Writing | Certification |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **English** | C2 · Native | C2 · Native | C2 · Native | C2 · Native | C2 · Native | Mother Tongue |
| **German** | C1 | C1 | C1 | B2 | C1 | Goethe-Zertifikat C1 |
| **Spanish** | B2 | B2 | B1 | B1 | B1 | DELE Intermedio B2 |`,
  },
  {
    type: 'certifications',
    label: 'Certifications & Accreditations',
    europassCode: 'EP-07 · Technical Certifications',
    description: 'Verifiable credentials from standards bodies and cloud providers.',
    defaultTitle: 'Certifications & Technical Accreditations',
    defaultSubtitle: 'Industry credentials verifiable through official registry IDs',
    templateContent: `| Certification | Issuing Organization | Validity Period | Verification ID |
| :--- | :--- | :--- | :--- |
| **Certified Kubernetes Security Specialist (CKS)** | CNCF / Linux Foundation | 2024 – 2027 | \`LF-CKS-9941-882\` |
| **AWS Solutions Architect – Professional** | Amazon Web Services | 2023 – 2026 | \`AWS-SAP-441092\` |
| **CISSP – Certified Information Systems Security** | (ISC)² | Active | \`CISSP-773190\` |`,
  },
  {
    type: 'publications',
    label: 'Publications & Speaking',
    europassCode: 'EP-08 · Scientific Outreach',
    description: 'Conference talks, peer-reviewed papers, book chapters, and engineering RFCs.',
    defaultTitle: 'Technical Publications & Conference Talks',
    defaultSubtitle: 'Peer-reviewed articles, international talks, and architectural documentation',
    templateContent: `- **KubeCon Europe Keynote (2025):** *"Eliminating Cold-Starts in Multi-Tenant WebAssembly Workloads on Bare-Metal Nerves"*.
- **ACM Queue Paper (2024):** *"Deterministic Simulation Testing for Distributed Financial Ledgers in Rust and TypeScript"*.
- **Author:** *Designing Resilient Idempotent Systems in Production* (Read by 50,000+ engineers).`,
  },
  {
    type: 'custom',
    label: 'Custom Markdown Section',
    europassCode: 'EP-09 · Flexible Block',
    description: 'Freeform section supporting custom markdown, tables, diagrams, and callouts.',
    defaultTitle: 'Work Principles & Advisory Terms',
    defaultSubtitle: 'Operating guidelines, consulting availability, and collaboration criteria',
    templateContent: `> [!TIP]
> Open for architecture reviews, technical diligence for VC funds, and fractional Staff Engineer advisory.

### Core Operating Tenets

1. **Verifiable Simplicity:** A design is complete not when nothing more can be added, but when no dependency can be removed without compromising security.
2. **Docs as Code:** Every critical system architecture decision is recorded in version-controlled Markdown right next to the source.`,
  },
];
