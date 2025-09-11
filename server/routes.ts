import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMappingRuleSchema, insertMappingConfigurationSchema, mappingFileSchema } from "@shared/schema";
import multer from "multer";

// Extend Express Request type to include file from multer
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Mapping Rules APIs
  app.get("/api/mapping-rules", async (req, res) => {
    try {
      const rules = await storage.getMappingRules();
      res.json(rules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mapping rules" });
    }
  });

  app.post("/api/mapping-rules", async (req, res) => {
    try {
      const validatedData = insertMappingRuleSchema.parse(req.body);
      const rule = await storage.createMappingRule(validatedData);
      res.status(201).json(rule);
    } catch (error) {
      res.status(400).json({ message: "Invalid mapping rule data" });
    }
  });

  app.put("/api/mapping-rules/:id", async (req, res) => {
    try {
      const validatedData = insertMappingRuleSchema.partial().parse(req.body);
      const rule = await storage.updateMappingRule(req.params.id, validatedData);
      if (!rule) {
        return res.status(404).json({ message: "Mapping rule not found" });
      }
      res.json(rule);
    } catch (error) {
      res.status(400).json({ message: "Invalid mapping rule data" });
    }
  });

  app.delete("/api/mapping-rules/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteMappingRule(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Mapping rule not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete mapping rule" });
    }
  });

  app.delete("/api/mapping-rules", async (req: Request, res: Response) => {
    try {
      const deletedCount = await storage.clearAllMappingRules();
      res.json({ 
        message: `Successfully deleted ${deletedCount} mapping rules`,
        deletedCount 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear all mapping rules" });
    }
  });

  // Mapping Configurations APIs
  app.get("/api/mapping-configurations", async (req, res) => {
    try {
      const configurations = await storage.getMappingConfigurations();
      res.json(configurations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mapping configurations" });
    }
  });

  app.get("/api/mapping-configurations/default", async (req, res) => {
    try {
      const defaultConfig = await storage.getDefaultConfiguration();
      if (!defaultConfig) {
        return res.status(404).json({ message: "No default configuration found" });
      }
      res.json(defaultConfig);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch default configuration" });
    }
  });

  app.post("/api/mapping-configurations", async (req, res) => {
    try {
      const validatedData = insertMappingConfigurationSchema.parse(req.body);
      const configuration = await storage.createMappingConfiguration(validatedData);
      res.status(201).json(configuration);
    } catch (error) {
      res.status(400).json({ message: "Invalid mapping configuration data" });
    }
  });

  app.put("/api/mapping-configurations/:id", async (req, res) => {
    try {
      const validatedData = insertMappingConfigurationSchema.partial().parse(req.body);
      const configuration = await storage.updateMappingConfiguration(req.params.id, validatedData);
      if (!configuration) {
        return res.status(404).json({ message: "Mapping configuration not found" });
      }
      res.json(configuration);
    } catch (error) {
      res.status(400).json({ message: "Invalid mapping configuration data" });
    }
  });

  app.delete("/api/mapping-configurations/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteMappingConfiguration(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Mapping configuration not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete mapping configuration" });
    }
  });

  // File Upload for Mapping Configurations
  app.post("/api/mapping-rules/import", upload.single("file"), async (req: MulterRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileContent = req.file.buffer.toString("utf-8");
      let parsedData;

      // Parse based on file extension
      const fileName = req.file.originalname.toLowerCase();
      
      if (fileName.endsWith(".json")) {
        parsedData = JSON.parse(fileContent);
      } else if (fileName.endsWith(".csv")) {
        // Simple CSV parsing for source,target format
        const lines = fileContent.split("\n").filter((line: string) => line.trim());
        const rules = lines.slice(1).map((line: string) => {
          const [sourceChar, targetChar] = line.split(",").map((s: string) => s.trim());
          return { sourceChar, targetChar, caseSensitive: true };
        });
        parsedData = { rules };
      } else if (fileName.endsWith(".txt")) {
        // Simple text parsing for "source = target" format
        const lines = fileContent.split("\n").filter((line: string) => line.trim());
        const rules = lines.map((line: string) => {
          const [sourceChar, targetChar] = line.split("=").map((s: string) => s.trim());
          return { sourceChar, targetChar, caseSensitive: true };
        }).filter((rule: any) => rule.sourceChar && rule.targetChar);
        parsedData = { rules };
      } else {
        return res.status(400).json({ message: "Unsupported file format. Use JSON, CSV, or TXT." });
      }

      const validatedData = mappingFileSchema.parse(parsedData);
      
      // Create mapping rules
      const createdRules = [];
      for (const rule of validatedData.rules) {
        const createdRule = await storage.createMappingRule(rule);
        createdRules.push(createdRule);
      }

      // Create configuration if provided
      let createdConfig = null;
      if (validatedData.configuration) {
        createdConfig = await storage.createMappingConfiguration(validatedData.configuration);
      }

      res.status(201).json({
        rules: createdRules,
        configuration: createdConfig,
        message: `Successfully imported ${createdRules.length} mapping rules`,
      });
    } catch (error) {
      console.error("Import error:", error);
      res.status(400).json({ message: "Failed to parse or import file" });
    }
  });

  // Text Conversion API
  app.post("/api/convert-text", async (req, res) => {
    try {
      const { text, configId } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Text is required" });
      }

      const rules = await storage.getMappingRules();
      const activeRules = rules.filter((rule: any) => rule.isActive);
      
      // Apply Gujarati text normalization first
      const { normalizeGujaratiText } = await import("@shared/text-utils");
      let convertedText = normalizeGujaratiText(text);
      
      // Apply character mappings
      for (const rule of activeRules) {
        const sourceChar = rule.caseSensitive ? rule.sourceChar : rule.sourceChar.toLowerCase();
        const searchText = rule.caseSensitive ? convertedText : convertedText.toLowerCase();
        
        if (rule.caseSensitive) {
          convertedText = convertedText.replaceAll(rule.sourceChar, rule.targetChar);
        } else {
          // Case insensitive replacement
          const regex = new RegExp(rule.sourceChar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
          convertedText = convertedText.replace(regex, rule.targetChar);
        }
      }

      // Apply normalization again to ensure proper character sequences
      convertedText = normalizeGujaratiText(convertedText);

      res.json({
        originalText: text,
        convertedText,
        rulesApplied: activeRules.length,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to convert text" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
