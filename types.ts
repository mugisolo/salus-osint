

export interface OsintReport {
  sourceReliability: 'A - Completely Reliable' | 'B - Usually Reliable' | 'C - Fairly Reliable' | 'D - Not Usually Reliable' | 'E - Unreliable' | 'F - Cannot Be Judged';
  credibilityScore: number; // 0-100
  verifiedSources: string[];
  aiAnalysis: string;
  timeline: { time: string; event: string }[];
}

export interface Incident {
  id: string;
  date: string;
  location: string;
  latitude: number;
  longitude: number;
  type: 'Violence' | 'Protest' | 'Arrest' | 'Intimidation' | 'Rally';
  fatalities: number;
  injuries: number;
  description: string;
  verified: boolean;
  osintReport?: OsintReport;
}

export interface Candidate {
  id: string;
  name: string;
  party: string;
  district: string;
  sentimentScore: number; // 0 to 100
  mentions: number;
  projectedVoteShare: number;
  imageUrl: string;
  notes?: string;
}

export interface ParliamentaryCandidate {
  id: string;
  name: string;
  constituency: string;
  party: string;
  category: 'Woman MP' | 'Constituency' | 'Special Interest';
  sentimentScore: number; // 0-100
  projectedVoteShare: number; // 0-100
  mentions: number;
  coordinates?: [number, number]; // Lat, Lng for map
}

export interface PartyResult {
  party: string;
  percentage: number;
}

export interface ElectionTrend {
  year: number;
  winningParty: string;
  voteShare: number;
  turnout: number;
  margin: number;
  results: PartyResult[];
}

export interface CandidatePastResult {
  year: number;
  position: string;
  outcome: 'Won' | 'Lost' | 'Nominated';
  party: string;
  votes?: number;
}

export interface SocialMediaPoll {
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  totalMentions: number;
  trendingTopics: string[];
}

export interface OSINTBackground {
  maritalStatus: string;
  education: string;
  lifestyle: string;
  controversies: string[];
  politicalAnalysis: string;
  digitalFootprint: string;
  financialIntel: string;
  networkMap: string[];
}

export interface NewsItem {
  headline: string;
  source: string;
  date: string;
  snippet: string;
}

export interface CampaignStrategy {
  latestNews: NewsItem[];
  keyChallenges: string[];
  winningStrategy: string;
  grandStrategy?: string; // For the "Machiavelli/Sun Tzu" output
}

export interface ConstituencyProfile {
  constituency: string;
  region: string;
  demographics: {
    totalPopulation: string;
    registeredVoters: string;
    youthPercentage: number;
    urbanizationRate: number;
  };
  socioEconomic: {
    primaryActivity: string;
    povertyIndex: string;
    literacyRate: number;
    accessToElectricity: number;
  };
  historical: {
    previousWinner: string; // Party
    margin2021: string;
    voterTurnout: string;
    incumbentStatus: 'Open Seat' | 'Defended' | 'Contested';
  };
  electionTrend: ElectionTrend[];
  candidateHistory: CandidatePastResult[];
  socialMediaPoll: SocialMediaPoll;
  osintBackground: OSINTBackground;
  campaignStrategy: CampaignStrategy;
}

// New Interface for Presidential Deep Dive
export interface PresidentialProfile {
  candidateName: string;
  party: string;
  nationalOverview: {
    totalRegisteredVoters: string;
    youthDemographic: string; // e.g. "75% under 30"
    keySwingRegions: string[];
    economicMood: string;
  };
  campaignStrategy: CampaignStrategy;
  osintBackground: OSINTBackground;
  socialPulse: SocialMediaPoll;
  politicalHistory: CandidatePastResult[];
  historicalPartyPerformance: ElectionTrend[]; // National trends for their party
  sources: GroundingChunk[];
}

export interface SitRep {
  id?: string;
  date: string;
  title: string;
  content: string;
  keyTakeaways: string[];
  timestamp: number;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface AnalysisResult {
  eventType: string;
  location: string;
  actors: string[];
  casualties: {
    deaths: number;
    injuries: number;
  };
  significanceScore: number;
  summary: string;
  sources?: GroundingChunk[];
}

export interface SearchAnalysisResult {
  markdown: string;
  sources: GroundingChunk[];
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  VIOLENCE_MAP = 'VIOLENCE_MAP',
  ELECTION_MAP = 'ELECTION_MAP',
  CANDIDATES = 'CANDIDATES',
  ANALYSIS = 'ANALYSIS',
  PARLIAMENTARY = 'PARLIAMENTARY',
  DAILY_OPED = 'DAILY_OPED',
}
