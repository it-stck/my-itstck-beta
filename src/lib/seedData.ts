import { UserProfile } from '../types';

export const HERO_WORKSPACE_IMAGE = '/src/assets/images/hero_workspace_display_1790802537062.jpg';

export const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'usr-alex-turner',
    username: 'alexturner',
    displayName: 'Alex Turner',
    headline: 'Principal Distributed Systems Architect',
    roleCategory: 'Full-Stack',
    bio: 'Systems architect specializing in high-throughput SaaS platforms, static site compilers (SSG), low-latency database engines, and production Rust & TypeScript ecosystems.',
    location: 'London, United Kingdom',
    timezone: 'UTC / BST',
    company: 'ItStack Core Engineering',
    avatarUrl: '/src/assets/images/avatar_alex_turner_1790802548314.jpg',
    availability: 'open_to_work',
    verifiedProviders: ['github', 'microsoft', 'google'],
    primaryProvider: 'github',
    primaryStack: ['TypeScript', 'Rust', 'React 19', 'PostgreSQL', 'Kubernetes', 'Go', 'Linux'],
    themeId: 'obsidian-slate',
    fontPairingId: 'syne-jakarta',
    layoutMode: 'split-cv',
    densityMode: 'comfortable',
    showEuropassHeader: true,
    showTableOfContents: true,
    customCss: '',
    isPublished: true,
    lastPublishedAt: '2026-09-30T14:00:00Z',
    staticBuildHash: '9f4a8c1',
    staticBundleSizeKb: 11.4,
    followersCount: 1840,
    followingUsernames: ['elenavance', 'marcuschen', 'sarahjenkins'],
    socialLinks: {
      github: 'https://github.com/alexturner',
      microsoft: 'alex.turner@itstck.com',
      google: 'alexturner.dev@gmail.com',
      linkedin: 'https://linkedin.com/in/alexturner-arch',
      website: 'https://my.itstck.com/@alexturner',
      email: 'alexturner.dev@gmail.com',
      orcid: '0000-0002-8491-3310',
    },
    europassMeta: {
      nationality: 'British & European Union Citizen',
      workPermit: 'UK / EU / Global Remote',
      drivingLicense: 'Full UK / EU Driving License',
      preferredContract: 'Staff / Principal Engineer · Technical Advisory',
      yearsOfExperience: 10,
      europassPassportId: 'EU-PASS-2026-UK-88412',
    },
    analytics: {
      totalViews: 34890,
      uniqueVisitors30d: 8420,
      staticHtmlDownloads: 1240,
      pdfExports: 1680,
      readmeClones: 490,
      avgReadTimeSeconds: 215,
      referrers: [
        { source: 'github.com/alexturner (Profile README)', visits: 18420, conversionRate: '19.4%' },
        { source: 'Direct (my.itstck.com/@alexturner)', visits: 9140, conversionRate: '26.1%' },
        { source: 'LinkedIn Technical Network', visits: 5120, conversionRate: '15.2%' },
        { source: 'Hacker News / Show HN', visits: 2210, conversionRate: '12.8%' },
      ],
    },
    endorsements: [
      {
        skill: 'Distributed Systems & Raft Consensus',
        category: 'Architecture',
        count: 124,
        endorsedByUsernames: ['elenavance', 'marcuschen', 'sarahjenkins'],
      },
      {
        skill: 'TypeScript & Node.js Runtime Architecture',
        category: 'Backend',
        count: 142,
        endorsedByUsernames: ['elenavance', 'sarahjenkins'],
      },
      {
        skill: 'Rust High-Concurrency Services',
        category: 'Backend',
        count: 98,
        endorsedByUsernames: ['marcuschen'],
      },
      {
        skill: 'PostgreSQL Query Tuning & Partitioning',
        category: 'AI & Data',
        count: 81,
        endorsedByUsernames: ['elenavance'],
      },
      {
        skill: 'Kubernetes & Zero-Trust Cloud Security',
        category: 'Cloud & DevOps',
        count: 76,
        endorsedByUsernames: ['elenavance', 'marcuschen'],
      },
    ],
    recommendations: [
      {
        id: 'rec-1',
        authorUsername: 'elenavance',
        authorName: 'Elena Vance',
        authorRole: 'Principal Cloud SRE · Zurich Financial Mesh',
        authorAvatar: '/src/assets/images/avatar_elena_vance_1790802559548.jpg',
        relation: 'Collaborated on multi-region edge architecture',
        content:
          'Alex redesigned our static asset distribution pipeline, dropping P99 global latency from 180ms to 12ms. His mastery of both standardized Europass frameworks and high-concurrency systems is unparalleled.',
        createdAt: '2026-09-15',
      },
      {
        id: 'rec-2',
        authorUsername: 'marcuschen',
        authorName: 'Dr. Marcus Chen',
        authorRole: 'Staff Systems Researcher · Oxide Compute Labs',
        authorAvatar: '/src/assets/images/avatar_marcus_chen_1790802568526.jpg',
        relation: 'Co-author on formal verification whitepaper',
        content:
          'Very few architects balance cryptographic type safety with clean developer product taste. The static compiler powering ItStack is a masterclass in deterministic web generation.',
        createdAt: '2026-08-30',
      },
    ],
    sections: [
      {
        id: 'sec-alex-1',
        type: 'readme_overview',
        title: 'README.md — Executive Summary & Architecture',
        subtitle: 'Live profile synchronized with my.itstck.com/@alexturner and GitHub Profile',
        order: 0,
        isVisible: true,
        span: 'full',
        updatedAt: '2026-09-30',
        content: `> [!NOTE]
> Lead Architect of **ItStack (my.itstck.com)**. Building verifiable developer identity combining the clarity of a GitHub \`README.md\` with the structural rigor of the **Europass CV** standard.

### Audited Production Impact

Over the last decade, I have led engineering teams architecting low-latency platforms, static site compilers (SSG), and tier-1 banking systems.

| Engineering Indicator | Audited Metric | Production Context |
| :--- | :--- | :--- |
| **Processed Traffic** | 5.1B requests / month | Edge routing and static mesh across 32 points of presence |
| **SSG Build Time** | 12 ms / profile | Zero-dependency compiler with critical inline CSS |
| **Historical Availability** | 99.996% uptime SLA | Multi-zone Kubernetes clusters with automated health failover |
| **Cloud Cost Reduction** | -38% ($520k / year) | Rewrote memory-heavy workers into compiled Rust and Go binaries |`,
      },
      {
        id: 'sec-alex-2',
        type: 'work_experience',
        title: 'Work Experience (Europass Framework)',
        subtitle: 'Chronological timeline of technical leadership and production delivery',
        order: 1,
        isVisible: true,
        span: 'full',
        updatedAt: '2026-09-29',
        content: `### Principal Software Architect & Founder · ItStack (my.itstck.com)
**January 2024 – Present** · *London, UK · Developer Platforms & Identity*

Architected the end-to-end social network and static resume generator for software engineers.

- Designed the hybrid **Markdown + Europass Schema** engine compiling complete user profiles into autonomous HTML files under \`12 KB\`.
- Integrated federated OAuth 2.0 (**GitHub**, **Microsoft Entra ID**, **Google Cloud Identity**) with zero-trust session management.
- Built the live theme and typography studio with deterministic \`/@user\` and \`/u/user\` routing.

---

### Staff Distributed Systems Engineer · FinMesh Clearing Europe
**March 2021 – December 2023** · *Zurich / London (Remote) · SEPA Instant Banking*

- Led an 18-engineer team delivering the real-time interbank settlement ledger on **Rust**, **TypeScript**, and **PostgreSQL**.
- Implemented zero-downtime declarative partitioning and logical replication for datasets exceeding **9TB**.
- Enforced strict ISO-27001 and DORA banking regulatory compliance.`,
      },
      {
        id: 'sec-alex-3',
        type: 'tech_stack',
        title: 'IT Stack & Technical Ecosystem',
        subtitle: 'Production technologies grouped by architectural layer and years of experience',
        order: 2,
        isVisible: true,
        span: 'half',
        updatedAt: '2026-09-28',
        content: `| Domain | Production Technologies | Level / Experience | Key Production Focus |
| :--- | :--- | :--- | :--- |
| **Languages** | TypeScript 7, Rust, Go, SQL, Python | Expert (10 yrs) | Compilers, low-latency daemons, typed APIs |
| **Frontend & UI** | React 19, Tailwind CSS v4, HTML5, WebWorkers | Expert (9 yrs) | Real-time live markdown editors, SSG generators |
| **Storage & Data** | PostgreSQL 17, Redis, ClickHouse, Apache Kafka | Expert (8 yrs) | Event sourcing, columnar analytics, distributed cache |
| **Cloud & Security** | Kubernetes, Docker, Terraform, Linux, eBPF | Advanced (8 yrs) | GitOps pipelines, mTLS mesh, zero-trust policies |`,
      },
      {
        id: 'sec-alex-4',
        type: 'projects',
        title: 'Featured Projects & Open Source',
        subtitle: 'Production software, open-source compilers, and architectural case studies',
        order: 3,
        isVisible: true,
        span: 'half',
        updatedAt: '2026-09-27',
        content: `### 01. ItStack Static Compiler (\`my.itstck.com\`)
**Route:** \`my.itstck.com/@alexturner\` · **Stack:** TypeScript, React 19, Express, SSG

Instant publishing engine transforming modular Europass blocks and GitHub Flavored Markdown into self-contained HTML5 documents ready for CDN distribution or single-file download.

\`\`\`typescript
export function resolveCanonicalRoute(handle: string): { atRoute: string; uRoute: string } {
  const clean = handle.replace(/^(@|\/u\/)/, '').toLowerCase();
  return {
    atRoute: \`https://my.itstck.com/@\${clean}\`,
    uRoute: \`https://my.itstck.com/u/\${clean}\`,
  };
}
\`\`\`

---

### 02. ZeroLag WAL Replicator
**Repository:** \`github.com/alexturner/zerolag-wal\` · **License:** MIT · **3,540 Stars**

Lightweight Rust daemon capturing PostgreSQL Write-Ahead Log events and replicating frames to edge read replicas with sub-millisecond propagation latency.`,
      },
      {
        id: 'sec-alex-5',
        type: 'education',
        title: 'Education & Qualifications (EQF Framework)',
        subtitle: 'University degrees classified under the European Qualifications Framework',
        order: 4,
        isVisible: true,
        span: 'half',
        updatedAt: '2026-09-20',
        content: `### M.Sc. in Distributed Computing & High Performance Systems
**2016 – 2018** · *Technical University of Munich (TUM)* · **EQF Level:** Level 7

- **Master Thesis:** *Adaptive Raft Consensus over Geo-Distributed Networks with Asymmetric Latency* (Grade: 1.0 with Distinction).

---

### B.Sc. in Computer Science
**2012 – 2016** · *University of Edinburgh* · **EQF Level:** Level 6

- First Class Honours in Software Engineering and Computer Architecture.`,
      },
      {
        id: 'sec-alex-6',
        type: 'languages_cefr',
        title: 'Language Competences (CEFR Framework)',
        subtitle: 'Standardized assessment following the Common European Framework of Reference',
        order: 5,
        isVisible: true,
        span: 'half',
        updatedAt: '2026-09-18',
        content: `| Language | Listening | Reading | Spoken Interaction | Spoken Production | Writing | Certification |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **English** | Native | Native | Native | Native | Native | Mother Tongue |
| **German** | C1 | C1 | C1 | B2 | C1 | Goethe-Zertifikat C1 |
| **Spanish** | B2 | B2 | B1 | B1 | B1 | DELE Intermedio B2 |`,
      },
    ],
  },
  {
    id: 'usr-elena-vance',
    username: 'elenavance',
    displayName: 'Elena Vance',
    headline: 'Principal Cloud Infrastructure & eBPF Kernel Architect',
    roleCategory: 'Systems & SRE',
    bio: 'Principal Cloud and SRE architect. Designing Kubernetes clusters with eBPF data planes, zero-trust cryptographic policies, and high-cardinality telemetry across European financial networks.',
    location: 'Zurich, Switzerland',
    timezone: 'CET (UTC+1)',
    company: 'Zurich Financial Mesh',
    avatarUrl: '/src/assets/images/avatar_elena_vance_1790802559548.jpg',
    availability: 'consulting',
    verifiedProviders: ['github', 'microsoft'],
    primaryProvider: 'microsoft',
    primaryStack: ['Go', 'C / eBPF', 'Kubernetes', 'Terraform', 'Prometheus', 'Linux Kernel', 'Rust'],
    themeId: 'europass-swiss',
    fontPairingId: 'jakarta-jetbrains',
    layoutMode: 'split-cv',
    densityMode: 'compact',
    showEuropassHeader: true,
    showTableOfContents: true,
    customCss: '',
    isPublished: true,
    lastPublishedAt: '2026-09-29T18:45:00Z',
    staticBuildHash: '3c8b12e',
    staticBundleSizeKb: 10.2,
    followersCount: 1220,
    followingUsernames: ['alexturner', 'marcuschen'],
    socialLinks: {
      github: 'https://github.com/elenavance',
      microsoft: 'elena.vance@zfm.ch',
      linkedin: 'https://linkedin.com/in/elenavance',
      website: 'https://my.itstck.com/@elenavance',
      email: 'elena.vance@zfm.ch',
    },
    europassMeta: {
      nationality: 'Swiss & Estonian',
      workPermit: 'Swiss Permit C & EU Free Movement',
      drivingLicense: 'Category B',
      preferredContract: 'Principal SRE · Cloud Advisory',
      yearsOfExperience: 11,
      europassPassportId: 'EU-PASS-2026-CH-40912',
    },
    analytics: {
      totalViews: 24320,
      uniqueVisitors30d: 5920,
      staticHtmlDownloads: 740,
      pdfExports: 1120,
      readmeClones: 310,
      avgReadTimeSeconds: 195,
      referrers: [
        { source: 'KubeCon Speaker Directory', visits: 11400, conversionRate: '24.1%' },
        { source: 'github.com/elenavance', visits: 7800, conversionRate: '19.8%' },
      ],
    },
    endorsements: [
      {
        skill: 'eBPF & Linux Kernel Networking',
        category: 'Cloud & DevOps',
        count: 148,
        endorsedByUsernames: ['alexturner', 'marcuschen'],
      },
      {
        skill: 'Multi-Cluster Kubernetes Federation',
        category: 'Cloud & DevOps',
        count: 114,
        endorsedByUsernames: ['alexturner'],
      },
    ],
    recommendations: [],
    sections: [
      {
        id: 'sec-elena-1',
        type: 'readme_overview',
        title: 'README.md — Critical Infrastructure & eBPF Routing',
        subtitle: 'Byzantine fault-tolerant systems and kernel-level network telemetry',
        order: 0,
        isVisible: true,
        span: 'full',
        updatedAt: '2026-09-29',
        content: `> [!IMPORTANT]
> Specializing in eliminating container networking virtualization overhead across 5,000+ node clusters using **Cilium and eBPF XDP**.

| Cluster Benchmark | iptables Default | eBPF Kernel Acceleration |
| :--- | :--- | :--- |
| **Network Throughput (100GbE)** | 42 Gbps | 96.8 Gbps (Zero-Copy) |
| **Inter-Pod P99.9 Latency** | 4.6 ms | 0.26 ms |
| **Sidecar CPU Allocation** | 18 cores / node | 1.2 cores / node |`,
      },
    ],
  },
  {
    id: 'usr-marcus-chen',
    username: 'marcuschen',
    displayName: 'Dr. Marcus Chen',
    headline: 'Staff Systems Researcher & Database Engine Architect',
    roleCategory: 'AI & Distributed',
    bio: 'Database researcher and architect. Ph.D. in Computer Science specializing in formal verification with TLA+, zero-copy storage engines, and deterministic simulation testing.',
    location: 'Amsterdam, Netherlands',
    timezone: 'CET (UTC+1)',
    company: 'Oxide Compute Labs',
    avatarUrl: '/src/assets/images/avatar_marcus_chen_1790802568526.jpg',
    availability: 'focused',
    verifiedProviders: ['github', 'google'],
    primaryProvider: 'github',
    primaryStack: ['Rust', 'C++20', 'TLA+', 'SIMD / AVX-512', 'io_uring', 'Zig', 'Python'],
    themeId: 'paper-editorial',
    fontPairingId: 'instrument-jakarta',
    layoutMode: 'readme-stream',
    densityMode: 'spacious',
    showEuropassHeader: true,
    showTableOfContents: true,
    customCss: '',
    isPublished: true,
    lastPublishedAt: '2026-09-28T14:10:00Z',
    staticBuildHash: '7a2d90f',
    staticBundleSizeKb: 9.6,
    followersCount: 2450,
    followingUsernames: ['alexturner', 'elenavance'],
    socialLinks: {
      github: 'https://github.com/marcuschen',
      google: 'mchen@oxidecompute.nl',
      website: 'https://my.itstck.com/@marcuschen',
      email: 'mchen@oxidecompute.nl',
      orcid: '0000-0001-9920-4412',
    },
    europassMeta: {
      nationality: 'Dutch & European Union',
      workPermit: 'European Union Free Movement',
      preferredContract: 'Research Fellow · Principal Architect',
      yearsOfExperience: 12,
      europassPassportId: 'EU-PASS-2026-NL-11204',
    },
    analytics: {
      totalViews: 38200,
      uniqueVisitors30d: 9140,
      staticHtmlDownloads: 1420,
      pdfExports: 1980,
      readmeClones: 620,
      avgReadTimeSeconds: 270,
      referrers: [
        { source: 'ACM Digital Library / ORCID', visits: 18900, conversionRate: '22.8%' },
        { source: 'github.com/marcuschen', visits: 12400, conversionRate: '18.4%' },
      ],
    },
    endorsements: [
      {
        skill: 'Rust Zero-Copy Storage Engines',
        category: 'Backend',
        count: 182,
        endorsedByUsernames: ['alexturner', 'elenavance'],
      },
      {
        skill: 'TLA+ Formal Verification & Raft',
        category: 'Architecture',
        count: 126,
        endorsedByUsernames: ['alexturner'],
      },
    ],
    recommendations: [],
    sections: [
      {
        id: 'sec-marcus-1',
        type: 'readme_overview',
        title: 'README.md — Storage Engines & Formal Verification',
        subtitle: 'Applied research in deterministic systems and non-volatile memory data structures',
        order: 0,
        isVisible: true,
        span: 'full',
        updatedAt: '2026-09-28',
        content: `> [!NOTE]
> All my consensus storage engines undergo formal verification in **TLA+** and deterministic simulation testing before shipping to production.

\`\`\`rust
pub struct DeterministicWal<S: BlockStorage> {
    epoch: u64,
    crc_ring: [u32; 64],
    storage: S,
}
\`\`\``,
      },
    ],
  },
  {
    id: 'usr-sarah-jenkins',
    username: 'sarahjenkins',
    displayName: 'Sarah Jenkins',
    headline: 'Staff Design Technologist & WebAssembly UI Lead',
    roleCategory: 'Design Systems',
    bio: 'Design systems architect and typographic engine specialist in React 19 and WebAssembly. Author of editorial web primitives and certified WCAG AAA accessibility tools.',
    location: 'San Francisco, CA (Remote EU)',
    timezone: 'PST / UTC-8',
    company: 'Verge Studio & Type Foundry',
    avatarUrl: '/src/assets/images/avatar_sarah_jenkins_1790802579824.jpg',
    availability: 'open_to_work',
    verifiedProviders: ['github', 'google', 'microsoft'],
    primaryProvider: 'google',
    primaryStack: ['TypeScript', 'React 19', 'WebAssembly', 'CSS Houdini', 'Accessibility WCAG', 'Vite'],
    themeId: 'brutalist-mono',
    fontPairingId: 'syne-jakarta',
    layoutMode: 'bento-portfolio',
    densityMode: 'comfortable',
    showEuropassHeader: true,
    showTableOfContents: false,
    customCss: '',
    isPublished: true,
    lastPublishedAt: '2026-09-30T09:15:00Z',
    staticBuildHash: '5e19a4b',
    staticBundleSizeKb: 10.8,
    followersCount: 1940,
    followingUsernames: ['alexturner'],
    socialLinks: {
      github: 'https://github.com/sarahjenkins',
      google: 'sarah@vergestudio.io',
      linkedin: 'https://linkedin.com/in/sarahjenkins-ui',
      website: 'https://my.itstck.com/@sarahjenkins',
      email: 'sarah@vergestudio.io',
    },
    europassMeta: {
      nationality: 'United States & Irish Citizen',
      workPermit: 'US / EU / Global Remote',
      preferredContract: 'Staff Frontend / Design Systems Lead',
      yearsOfExperience: 8,
      europassPassportId: 'EU-PASS-2026-IE-77301',
    },
    analytics: {
      totalViews: 26400,
      uniqueVisitors30d: 6810,
      staticHtmlDownloads: 890,
      pdfExports: 1140,
      readmeClones: 480,
      avgReadTimeSeconds: 180,
      referrers: [
        { source: 'my.itstck.com/explore', visits: 13400, conversionRate: '27.2%' },
        { source: 'github.com/sarahjenkins', visits: 9800, conversionRate: '21.0%' },
      ],
    },
    endorsements: [
      {
        skill: 'Design Tokens & Multi-Brand Architecture',
        category: 'Frontend',
        count: 164,
        endorsedByUsernames: ['alexturner'],
      },
      {
        skill: 'WCAG AAA Accessibility & Keyboard Primitives',
        category: 'Frontend',
        count: 104,
        endorsedByUsernames: ['alexturner', 'elenavance'],
      },
    ],
    recommendations: [],
    sections: [
      {
        id: 'sec-sarah-1',
        type: 'readme_overview',
        title: 'README.md — Design Systems & Typographic Precision',
        subtitle: 'Zero-dependency component architecture and native CSS token compilers',
        order: 0,
        isVisible: true,
        span: 'full',
        updatedAt: '2026-09-30',
        content: `> [!TIP]
> Open to lead Design Systems and Frontend architecture teams in product engineering organizations.

| Delivered System | Adoption Depth | Performance Impact |
| :--- | :--- | :--- |
| **Verge Token Compiler** | 45 production applications | 0 KB CSS-in-JS runtime (100% native variables) |
| **Accessible Grid Primitive** | 1.4M daily active users | Fully certified EN 301 549 / WCAG 2.2 AA+ |`,
      },
    ],
  },
];
