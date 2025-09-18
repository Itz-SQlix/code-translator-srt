import { GoogleGenAI } from "@google/genai";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface CodeTranslationResult {
  translatedCode: string;
  explanation?: string;
  complexityAnalysis?: {
    timeComplexity: string;
    spaceComplexity: string;
    description: string;
  };
  performanceComparison?: {
    originalComplexity: string;
    translatedComplexity: string;
    theoreticalWinner: 'original' | 'translated' | 'equal';
    comparisonReason: string;
  };
}

export async function translateCode(
  sourceCode: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<CodeTranslationResult> {
  const languageMap: Record<string, string> = {
    cpp: "C++",
    python: "Python",
    java: "Java",
    javascript: "JavaScript"
  };

  const sourceLang = languageMap[sourceLanguage] || sourceLanguage;
  const targetLang = languageMap[targetLanguage] || targetLanguage;

  const prompt = `You are an expert programmer and algorithm analyst skilled in multiple programming languages. 

Translate the following ${sourceLang} code to ${targetLang}. 
Maintain the same functionality, logic, and structure while adapting to ${targetLang} best practices and idioms.
Preserve comments and add explanatory comments where the translation requires different approaches.

Source Code (${sourceLang}):
\`\`\`${sourceLanguage}
${sourceCode}
\`\`\`

IMPORTANT: When analyzing complexity, consider the algorithm's behavior with varying input sizes. 
- For loops that iterate a FIXED number of times (like exactly 1000 or 1 million iterations), this is O(1) - constant time.
- For loops that depend on input size n, this is O(n), O(n²), etc.
- Be precise about whether operations scale with input or are fixed.
- If the original and translated algorithms are fundamentally different (e.g., bubble sort vs quicksort), they should have different complexities.
- If they implement the same algorithm with same approach, they should have equal complexity.

Please respond with a JSON object containing:
- "translatedCode": the translated code as a string
- "explanation": a brief explanation of any significant changes or adaptations made during translation
- "complexityAnalysis": an object with:
  - "timeComplexity": the Big O time complexity of the TRANSLATED code (e.g., "O(1)", "O(n)", "O(log n)", "O(n²)")
  - "spaceComplexity": the Big O space complexity of the TRANSLATED code (e.g., "O(1)", "O(n)")
  - "description": a brief explanation of the translated algorithm's complexity and performance characteristics
- "performanceComparison": an object with:
  - "originalComplexity": the Big O time complexity of the ORIGINAL source code  
  - "translatedComplexity": the Big O time complexity of the TRANSLATED code
  - "theoreticalWinner": either "original", "translated", or "equal" based on which has better theoretical performance
  - "comparisonReason": detailed explanation of the complexity comparison and why one is better/worse/equal

Ensure the translated code is complete, functional, and follows ${targetLang} best practices.`;

  try {
    const systemPrompt = `You are an expert code translator and algorithm analyst. 
Analyze the code and translate it accurately while maintaining functionality.
Provide complexity analysis for both the original and translated algorithms and compare their theoretical performance.
Respond with JSON in this format: 
{'translatedCode': 'the translated code as a string', 'explanation': 'brief explanation of changes', 'complexityAnalysis': {'timeComplexity': 'Big O notation for translated code', 'spaceComplexity': 'Big O notation for translated code', 'description': 'explanation of translated code complexity'}, 'performanceComparison': {'originalComplexity': 'Big O of original', 'translatedComplexity': 'Big O of translated', 'theoreticalWinner': 'original/translated/equal', 'comparisonReason': 'explanation of performance comparison'}}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            translatedCode: { type: "string" },
            explanation: { type: "string" },
            complexityAnalysis: {
              type: "object",
              properties: {
                timeComplexity: { type: "string" },
                spaceComplexity: { type: "string" },
                description: { type: "string" },
              },
              required: ["timeComplexity", "spaceComplexity", "description"],
            },
            performanceComparison: {
              type: "object",
              properties: {
                originalComplexity: { type: "string" },
                translatedComplexity: { type: "string" },
                theoreticalWinner: { type: "string", enum: ["original", "translated", "equal"] },
                comparisonReason: { type: "string" },
              },
              required: ["originalComplexity", "translatedComplexity", "theoreticalWinner", "comparisonReason"],
            },
          },
          required: ["translatedCode", "explanation", "complexityAnalysis", "performanceComparison"],
        },
      },
      contents: prompt,
    });

    const rawJson = response.text;

    console.log(`Raw JSON: ${rawJson}`);

    if (rawJson) {
      const data: CodeTranslationResult = JSON.parse(rawJson);
      return data;
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    console.error("Gemini translation error:", error);
    throw new Error(`Failed to translate code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
