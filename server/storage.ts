import { type Translation, type InsertTranslation } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createTranslation(translation: InsertTranslation): Promise<Translation>;
  getRecentTranslations(limit?: number): Promise<Translation[]>;
  getTranslation(id: string): Promise<Translation | undefined>;
}

export class MemStorage implements IStorage {
  private translations: Map<string, Translation>;

  constructor() {
    this.translations = new Map();
  }

  async createTranslation(insertTranslation: InsertTranslation): Promise<Translation> {
    const id = randomUUID();
    const translation: Translation = { 
      ...insertTranslation, 
      id,
      createdAt: new Date(),
      title: insertTranslation.title || null
    };
    this.translations.set(id, translation);
    return translation;
  }

  async getRecentTranslations(limit: number = 10): Promise<Translation[]> {
    const allTranslations = Array.from(this.translations.values());
    return allTranslations
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }

  async getTranslation(id: string): Promise<Translation | undefined> {
    return this.translations.get(id);
  }
}

export const storage = new MemStorage();
