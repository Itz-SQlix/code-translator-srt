import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { translateRequestSchema } from "@shared/schema";
import { translateCode } from "./services/openai";
import { systemMonitor } from "./services/system-monitor";
import { codeExecutor } from "./services/code-executor";

export async function registerRoutes(app: Express): Promise<Server> {
  // Translate code endpoint
  app.post("/api/translate", async (req, res) => {
    try {
      const validatedData = translateRequestSchema.parse(req.body);
      
      if (validatedData.sourceLanguage === validatedData.targetLanguage) {
        return res.status(400).json({ 
          message: "Source and target languages must be different" 
        });
      }

      // Translate using OpenAI
      const translationResult = await translateCode(
        validatedData.sourceCode,
        validatedData.sourceLanguage,
        validatedData.targetLanguage
      );

      // Save translation to storage
      const translation = await storage.createTranslation({
        sourceLanguage: validatedData.sourceLanguage,
        targetLanguage: validatedData.targetLanguage,
        sourceCode: validatedData.sourceCode,
        translatedCode: translationResult.translatedCode,
        title: validatedData.title || `${validatedData.sourceLanguage} to ${validatedData.targetLanguage} translation`,
      });

      res.json({
        translation,
        explanation: translationResult.explanation,
        complexityAnalysis: translationResult.complexityAnalysis,
        performanceComparison: translationResult.performanceComparison
      });
    } catch (error) {
      console.error("Translation error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Translation failed" 
      });
    }
  });

  // Get recent translations
  app.get("/api/translations/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const translations = await storage.getRecentTranslations(limit);
      res.json(translations);
    } catch (error) {
      console.error("Error fetching recent translations:", error);
      res.status(500).json({ message: "Failed to fetch recent translations" });
    }
  });

  // Get specific translation
  app.get("/api/translations/:id", async (req, res) => {
    try {
      const translation = await storage.getTranslation(req.params.id);
      if (!translation) {
        return res.status(404).json({ message: "Translation not found" });
      }
      res.json(translation);
    } catch (error) {
      console.error("Error fetching translation:", error);
      res.status(500).json({ message: "Failed to fetch translation" });
    }
  });

  // System metrics endpoint
  app.get("/api/system/metrics", async (req, res) => {
    try {
      const metrics = await systemMonitor.getSystemMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching system metrics:", error);
      res.status(500).json({ message: "Failed to fetch system metrics" });
    }
  });

  // Performance test endpoint
  app.post("/api/performance/test", async (req, res) => {
    try {
      const { originalCode, originalLanguage, translatedCode, translatedLanguage } = req.body;
      
      if (!originalCode || !originalLanguage || !translatedCode || !translatedLanguage) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      const performanceResult = await codeExecutor.performanceTest(
        originalCode,
        originalLanguage,
        translatedCode,
        translatedLanguage
      );

      res.json(performanceResult);
    } catch (error) {
      console.error("Performance test error:", error);
      res.status(500).json({ message: "Performance test failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
