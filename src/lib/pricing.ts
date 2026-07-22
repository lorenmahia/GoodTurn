import { prisma } from "@/lib/db";
import { median } from "@/lib/rules";

const MEDIAN_MIN_SAMPLE = 3;

/** categoryId -> suggested hourly rate (KES). Median of effective hourly
 *  rates (price/hours for fixed, hourlyRate for hourly) across the
 *  category's jobs; falls back to the seeded typicalHourlyRate below the
 *  minimum sample size. */
export async function categoryMedianRates(): Promise<Record<string, number>> {
  const [categories, jobs] = await Promise.all([
    prisma.category.findMany({ select: { id: true, typicalHourlyRate: true } }),
    prisma.job.findMany({ select: { categoryId: true, price: true, estimatedHours: true, hourlyRate: true, paymentType: true } }),
  ]);

  const byCategory = new Map<string, number[]>();
  for (const job of jobs) {
    const rate = job.paymentType === "HOURLY" && job.hourlyRate ? job.hourlyRate : job.price / job.estimatedHours;
    if (!Number.isFinite(rate) || rate <= 0) continue;
    const list = byCategory.get(job.categoryId) ?? [];
    list.push(rate);
    byCategory.set(job.categoryId, list);
  }

  const result: Record<string, number> = {};
  for (const c of categories) {
    const rates = byCategory.get(c.id) ?? [];
    const m = rates.length >= MEDIAN_MIN_SAMPLE ? median(rates) : null;
    result[c.id] = Math.round(m ?? c.typicalHourlyRate);
  }
  return result;
}
