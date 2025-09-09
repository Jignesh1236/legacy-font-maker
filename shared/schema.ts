import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const mappingRules = pgTable("mapping_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sourceChar: text("source_char").notNull(),
  targetChar: text("target_char").notNull(),
  caseSensitive: boolean("case_sensitive").default(true),
  isActive: boolean("is_active").default(true),
});

export const mappingConfigurations = pgTable("mapping_configurations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  caseSensitivity: text("case_sensitivity").default("sensitive"), // 'sensitive', 'insensitive', 'preserve'
  mappingMode: text("mapping_mode").default("character"), // 'character', 'word', 'pattern'
  outputFormat: text("output_format").default("plain"), // 'plain', 'unicode', 'html'
  isDefault: boolean("is_default").default(false),
});

export const insertMappingRuleSchema = createInsertSchema(mappingRules).omit({
  id: true,
});

export const insertMappingConfigurationSchema = createInsertSchema(mappingConfigurations).omit({
  id: true,
});

export type InsertMappingRule = z.infer<typeof insertMappingRuleSchema>;
export type MappingRule = typeof mappingRules.$inferSelect;

export type InsertMappingConfiguration = z.infer<typeof insertMappingConfigurationSchema>;
export type MappingConfiguration = typeof mappingConfigurations.$inferSelect;

// File upload schema for mapping configurations
export const mappingFileSchema = z.object({
  rules: z.array(z.object({
    sourceChar: z.string().min(1),
    targetChar: z.string().min(1),
    caseSensitive: z.boolean().optional().default(true),
    isActive: z.boolean().optional().default(true),
  })),
  configuration: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    caseSensitivity: z.enum(['sensitive', 'insensitive', 'preserve']).optional().default('sensitive'),
    mappingMode: z.enum(['character', 'word', 'pattern']).optional().default('character'),
    outputFormat: z.enum(['plain', 'unicode', 'html']).optional().default('plain'),
  }).optional(),
});

export type MappingFileData = z.infer<typeof mappingFileSchema>;
