import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTestResultSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/results", async (req, res) => {
    try {
      const validatedData = insertTestResultSchema.parse(req.body);
      const result = await storage.saveTestResult(validatedData);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: "Invalid request data" });
    }
  });

  app.get("/api/results/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const results = await storage.getTestResultsByUserId(userId);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch results" });
    }
  });

  app.get("/api/results/detail/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.getTestResult(id);
      if (!result) {
        return res.status(404).json({ error: "Result not found" });
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch result" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
