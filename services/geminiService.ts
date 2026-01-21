
import { GoogleGenAI } from "@google/genai";
import type { ImporterSummary, DetailedImporterResult, Source } from '../types';

const cleanJsonString = (text: string): string => {
    let jsonText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const firstBrace = jsonText.indexOf('{');
    const lastBrace = jsonText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
        jsonText = jsonText.substring(firstBrace, lastBrace + 1);
    }
    return jsonText;
};

const extractSources = (response: any): Source[] => {
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (!chunks) return [];
  return chunks
    .filter((chunk: any) => chunk.web)
    .map((chunk: any) => ({
      uri: chunk.web.uri,
      title: chunk.web.title || chunk.web.uri
    }));
};

async function withRetry<T>(fn: () => Promise<T>, maxRetries: number = 3): Promise<T> {
    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            return await fn();
        } catch (error: any) {
            attempt++;
            if (attempt >= maxRetries) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        }
    }
    throw new Error("Max attempts exceeded.");
}

export const searchImporters = async (params: { query: string; city: string; state: string; industry: string; }): Promise<ImporterSummary[]> => {
  const { query, city, state, industry } = params;
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
      const aiSearchPrompt = `
      High-precision Consignee (CNEE) Search: "${query}" ${city ? `City: ${city}` : ''} ${industry ? `Sector: ${industry}` : ''}.
      Identify legal US importers. Use Port Examiner, USITC, and Census grounding.
      Return JSON: { "importers": [ { "importerName": "Legal Name", "location": "City, State", "primaryCommodities": "...", "lastShipmentDate": "YYYY-MM-DD" } ] }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: aiSearchPrompt,
        config: { tools: [{ googleSearch: {} }] },
      });

      const sources = extractSources(response);
      const parsed = JSON.parse(cleanJsonString(response.text));
      return (parsed.importers || []).map((imp: any) => ({ ...imp, sources }));
  } catch (error) {
      console.error("Search failed:", error);
      return [];
  }
};

export const fetchDetailedImporterData = async (importerName: string, summary?: ImporterSummary): Promise<DetailedImporterResult> => {
  const fetchTask = async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let liveData = [];
    try {
        const scrapeResponse = await fetch(`/api/scrape?query=${encodeURIComponent(importerName)}`);
        const scrapeJson = await scrapeResponse.json();
        liveData = scrapeJson.results || [];
    } catch (e) { console.warn("Vercel Scraper unavailable", e); }

    const prompt = `Deep-audit Consignee (CNEE): '${importerName}'.
    STRICT FILTER: Only include manifest records where this exact entity is the Consignee.
    Include related corporate entities if verified.
    ${summary ? `Additional Context: Known Location: ${summary.location}, Key Commodities: ${summary.primaryCommodities}.` : ''}
    
    JSON SCHEMA:
    {
      "importerName": "${importerName}",
      "location": "...",
      "lastShipmentDate": "YYYY-MM-DD",
      "information": "Brief analytical audit summary.",
      "insights": ["Strategic Insight 1", "Risk Insight 2", "Competitive Insight 3"],
      "shipmentCounts": { "lastMonth": 0, "lastQuarter": 0, "lastYear": 0 },
      "shipmentHistory": [ { "date": "YYYY-MM-DD", "shipper": "...", "origin": "...", "commodity": "...", "volume": "...", "carrier": "...", "bolNumber": "...", "hsCode": "...", "portOfDischarge": "..." } ],
      "shipmentVolumeHistory": [ { "year": 2024, "volume": 1200 }, { "year": 2023, "volume": 1100 }, { "year": 2022, "volume": 950 } ],
      "commodities": "...",
      "contact": { "phone": "...", "email": "...", "website": "...", "address": "..." },
      "riskAssessment": { "financialStability": "...", "regulatoryCompliance": "...", "geopoliticalRisk": "..." },
      "topTradePartners": [ { "country": "...", "tradeVolume": "..." } ],
      "topSuppliers": [ { "name": "...", "location": "...", "product": "..." } ],
      "topCommodityFlows": [ { "name": "...", "percentage": "..." } ]
    }
    
    Raw Manifest Hints: ${JSON.stringify(liveData.slice(0, 10))}
    `;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      },
    });

    const sources = extractSources(response);
    const parsedData = JSON.parse(cleanJsonString(response.text));
    
    return {
      parsedData: {
        ...parsedData,
        sources: [...(parsedData.sources || []), ...sources]
      }
    };
  };

  return await withRetry(fetchTask);
};

export const searchSimilarImporters = async (query: string): Promise<ImporterSummary[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const prompt = `Major competitors for: "${query}". JSON: { "importers": [...] }`;
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] },
    });
    const parsed = JSON.parse(cleanJsonString(response.text));
    return parsed.importers || [];
  } catch (error) { return []; }
};
