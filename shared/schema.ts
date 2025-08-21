import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const translations = pgTable("translations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sourceLanguage: text("source_language").notNull(),
  targetLanguage: text("target_language").notNull(),
  sourceCode: text("source_code").notNull(),
  translatedCode: text("translated_code").notNull(),
  title: text("title"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTranslationSchema = createInsertSchema(translations).omit({
  id: true,
  createdAt: true,
});

export type InsertTranslation = z.infer<typeof insertTranslationSchema>;
export type Translation = typeof translations.$inferSelect;

export const supportedLanguages = ["cpp", "python", "java", "javascript"] as const;
export type SupportedLanguage = typeof supportedLanguages[number];

export const translateRequestSchema = z.object({
  sourceLanguage: z.enum(supportedLanguages),
  targetLanguage: z.enum(supportedLanguages),
  sourceCode: z.string().min(1, "Source code is required"),
  title: z.string().optional(),
});

export type TranslateRequest = z.infer<typeof translateRequestSchema>;
