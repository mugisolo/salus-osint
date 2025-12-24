import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AnalysisResult, SearchAnalysisResult, GroundingChunk, PresidentialProfile, ConstituencyProfile, Incident, Candidate } from "../types";

// Initialize Gemini Client
// Use process.env.API_KEY string directly when initializing the @google/genai client instance
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseJSON = (text: string): any => {
  try {
    let clean = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const firstBrace = clean.indexOf('{');
    const lastBrace = clean.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
        clean = clean.substring(firstBrace, lastBrace + 1);
    }
    return JSON.parse(clean);
  } catch (error) {
    console.error("JSON Parse Error:", error);
    throw error;
  }
};

async function retryOperation<T>(
  operation: () => Promise<T>, 
  maxRetries: number = 3, 
  delay: number = 2000
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    if (maxRetries <= 0) throw error;
    console.warn(`Gemini API request failed. Retrying in ${delay}ms... (${maxRetries} attempts left). Error: ${error.message}`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryOperation(operation, maxRetries - 1, delay * 2);
  }
}

export const syncLatestOSINT = async (): Promise<{ incidents: Incident[], candidates: Partial<Candidate>[] }> => {
  const prompt = `
    Perform a high-precision OSINT crawl for Ugandan political developments.
    
    **STRICT CONSTRAINTS:**
    1. Only return data from the LAST 90 DAYS.
    2. ABSOLUTELY NO DATA FROM 2024. Only events occurring in JANUARY and FEBRUARY 2025.
    
    **Research Tasks:**
    1. Find significant political incidents: Protests (e.g., regarding coffee bill/UCDA), arrests of political activists, NUP/PLU mobilization clashes, and security operations.
    2. Extract 2025 voter sentiment scores (0-100) and mention counts for candidates: Museveni (NRM), Bobi Wine (NUP), and Muhoozi Kainerugaba (PLU/NRM).

    **Return ONLY a valid JSON object with this structure:**
    {
      "incidents": [
        {
          "id": "osint-2025-X",
          "date": "2025-MM-DD",
          "location": "District Name",
          "type": "Violence | Protest | Arrest | Intimidation | Rally",
          "fatalities": 0,
          "injuries": 0,
          "description": "Specific detail of what happened based on Jan/Feb 2025 news reports",
          "verified": true,
          "latitude": 0.0,
          "longitude": 0.0,
          "osintReport": {
            "sourceReliability": "A-F",
            "credibilityScore": 0-100,
            "verifiedSources": ["Source 1", "Source 2"],
            "aiAnalysis": "Brief forensic summary",
            "timeline": [{"time": "HH:MM", "event": "Detail"}]
          }
        }
      ],
      "candidates": [
        {
          "name": "Candidate Name",
          "sentimentScore": 0-100,
          "mentions": 0
        }
      ]
    }
  `;

  try {
    const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 16000 }
      }
    }));

    const result = parseJSON(response.text);
    return {
        incidents: Array.isArray(result.incidents) ? result.incidents : [],
        candidates: Array.isArray(result.candidates) ? result.candidates : []
    };
  } catch (error) {
    console.error("OSINT Sync Error:", error);
    throw error;
  }
};

export const analyzeIncidentReport = async (text: string): Promise<AnalysisResult> => {
  // Use process.env.API_KEY directly as per guidelines
  if (!process.env.API_KEY) throw new Error("API Key is missing.");
  const prompt = `Analyze this political incident report from Uganda: "${text}"...`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] }
    });
    return parseJSON(response.text);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const analyzePresidentialCandidate = async (name: string, party: string): Promise<PresidentialProfile | null> => {
  // Use process.env.API_KEY directly as per guidelines
  if (!process.env.API_KEY) return null;
  const prompt = `Conduct deep OSINT on: ${name} (${party}). Focus on early 2025 data.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] }
    });
    const data = parseJSON(response.text);
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const safeChunks: GroundingChunk[] = Array.isArray(chunks) ? chunks.map((c: any) => ({
        web: c.web ? { uri: c.web.uri, title: c.web.title } : undefined
    })).filter(c => c.web) : [];

    return { ...data, sources: safeChunks };
  } catch (error) {
    return null;
  }
};

export const generatePoliticalStrategy = async (
  candidateName: string, 
  party: string, 
  constituency: string, 
  contextData: string
): Promise<{ grandStrategy: string; sitRep: string; osintBackground?: any } | null> => {
  const prompt = `Strategy for ${candidateName} in ${constituency} based on 2025 terrain.`;
  try {
    const response = await ai.models.generateContent({ 
      model: 'gemini-3-pro-preview', 
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 4000 } }
    });
    return parseJSON(response.text);
  } catch (error) {
    return null;
  }
};

export const generateDailyOpEd = async (incSum: string, candSum: string): Promise<{ title: string; content: string; keyTakeaways: string[] }> => {
  const prompt = `Write a SitRep for Uganda FEB 2025. Incidents: ${incSum}, Candidates: ${candSum}. JSON output.`;
  try {
    const response = await ai.models.generateContent({ 
      model: 'gemini-3-pro-preview', 
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 4000 } }
    });
    const result = parseJSON(response.text);
    return {
        title: result.title || "Report",
        content: result.content || "",
        keyTakeaways: Array.isArray(result.keyTakeaways) ? result.keyTakeaways : []
    };
  } catch (error) {
    return { title: "Error", content: "Failed to generate", keyTakeaways: [] };
  }
};

export const generateDeepMindAnalysis = async (query: string): Promise<any> => {
  const prompt = `Salus Deep Mind analysis for: ${query}. Focus on 2025 context.`;
  try {
    const response = await ai.models.generateContent({ 
      model: 'gemini-3-pro-preview', 
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 8000 } }
    });
    const result = parseJSON(response.text);
    return {
        ...result,
        councilVoices: Array.isArray(result.councilVoices) ? result.councilVoices : []
    };
  } catch (error) {
    return null;
  }
};

export const chatWithAnalyst = async (history: any[], message: string) => {
  try {
    const chat = ai.chats.create({ 
      model: 'gemini-3-pro-preview', 
      history,
      config: { systemInstruction: "You are the Salus Intel Analyst (2025 Edition)." }
    });
    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    return "Analyst unavailable.";
  }
};