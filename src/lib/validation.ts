import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  displayName: z.string().min(2).max(60),
});

export const jobCreateSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(5000),
  categoryId: z.string().min(1),
  estimatedHours: z.number().positive().max(1000),
  price: z.number().positive(),
});

export const applySchema = z.object({
  coverNote: z.string().min(10).max(2000),
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

export const jobQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  sort: z.enum(["newest", "price-asc", "price-desc"]).default("newest"),
});
