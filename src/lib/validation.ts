import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  displayName: z.string().min(2).max(60),
});

const jobBase = {
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(5000),
  categoryId: z.string().min(1),
  estimatedHours: z.number().positive().max(1000),
};

export const jobCreateSchema = z.discriminatedUnion("paymentType", [
  z.object({ ...jobBase, paymentType: z.literal("FIXED"), price: z.number().positive() }),
  z.object({ ...jobBase, paymentType: z.literal("HOURLY"), hourlyRate: z.number().positive() }),
]);

export const applySchema = z.object({
  name: z.string().min(2).max(60),
  location: z.string().min(2).max(80),
  coverNote: z.string().min(10).max(2000),
  resumeId: z.string().optional(),
});

export const applicationPatchSchema = z.object({
  status: z.enum(["WISHLISTED", "ACCEPTED", "DENIED"]),
});

export const profilePatchSchema = z.object({
  displayName: z.string().min(2).max(60).optional(),
  bio: z.string().max(2000).optional(),
  skills: z.string().max(500).optional(),
  hourlyRate: z.number().min(0).optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  message: z.string().min(10).max(5000),
});

export const messageSchema = z.object({
  body: z.string().min(1).max(2000),
});

export const jobPatchSchema = z.object({
  status: z.enum(["COMPLETED", "CANCELLED"]),
});

export const jobQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  sort: z.enum(["newest", "price-asc", "price-desc"]).default("newest"),
  view: z.enum(["insights"]).optional(),
});
