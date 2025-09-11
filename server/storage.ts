import { type MappingRule, type InsertMappingRule, type MappingConfiguration, type InsertMappingConfiguration } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Mapping Rules
  getMappingRules(): Promise<MappingRule[]>;
  getMappingRule(id: string): Promise<MappingRule | undefined>;
  createMappingRule(rule: InsertMappingRule): Promise<MappingRule>;
  updateMappingRule(id: string, rule: Partial<InsertMappingRule>): Promise<MappingRule | undefined>;
  deleteMappingRule(id: string): Promise<boolean>;
  clearAllMappingRules(): Promise<number>;
  
  // Mapping Configurations
  getMappingConfigurations(): Promise<MappingConfiguration[]>;
  getMappingConfiguration(id: string): Promise<MappingConfiguration | undefined>;
  createMappingConfiguration(config: InsertMappingConfiguration): Promise<MappingConfiguration>;
  updateMappingConfiguration(id: string, config: Partial<InsertMappingConfiguration>): Promise<MappingConfiguration | undefined>;
  deleteMappingConfiguration(id: string): Promise<boolean>;
  getDefaultConfiguration(): Promise<MappingConfiguration | undefined>;
}

export class MemStorage implements IStorage {
  private mappingRules: Map<string, MappingRule>;
  private mappingConfigurations: Map<string, MappingConfiguration>;
  private initialized: boolean = false;
  private initPromise: Promise<void>;

  constructor() {
    this.mappingRules = new Map();
    this.mappingConfigurations = new Map();
    
    // Initialize with some default mappings
    this.initPromise = this.initializeDefaults();
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      await this.initPromise;
      this.initialized = true;
    }
  }

  private async initializeDefaults() {
    // Create default configuration
    const defaultConfig = await this.createMappingConfiguration({
      name: "Default Configuration",
      description: "Default character mapping configuration",
      caseSensitivity: "sensitive",
      mappingMode: "character",
      outputFormat: "plain",
      isDefault: true,
    });

    // Create some default mapping rules
    await this.createMappingRule({
      sourceChar: "s",
      targetChar: "ક",
      caseSensitive: true,
      isActive: true,
    });

    await this.createMappingRule({
      sourceChar: "a",
      targetChar: "અ",
      caseSensitive: true,
      isActive: true,
    });

    await this.createMappingRule({
      sourceChar: "k",
      targetChar: "ક",
      caseSensitive: true,
      isActive: true,
    });
  }

  // Mapping Rules
  async getMappingRules(): Promise<MappingRule[]> {
    await this.ensureInitialized();
    return Array.from(this.mappingRules.values());
  }

  async getMappingRule(id: string): Promise<MappingRule | undefined> {
    await this.ensureInitialized();
    return this.mappingRules.get(id);
  }

  async createMappingRule(insertRule: InsertMappingRule): Promise<MappingRule> {
    const id = randomUUID();
    const rule: MappingRule = { 
      ...insertRule, 
      id,
      caseSensitive: insertRule.caseSensitive ?? true,
      isActive: insertRule.isActive ?? true
    };
    this.mappingRules.set(id, rule);
    return rule;
  }

  async updateMappingRule(id: string, updateData: Partial<InsertMappingRule>): Promise<MappingRule | undefined> {
    await this.ensureInitialized();
    const existing = this.mappingRules.get(id);
    if (!existing) return undefined;
    
    const updated: MappingRule = { ...existing, ...updateData };
    this.mappingRules.set(id, updated);
    return updated;
  }

  async deleteMappingRule(id: string): Promise<boolean> {
    await this.ensureInitialized();
    return this.mappingRules.delete(id);
  }

  async clearAllMappingRules(): Promise<number> {
    await this.ensureInitialized();
    const count = this.mappingRules.size;
    this.mappingRules.clear();
    return count;
  }

  // Mapping Configurations
  async getMappingConfigurations(): Promise<MappingConfiguration[]> {
    await this.ensureInitialized();
    return Array.from(this.mappingConfigurations.values());
  }

  async getMappingConfiguration(id: string): Promise<MappingConfiguration | undefined> {
    await this.ensureInitialized();
    return this.mappingConfigurations.get(id);
  }

  async createMappingConfiguration(insertConfig: InsertMappingConfiguration): Promise<MappingConfiguration> {
    const id = randomUUID();
    const config: MappingConfiguration = { 
      ...insertConfig, 
      id,
      description: insertConfig.description ?? null,
      caseSensitivity: insertConfig.caseSensitivity ?? "sensitive",
      mappingMode: insertConfig.mappingMode ?? "character",
      outputFormat: insertConfig.outputFormat ?? "plain",
      isDefault: insertConfig.isDefault ?? false
    };
    this.mappingConfigurations.set(id, config);
    return config;
  }

  async updateMappingConfiguration(id: string, updateData: Partial<InsertMappingConfiguration>): Promise<MappingConfiguration | undefined> {
    await this.ensureInitialized();
    const existing = this.mappingConfigurations.get(id);
    if (!existing) return undefined;
    
    const updated: MappingConfiguration = { ...existing, ...updateData };
    this.mappingConfigurations.set(id, updated);
    return updated;
  }

  async deleteMappingConfiguration(id: string): Promise<boolean> {
    await this.ensureInitialized();
    return this.mappingConfigurations.delete(id);
  }

  async getDefaultConfiguration(): Promise<MappingConfiguration | undefined> {
    await this.ensureInitialized();
    return Array.from(this.mappingConfigurations.values()).find(config => config.isDefault);
  }
}

// Make storage persistent across HMR in development
const globalStorage = globalThis as any;
export const storage = globalStorage.__storage ?? (globalStorage.__storage = new MemStorage());
