import type { Prisma } from "@prisma/client";
import type { z } from "zod";
import { prisma } from "@/lib/db";
import { jobQuerySchema } from "@/lib/validation";

export type JobQuery = z.infer<typeof jobQuerySchema>;

export function buildJobWhere(query: JobQuery): Prisma.JobWhereInput {
  const where: Prisma.JobWhereInput = { status: "OPEN", hidden: false };
  if (query.q) {
    where.OR = [{ title: { contains: query.q } }, { description: { contains: query.q } }];
  }
  if (query.category) {
    where.category = { name: query.category };
  }
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.price = {
      ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
      ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
    };
  }
  return where;
}

export function buildJobOrderBy(sort: JobQuery["sort"]): Prisma.JobOrderByWithRelationInput {
  if (sort === "price-asc") return { price: "asc" };
  if (sort === "price-desc") return { price: "desc" };
  return { createdAt: "desc" };
}

export async function searchJobs(query: JobQuery) {
  return prisma.job.findMany({
    where: buildJobWhere(query),
    orderBy: buildJobOrderBy(query.sort),
    include: { category: true, poster: { select: { displayName: true } } },
  });
}
