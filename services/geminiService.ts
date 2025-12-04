import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, SearchAnalysisResult, GroundingChunk, PresidentialProfile } from "../types";

// Initialize Gemini Client
// API Key must be set in the environment variables as API_KEY
// Safely check for process to avoid browser ReferenceErrors
const apiKey = (typeof process !== 'undefined' && process.env && process.env.API_KEY) || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to reliably extract and parse JSON from model output
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

export const analyzeIncidentReport = async (text: string): Promise<AnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }

  const prompt = `
    Analyze this political incident report from Uganda.
    
    Report Text: "${text}"
    
    **INSTRUCTIONS:**
    1. Use Google Search to verify if this incident (or similar events in this location) has been reported in the news or reliable sources.
    2. Extract the following information strictly based on the text and your search findings.
    3. Return ONLY a valid JSON object (no markdown formatting) matching the structure below.

    **JSON Structure:**
    {
      "eventType": "String (e.g., Violence, Arrest, Intimidation, Rally, Unknown)",
      "location": "String (District, Constituency, or Town)",
      "actors": ["String (List of groups/people involved)"],
      "casualties": {
        "deaths": Number,
        "injuries": Number
      },
      "significanceScore": Number (1-10, where 10 is national crisis),
      "summary": "String (Brief 1-sentence summary of the event and verification status)"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No response from Gemini.");
    }

    const data = parseJSON(jsonText) as AnalysisResult;

    // Extract grounding chunks (sources)
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const safeChunks: GroundingChunk[] = Array.isArray(chunks) ? chunks.map((c: any) => ({
        web: c.web ? { uri: c.web.uri, title: c.web.title } : undefined
    })).filter(c => c.web) : [];

    return {
        ...data,
        sources: safeChunks
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const analyzePresidentialCandidate = async (name: string, party: string): Promise<PresidentialProfile | null> => {
  if (!apiKey) {
    return null;
  }

  const prompt = `
    Conduct a deep OSINT analysis on the Ugandan presidential candidate: ${name} (${party}) for the 2026 election.
    
    Use Google Search to find the latest news, manifesto pledges, and controversies.
    
    Then, generate a STRICT JSON response matching the following structure. 
    
    **IMPORTANT: For the 'grandStrategy' field:**
    You are "The Grand Strategist." Synthesize the political wisdom of:
    1. Sun Tzu (The Art of War)
    2. Alexander the Great (Speed & Decisive Action)
    3. Genghis Khan (Mobility & Psychological Warfare)
    4. Napoleon Bonaparte (Concentration of Force)
    5. Scipio Africanus (Adaptability & Studying the Enemy)
    6. Carl von Clausewitz (Center of Gravity)
    7. Hannibal (Asymmetric Tactics)
    8. Erwin Rommel (Momentum & Surprise)
    9. Che Guevara (Guerrilla Warfare & Mobilization)
    10. John Boyd (OODA Loop)
    11. Robert Moses (Bureaucratic Power & Infrastructure)
    
    Create a cohesive 3-step strategy for this specific candidate to win 2026.
    Determine WHY and HOW the win will happen, citing specific ideologies from the list above (e.g., "Applying John Boyd's OODA loop...").

    Output JSON Structure:
    {
      "candidateName": "${name}",
      "party": "${party}",
      "nationalOverview": {
        "totalRegisteredVoters": "Est. 18-19 Million",
        "youthDemographic": "E.g., 75% under 30",
        "keySwingRegions": ["Region 1", "Region 2"],
        "economicMood": "Brief summary of economic sentiment affecting this candidate"
      },
      "campaignStrategy": {
        "latestNews": [
           { "headline": "Recent Headline", "source": "Source Name", "date": "YYYY-MM-DD", "snippet": "Short summary" }
        ],
        "keyChallenges": ["Challenge 1", "Challenge 2", "Challenge 3"],
        "winningStrategy": "General political strategy summary",
        "grandStrategy": "The 200-word deep strategic analysis citing the historical figures."
      },
      "osintBackground": {
        "maritalStatus": "Status",
        "education": "Highest Degree / University",
        "lifestyle": "Description of wealth/lifestyle visibility",
        "controversies": ["Controversy 1", "Controversy 2"],
        "politicalAnalysis": "Strategic Political SitRep: A detailed situation report on their current political standing, vulnerabilities, and momentum."
      },
      "socialPulse": {
        "sentiment": { "positive": 0-100, "neutral": 0-100, "negative": 0-100 },
        "totalMentions": Number,
        "trendingTopics": ["#Topic1", "#Topic2"]
      },
      "politicalHistory": [
        { "year": 2021, "position": "President/MP", "outcome": "Won/Lost", "party": "Party", "votes": Number }
      ],
      "historicalPartyPerformance": [
        { 
          "year": 2021, 
          "winningParty": "Party Name", 
          "voteShare": Number, 
          "turnout": Number, 
          "margin": Number, 
          "results": [ { "party": "NRM", "percentage": 58 }, { "party": "NUP", "percentage": 35 } ] 
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return null;

    const data = parseJSON(jsonText);

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const safeChunks: GroundingChunk[] = Array.isArray(chunks) ? chunks.map((c: any) => ({
        web: c.web ? { uri: c.web.uri, title: c.web.title } : undefined
    })).filter(c => c.web) : [];

    return {
      ...data,
      sources: safeChunks
    };

  } catch (error) {
    console.error("Presidential Analysis Error:", error);
    return null;
  }
};

export const generatePoliticalStrategy = async (
  candidateName: string,
  party: string,
  constituency: string,
  contextData: string
): Promise<{ grandStrategy: string; sitRep: string } | null> => {
  if (!apiKey) {
    return null;
  }

  const prompt = `
    You are "The Grand Strategist," an advanced AI engine synthesizing the political, military, and strategic wisdom of history's greatest minds.

    **Your Council of Strategists:**
    1. **Sun Tzu** (The Art of War)
    2. **Alexander the Great** (Speed & Decisive Action)
    3. **Genghis Khan** (Mobility & Psychological Warfare)
    4. **Napoleon Bonaparte** (Concentration of Force)
    5. **Scipio Africanus** (Adaptability)
    6. **Carl von Clausewitz** (Center of Gravity)
    7. **Hannibal Barca** (Asymmetric Tactics)
    8. **Erwin Rommel** (Momentum)
    9. **Che Guevara** (Guerrilla Warfare)
    10. **John Boyd** (OODA Loop)
    11. **Robert Moses** (Bureaucratic Power)

    **The Mission:**
    Analyze the political battlefield for:
    - **Candidate:** ${candidateName}
    - **Party:** ${party}
    - **Constituency:** ${constituency}
    - **Context:** ${contextData}

    **Directives:**
    1. **SitRep (Situation Report):** Generate a detailed OSINT Political Analysis of the constituency. Identify the incumbent's weakness, the demographic shifts, and the "ground truth" of the political mood.
    2. **Grand Strategy:** Synthesize the wisdom of your council to provide a winning strategy. Quote specific strategists.

    **Output Requirement:**
    Return ONLY a JSON object with this structure:
    {
      "grandStrategy": "The 200-word deep strategic analysis citing the historical figures.",
      "sitRep": "A detailed 150-word Situation Report (SitRep) analyzing the political terrain and candidate's standing."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return null;

    return parseJSON(jsonText);
  } catch (error) {
    console.error("Gemini Strategy Error:", error);
    return null;
  }
};

export const generateDailyOpEd = async (
  incidentsSummary: string,
  candidatePerformanceSummary: string
): Promise<{ title: string; content: string; keyTakeaways: string[] }> => {
  if (!apiKey) {
    return {
      title: "System Offline",
      content: "API Key is missing. Cannot generate daily analysis.",
      keyTakeaways: ["System Offline"]
    };
  }

  const prompt = `
    Act as the Senior Political Analyst for "Salus Intelligence," producing the daily 04:30 AM briefing on the 2026 Ugandan Election.

    **Task:**
    Write a 500-word, narrative-driven analysis entitled "Uganda's 2026 Election: A Tinderbox of NRM Fragility and Opposition Disarray".

    **Tone & Style Guide (Strictly Adhere):**
    - The report must read like a high-stakes intelligence briefing or foreign affairs op-ed.
    - Do NOT use generic subheadings like "Introduction" or "Conclusion". Use narrative flow.
    - Discuss "NRM's Internal Collapse", "NUP's Urban Beachhead", "The Independent Wildfire", and "The Violence Variable".
    - Conclude with "A Controlled Explosion" theme.

    **Data Context:**
    - Recent Incidents: ${incidentsSummary}
    - Candidate Data: ${candidatePerformanceSummary}

    **Output Format (JSON):**
    {
      "title": "The headline",
      "content": "HTML content (<p>, <b>, <strong> only). No markdown headers.",
      "keyTakeaways": ["3 punchy executive summary points"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response text");
    
    return parseJSON(jsonText);
  } catch (error) {
    console.error("Gemini Op-Ed Error:", error);
    return {
      title: "Analysis Unavailable",
      content: "<p>The AI analyst is currently offline or encountered an error processing the daily intelligence feed. Please try again later.</p>",
      keyTakeaways: ["Service Unavailable"]
    };
  }
};

export const generateDeepMindAnalysis = async (query: string): Promise<{
  title: string;
  executiveSummary: string;
  strategicSynthesis: string;
  councilVoices: { strategist: string; quote: string; application: string }[];
  conclusion: string;
} | null> => {
  if (!apiKey) return null;

  const prompt = `
    You are the "Salus Deep Mind", an advanced strategic intelligence engine focused on Ugandan Politics.

    **User Query:** "${query}"

    **The Council of Strategists:**
    You MUST synthesize the ideologies of the following historical figures to answer the query:
    1. **Sun Tzu** (The Art of War - Deception, Knowing the Enemy)
    2. **Chanakya** (Arthashastra - Statecraft, Spies, Ruthless Pragmatism)
    3. **Alexander the Great** (Speed, Decisive Action, Leading from Front)
    4. **Julius Caesar** (Populism, Absolute Power, Crossing the Rubicon)
    5. **Hannibal Barca** (Asymmetric Warfare, Flanking, Endurance)
    6. **Genghis Khan** (Psychological Warfare, Mobility, Meritocracy)
    7. **Che Guevara** (Guerrilla Warfare, Revolution, Ideological Commitment)
    8. **Mahatma Gandhi** (Non-violence, Mass Mobilization, Moral Authority)
    9. **Napoleon Bonaparte** (Grand Strategy, Artillery/Force Concentration, Code)
    10. **Abraham Lincoln** (Preserving the Union, Persistence, Political Timing)

    **Task:**
    1. Analyze the user's political query about Uganda through the lens of these strategists.
    2. Apply their specific maxims to the current Ugandan context (e.g., Museveni's longevity, NUP's youth movement, FDC's transitions).
    3. Generate a structured Intelligence Report.

    **Output JSON Structure:**
    {
      "title": "A decisive, intelligence-style title for the report",
      "executiveSummary": "A 100-word direct answer to the user's question, summarizing the situation.",
      "strategicSynthesis": "A 300-word deep analysis weaving together the different strategic viewpoints. How would Chanakya view the current regime? What would Che suggest to the opposition? How does Sun Tzu explain the military's role?",
      "councilVoices": [
         { 
           "strategist": "Name of Strategist (e.g. Chanakya)", 
           "quote": "A relevant quote or maxim from them.", 
           "application": "How this specific maxim applies to the Uganda situation."
         },
         { 
           "strategist": "Name of Another Strategist", 
           "quote": "...", 
           "application": "..."
         },
         { 
           "strategist": "Name of Another Strategist", 
           "quote": "...", 
           "application": "..."
         }
      ],
      "conclusion": "A final verdict or prediction based on the synthesis."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response text");
    return parseJSON(jsonText);
  } catch (error) {
    console.error("Deep Mind Error:", error);
    return null;
  }
};

export const chatWithAnalyst = async (history: { role: string, parts: { text: string }[] }[], message: string) => {
  if (!apiKey) return "Analyst System Offline: API Key missing.";

  try {
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      history: history,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 32768 },
        systemInstruction: `You are the Salus Intelligence Analyst AI.
        
        Your Mandate:
        1. Strictly answer questions related to Uganda's political landscape, 2026 election, and the data in this dashboard.
        2. Adopt the persona of a seasoned intelligence officer: objective, data-driven, and strategic.
        3. If appropriate, incorporate wisdom from grand strategists (Sun Tzu, Clausewitz, Boyd, etc.) in your answers.`
      }
    });

    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("Chat Error:", error);
    return "Analyst connection interrupted. Please try again.";
  }
};