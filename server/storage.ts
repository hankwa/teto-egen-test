import { testResults, type TestResult, type InsertTestResult } from "@shared/schema";
import { db } from "./db";
import { desc, eq } from "drizzle-orm";

export interface IStorage {
  saveTestResult(result: InsertTestResult): Promise<TestResult>;
  getTestResultsByUserId(userId: string): Promise<TestResult[]>;
  getTestResult(id: number): Promise<TestResult | undefined>;
}

export class DatabaseStorage implements IStorage {
  async saveTestResult(result: InsertTestResult): Promise<TestResult> {
    const [testResult] = await db
      .insert(testResults)
      .values(result)
      .returning();
    return testResult;
  }

  async getTestResultsByUserId(userId: string): Promise<TestResult[]> {
    return await db
      .select()
      .from(testResults)
      .where(eq(testResults.userId, userId))
      .orderBy(desc(testResults.createdAt));
  }

  async getTestResult(id: number): Promise<TestResult | undefined> {
    const [result] = await db
      .select()
      .from(testResults)
      .where(eq(testResults.id, id));
    return result || undefined;
  }
}

export const storage = new DatabaseStorage();
