import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { generatePublicUserId } from "../src/lib/ids";

const prisma = new PrismaClient();

// typicalHourlyRate = Kenya rate model local base rate (KES/hr), report §5.1:
// Content Writer 219, Graphic Designer 444, Software Dev (mid) 688,
// Data Entry 142, Digital Marketing 438, Video Editor 375 (KES 60,000/mo ÷ 160),
// Customer Support 219 (KES 35,000/mo ÷ 160). Translation has no report row —
// priced at the Content Writer tier.
const CATEGORIES: [string, number][] = [
  ["Writing", 220],
  ["Design", 445],
  ["Development", 690],
  ["Data Entry", 140],
  ["Marketing", 440],
  ["Translation", 220],
  ["Video & Audio", 375],
  ["Customer Support", 220],
];

async function main() {
  for (const [name, typicalHourlyRate] of CATEGORIES) {
    await prisma.category.upsert({
      where: { name },
      update: { typicalHourlyRate },
      create: { name, typicalHourlyRate },
    });
  }

  const passwordHash = await hash("demo1234", 10);
  const demoUsers = [
    { email: "alice@example.com", displayName: "Alice Wanjiku", skills: "writing, editing, blogging", bio: "Content writer with 5 years of experience.", hourlyRate: 300, location: "Nairobi" },
    { email: "bob@example.com", displayName: "Bob Otieno", skills: "development, react, node", bio: "Full-stack developer.", hourlyRate: 800, location: "Kisumu" },
    { email: "carol@example.com", displayName: "Carol Njeri", skills: "design, figma, branding", bio: "Product designer and illustrator.", hourlyRate: 500, location: "Nairobi" },
  ];
  const users = [];
  for (const u of demoUsers) {
    users.push(
      await prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: { ...u, passwordHash, publicUserId: generatePublicUserId() },
      })
    );
  }

  const cat = async (name: string) =>
    (await prisma.category.findUniqueOrThrow({ where: { name } })).id;

  const jobCount = await prisma.job.count();
  if (jobCount === 0) {
    const jobs = [
      { title: "Blog articles for a travel startup", description: "Write 6 SEO-friendly articles (1200 words each) about East African travel destinations.", category: await cat("Writing"), estimatedHours: 24, price: 6000, paymentType: "FIXED", hourlyRate: null as number | null, posterId: users[1].id },
      { title: "Landing page redesign", description: "Redesign our SaaS landing page in Figma; deliver desktop and mobile frames.", category: await cat("Design"), estimatedHours: 16, price: 8000, paymentType: "FIXED", hourlyRate: null, posterId: users[0].id },
      { title: "Next.js bug fixes", description: "Fix 4 open bugs in our Next.js dashboard (listed in GitHub issues).", category: await cat("Development"), estimatedHours: 10, price: 7500, paymentType: "HOURLY", hourlyRate: 750, posterId: users[2].id },
      { title: "Product data entry (500 SKUs)", description: "Enter 500 products into our e-commerce admin with images and prices.", category: await cat("Data Entry"), estimatedHours: 20, price: 3000, paymentType: "FIXED", hourlyRate: null, posterId: users[1].id },
      { title: "Social media campaign plan", description: "30-day Instagram and Twitter campaign plan for a fintech launch.", category: await cat("Marketing"), estimatedHours: 12, price: 5400, paymentType: "FIXED", hourlyRate: null, posterId: users[0].id },
      { title: "English to Swahili translation", description: "Translate a 20-page user manual from English to Swahili.", category: await cat("Translation"), estimatedHours: 15, price: 3600, paymentType: "FIXED", hourlyRate: null, posterId: users[2].id },
      { title: "Podcast editing (4 episodes)", description: "Edit four 45-minute podcast episodes: noise removal, intro/outro, level matching.", category: await cat("Video & Audio"), estimatedHours: 12, price: 4800, paymentType: "HOURLY", hourlyRate: 400, posterId: users[1].id },
      { title: "Customer support (2 weeks cover)", description: "Answer email and chat tickets for two weeks while our agent is on leave.", category: await cat("Customer Support"), estimatedHours: 60, price: 13200, paymentType: "FIXED", hourlyRate: null, posterId: users[0].id },
    ];
    for (const j of jobs) {
      await prisma.job.create({
        data: { title: j.title, description: j.description, categoryId: j.category, estimatedHours: j.estimatedHours, price: j.price, paymentType: j.paymentType, hourlyRate: j.hourlyRate, posterId: j.posterId },
      });
    }
    const firstJob = await prisma.job.findFirstOrThrow({ where: { title: "Blog articles for a travel startup" } });
    await prisma.application.create({
      data: { jobId: firstJob.id, applicantId: users[0].id, coverNote: "I have written 40+ travel articles; happy to share samples." },
    });
  }
  console.log("Seed complete.");
}

main().finally(() => prisma.$disconnect());
