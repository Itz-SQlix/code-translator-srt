import { apiRequest } from "./queryClient";
import type { TranslateRequest } from "@shared/schema";

export interface TranslationResponse {
  translation: {
    id: string;
    sourceLanguage: string;
    targetLanguage: string;
    sourceCode: string;
    translatedCode: string;
    title?: string;
    createdAt?: Date;
  };
  explanation?: string;
  complexityAnalysis?: {
    timeComplexity: string;
    spaceComplexity: string;
    description: string;
  };
}

export async function translateCode(request: TranslateRequest): Promise<TranslationResponse> {
  const response = await apiRequest("POST", "/api/translate", request);
  return response.json();
}

export async function getRecentTranslations(limit: number = 10) {
  const response = await apiRequest("GET", `/api/translations/recent?limit=${limit}`);
  return response.json();
}

export async function getTranslation(id: string) {
  const response = await apiRequest("GET", `/api/translations/${id}`);
  return response.json();
}
