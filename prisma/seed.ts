import { PrismaClient, SectionType } from "@prisma/client";

const prisma = new PrismaClient();

export const DEFAULT_SECTIONS = [
  {
    type: SectionType.HEADER,
    title: "Header",
    content: `# Your Name\n\n**Your Professional Title** · 📍 Your City, Country\n\n📧 you@email.com · 🔗 [Portfolio](https://yoursite.com) · [LinkedIn](https://linkedin.com/in/you)`,
    order: 0,
  },
  {
    type: SectionType.ABOUT,
    title: "About Me",
    content: `## 👋 About Me\n\nWrite a compelling summary about yourself here. What drives you? What are you passionate about? What unique value do you bring?\n\n> "Insert a quote that represents your professional philosophy."`,
    order: 1,
  },
  {
    type: SectionType.SKILLS,
    title: "Skills & Technologies",
    content: `## 🛠️ Skills & Technologies\n\n**Languages**\n\`JavaScript\` \`TypeScript\` \`Python\` \`Rust\`\n\n**Frontend**\n\`React\` \`Next.js\` \`Vue\` \`Tailwind CSS\`\n\n**Backend**\n\`Node.js\` \`FastAPI\` \`PostgreSQL\` \`Redis\`\n\n**DevOps / Cloud**\n\`Docker\` \`Kubernetes\` \`AWS\` \`Terraform\``,
    order: 2,
  },
  {
    type: SectionType.EXPERIENCE,
    title: "Experience",
    content: `## 💼 Experience\n\n### Senior Software Engineer · Acme Corp\n*Jan 2022 – Present · Remote*\n\n- Led development of microservices architecture serving 1M+ users\n- Reduced API latency by 40% through caching and query optimization\n- Mentored 3 junior developers and led weekly code reviews\n\n---\n\n### Software Engineer · Startup Inc\n*Jun 2019 – Dec 2021 · Barcelona, Spain*\n\n- Built the company's core product from 0 to 50k users\n- Implemented CI/CD pipeline reducing deployment time by 60%`,
    order: 3,
  },
  {
    type: SectionType.EDUCATION,
    title: "Education",
    content: `## 🎓 Education\n\n### Bachelor's in Computer Science\n**Universitat Politècnica de Catalunya** · 2015–2019\n\n- Specialization in Distributed Systems\n- GPA: 8.7 / 10\n- Final project: *Real-time collaborative document editor*`,
    order: 4,
  },
  {
    type: SectionType.PROJECTS,
    title: "Projects",
    content: `## 🚀 Projects\n\n### [Project Alpha](https://github.com/you/alpha)\n*TypeScript · React · Node.js · PostgreSQL*\n\nDescription of what this project does and the problem it solves. What makes it interesting?\n\n[![GitHub stars](https://img.shields.io/github/stars/you/alpha)](https://github.com/you/alpha)\n\n---\n\n### [Project Beta](https://github.com/you/beta)\n*Python · FastAPI · Docker*\n\nAnother cool project description here.`,
    order: 5,
  },
  {
    type: SectionType.CERTIFICATIONS,
    title: "Certifications",
    content: `## 📜 Certifications\n\n| Certification | Issuer | Year |\n|---|---|---|\n| AWS Solutions Architect | Amazon Web Services | 2023 |\n| Kubernetes (CKA) | CNCF | 2022 |\n| Google Cloud Professional | Google | 2021 |`,
    order: 6,
  },
  {
    type: SectionType.LANGUAGES,
    title: "Languages",
    content: `## 🌍 Languages\n\n- **Spanish** — Native\n- **English** — C2 (Proficient)\n- **Catalan** — Native\n- **German** — B1 (Intermediate)`,
    order: 7,
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Create a demo admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@itstck.com" },
    update: {},
    create: {
      name: "IT Stack Admin",
      email: "admin@itstck.com",
      username: "admin",
      role: "ADMIN",
      plan: "PRO",
      onboardingCompleted: true,
      profile: {
        create: {
          headline: "Founder & Developer",
          location: "Galicia, Spain",
          bio: "Building IT Stack — the developer portfolio platform.",
          github: "itstck",
          theme: "dark",
          font: "mono",
          accentColor: "#6366f1",
          isPublic: true,
          sections: {
            create: DEFAULT_SECTIONS,
          },
        },
      },
    },
  });

  console.log(`✅ Created admin user: ${admin.email}`);
  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
