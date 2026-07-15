import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { generatePublicUserId } from "../src/lib/ids";

const prisma = new PrismaClient();

const CATEGORIES: [string, number][] = [
  ["Writing", 8],
  ["Design", 10],
  ["Development", 15],
  ["Data Entry", 5],
  ["Marketing", 8],
  ["Translation", 7],
  ["Video & Audio", 10],
  ["Customer Support", 6],
];

async function main() {
  for (const [name, minHourlyRate] of CATEGORIES) {
    await prisma.category.upsert({
      where: { name },
      update: { minHourlyRate },
      create: { name, minHourlyRate },
    });
  }

  const passwordHash = await hash("demo1234", 10);
  const demoUsers = [
    { email: "alice@example.com", displayName: "Alice Wanjiku", skills: "writing, editing, blogging", bio: "Content writer with 5 years of experience.", hourlyRate: 12 },
    { email: "bob@example.com", displayName: "Bob Otieno", skills: "development, react, node", bio: "Full-stack developer.", hourlyRate: 25 },
    { email: "carol@example.com", displayName: "Carol Njeri", skills: "design, figma, branding", bio: "Product designer and illustrator.", hourlyRate: 18 },
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
      { title: "Blog articles for a travel startup", description: "Write 6 SEO-friendly articles (1200 words each) about East African travel destinations.", category: await cat("Writing"), estimatedHours: 24, price: 220, posterId: users[1].id },
      { title: "Landing page redesign", description: "Redesign our SaaS landing page in Figma; deliver desktop and mobile frames.", category: await cat("Design"), estimatedHours: 16, price: 180, posterId: users[0].id },
      { title: "Next.js bug fixes", description: "Fix 4 open bugs in our Next.js dashboard (listed in GitHub issues).", category: await cat("Development"), estimatedHours: 10, price: 160, posterId: users[2].id },
      { title: "Product data entry (500 SKUs)", description: "Enter 500 products into our e-commerce admin with images and prices.", category: await cat("Data Entry"), estimatedHours: 20, price: 110, posterId: users[1].id },
      { title: "Social media campaign plan", description: "30-day Instagram and Twitter campaign plan for a fintech launch.", category: await cat("Marketing"), estimatedHours: 12, price: 100, posterId: users[0].id },
      { title: "English to Swahili translation", description: "Translate a 20-page user manual from English to Swahili.", category: await cat("Translation"), estimatedHours: 15, price: 110, posterId: users[2].id },
      { title: "Podcast editing (4 episodes)", description: "Edit four 45-minute podcast episodes: noise removal, intro/outro, level matching.", category: await cat("Video & Audio"), estimatedHours: 12, price: 130, posterId: users[1].id },
      { title: "Customer support (2 weeks cover)", description: "Answer email and chat tickets for two weeks while our agent is on leave.", category: await cat("Customer Support"), estimatedHours: 60, price: 380, posterId: users[0].id },
    ];
    for (const j of jobs) {
      await prisma.job.create({
        data: { title: j.title, description: j.description, categoryId: j.category, estimatedHours: j.estimatedHours, price: j.price, posterId: j.posterId },
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
