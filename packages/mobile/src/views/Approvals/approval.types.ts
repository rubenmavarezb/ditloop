/** Risk level classification for an approval. */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/** Approval record from the server API. */
export interface Approval {
  id: string;
  description: string;
  riskLevel: RiskLevel;
  diff?: string;
  workspace?: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'denied';
}

/** Risk level badge color mapping. */
export const RISK_COLORS: Record<RiskLevel, string> = {
  low: 'bg-green-900 text-green-300',
  medium: 'bg-yellow-900 text-yellow-300',
  high: 'bg-orange-900 text-orange-300',
  critical: 'bg-red-900 text-red-300',
};
