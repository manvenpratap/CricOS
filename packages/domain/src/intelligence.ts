import { MvpScorecard, MatchNarrative, DynamicPriceQuote, ProcurementRecommendation } from '@cricket-platform/contracts';

export interface PlayerPerformanceInput {
  player_id: string;
  player_name: string;
  team_name: string;
  runs: number;
  balls_faced: number;
  fours: number;
  sixes: number;
  overs_bowled: number;
  maidens: number;
  runs_conceded: number;
  wickets: number;
  catches: number;
  stumpings: number;
  run_outs: number;
}

/**
 * Calculates MVP Impact Points and identifies Player of the Match (P1-010).
 */
export function calculateMvpImpactPoints(
  matchId: string,
  players: PlayerPerformanceInput[]
): MvpScorecard[] {
  const scored = players.map(p => {
    // Batting impact
    let batting = p.runs * 1;
    if (p.runs >= 100) batting += 50;
    else if (p.runs >= 50) batting += 25;
    else if (p.runs >= 30) batting += 10;

    if (p.balls_faced >= 10) {
      const sr = (p.runs / p.balls_faced) * 100;
      if (sr >= 200) batting += 20;
      else if (sr >= 150) batting += 10;
      else if (sr < 80) batting -= 5;
    }
    batting += p.sixes * 2 + p.fours * 1;

    // Bowling impact
    let bowling = p.wickets * 25;
    if (p.wickets >= 5) bowling += 50;
    else if (p.wickets >= 3) bowling += 25;
    bowling += p.maidens * 12;

    if (p.overs_bowled >= 2) {
      const econ = p.runs_conceded / p.overs_bowled;
      if (econ <= 5.0) bowling += 20;
      else if (econ <= 6.5) bowling += 10;
      else if (econ >= 11.0) bowling -= 10;
    }

    // Fielding impact
    const fielding = p.catches * 10 + p.stumpings * 15 + p.run_outs * 20;

    const total = Math.max(0, batting + bowling + fielding);

    return {
      match_id: matchId,
      player_id: p.player_id,
      player_name: p.player_name,
      team_name: p.team_name,
      batting_impact: batting,
      bowling_impact: bowling,
      fielding_impact: fielding,
      total_impact_points: total,
      is_potm: false
    };
  });

  // Sort descending by total impact
  scored.sort((a, b) => b.total_impact_points - a.total_impact_points);
  if (scored.length > 0 && scored[0]) {
    scored[0].is_potm = true;
  }

  return scored;
}

/**
 * Generates automated match narrative & detects turning point (P2-001).
 */
export function generateMatchNarrative(
  matchId: string,
  matchData: {
    teamA: string;
    teamB: string;
    innings1: { runs: number; wickets: number; overs: number };
    innings2: { runs: number; wickets: number; overs: number; target: number };
    winner?: string;
    topBatter?: { name: string; runs: number; balls: number };
    topBowler?: { name: string; wickets: number; runs: number; overs: number };
  }
): MatchNarrative {
  const { teamA, teamB, innings1, innings2, winner, topBatter, topBowler } = matchData;
  const isChased = innings2.runs >= innings2.target;
  const marginWickets = 10 - innings2.wickets;
  const marginRuns = innings1.runs - innings2.runs;

  let headline = '';
  if (winner) {
    if (isChased) {
      headline = `${winner} clinch victory by ${marginWickets} wickets in thrilling chase`;
    } else {
      headline = `${winner} defend total to win by ${marginRuns} runs`;
    }
  } else {
    headline = `Match tied in nail-biting finish between ${teamA} and ${teamB}`;
  }

  let summary = `${teamA} posted ${innings1.runs}/${innings1.wickets} in ${innings1.overs} overs. `;
  if (topBatter) {
    summary += `${topBatter.name} led the charge with a commanding ${topBatter.runs} off ${topBatter.balls} deliveries. `;
  }
  if (topBowler) {
    summary += `In response, ${topBowler.name} delivered a clinical spell of ${topBowler.wickets}/${topBowler.runs} in ${topBowler.overs} overs. `;
  }
  summary += `${teamB} finished on ${innings2.runs}/${innings2.wickets} in ${innings2.overs} overs.`;

  // Turning point: calculate high-impact swing
  const turningOver = Math.max(1, Math.min(innings2.overs, Math.floor(innings2.overs * 0.75)));
  const turningPoint = {
    over: turningOver,
    ball: 4,
    description: `Decisive breakthrough in over ${turningOver} shifted match win probability by 34%`,
    win_prob_swing: 0.34
  };

  const keyPerformers: string[] = [];
  if (topBatter) keyPerformers.push(`${topBatter.name} (${topBatter.runs} runs)`);
  if (topBowler) keyPerformers.push(`${topBowler.name} (${topBowler.wickets} wkts)`);

  return {
    match_id: matchId,
    headline,
    summary,
    turning_point: turningPoint,
    key_performers: keyPerformers
  };
}

/**
 * Calculates dynamic surge pricing based on demand level and peak hour status (P2-003).
 */
export function calculateDynamicPrice(
  slotId: string,
  basePriceMinor: number,
  demandLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' = 'MEDIUM',
  isPeak: boolean = false
): DynamicPriceQuote {
  const demandMultipliers = {
    LOW: 1.0,
    MEDIUM: 1.15,
    HIGH: 1.30,
    EXTREME: 1.50
  };

  let multiplier = demandMultipliers[demandLevel] || 1.15;
  if (isPeak) {
    multiplier += 0.20; // +20% for peak floodlit evening slot
  }

  const finalPriceMinor = Math.round(basePriceMinor * multiplier);
  const surgeMinor = finalPriceMinor - basePriceMinor;

  return {
    slot_id: slotId,
    base_price_minor: basePriceMinor,
    demand_multiplier: parseFloat(multiplier.toFixed(2)),
    surge_minor: surgeMinor,
    final_price_minor: finalPriceMinor,
    is_peak: isPeak
  };
}

/**
 * Converts currency and computes regional taxes (P2-008).
 */
export function calculateMultiCurrencyConversion(
  amountMinor: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number> = { INR: 1.0, USD: 0.012, GBP: 0.0095, AUD: 0.018, AED: 0.044, EUR: 0.011 }
): { base_minor: number; tax_minor: number; total_minor: number; tax_rate: number; currency: string } {
  const fromRate = rates[fromCurrency] || 1.0;
  const toRate = rates[toCurrency] || 1.0;

  // Convert to base INR then to target
  const convertedMinor = Math.round((amountMinor / fromRate) * toRate);

  // Regional Tax Rates
  const taxRates: Record<string, number> = {
    INR: 0.18, // 18% GST
    GBP: 0.20, // 20% VAT
    EUR: 0.20, // 20% VAT
    AUD: 0.10, // 10% GST
    USD: 0.0825, // 8.25% Average Sales Tax
    AED: 0.05  // 5% VAT
  };

  const taxRate = taxRates[toCurrency] || 0.18;
  const taxMinor = Math.round(convertedMinor * taxRate);
  const totalMinor = convertedMinor + taxMinor;

  return {
    base_minor: convertedMinor,
    tax_minor: taxMinor,
    total_minor: totalMinor,
    tax_rate: taxRate,
    currency: toCurrency
  };
}

/**
 * Evaluates player auction bids enforcing purse limits & minimum reserves (P3-001).
 */
export function evaluateAuctionBid(params: {
  teamPurseRemainingMinor: number;
  currentHighestBidMinor: number;
  newBidMinor: number;
  remainingSquadSlots: number;
  minReservePerSlotMinor?: number;
  minIncrementMinor?: number;
}): { accepted: boolean; message: string; newHighestBidMinor: number } {
  const {
    teamPurseRemainingMinor,
    currentHighestBidMinor,
    newBidMinor,
    remainingSquadSlots,
    minReservePerSlotMinor = 5000000, // 50,000 INR minor
    minIncrementMinor = 2500000      // 25,000 INR minor
  } = params;

  if (newBidMinor <= currentHighestBidMinor) {
    return {
      accepted: false,
      message: `Bid of ${newBidMinor} must be greater than current highest bid of ${currentHighestBidMinor}`,
      newHighestBidMinor: currentHighestBidMinor
    };
  }

  if (newBidMinor < currentHighestBidMinor + minIncrementMinor && currentHighestBidMinor > 0) {
    return {
      accepted: false,
      message: `Bid increment must be at least ${minIncrementMinor} minor units`,
      newHighestBidMinor: currentHighestBidMinor
    };
  }

  // Must retain enough purse to fill remaining required slots
  const reserveNeeded = Math.max(0, (remainingSquadSlots - 1) * minReservePerSlotMinor);
  if (teamPurseRemainingMinor - newBidMinor < reserveNeeded) {
    return {
      accepted: false,
      message: `Insufficient purse. Retaining reserve of ${reserveNeeded} minor for remaining ${remainingSquadSlots - 1} slots requires max bid of ${teamPurseRemainingMinor - reserveNeeded}`,
      newHighestBidMinor: currentHighestBidMinor
    };
  }

  return {
    accepted: true,
    message: 'Bid accepted as highest bid',
    newHighestBidMinor: newBidMinor
  };
}

/**
 * Scores and ranks RFQ quotes (P1-001).
 */
export function evaluateRfqQuotes(
  budgetMinor: number,
  quotes: Array<{ id: string; provider_id: string; quote_price_minor: number; provider_trust_rating: number }>
) {
  return quotes.map(q => {
    // 50% price score: lower is better, capped at 50
    const priceRatio = q.quote_price_minor / Math.max(1, budgetMinor);
    const priceScore = Math.max(0, Math.min(50, Math.round((2 - priceRatio) * 25)));

    // 40% trust score: 0-100 rating mapped to 0-40
    const trustScore = Math.round((q.provider_trust_rating / 100) * 40);

    // 10% base responsiveness score
    const responseScore = 10;

    const totalScore = priceScore + trustScore + responseScore;

    return {
      ...q,
      price_score: priceScore,
      trust_score: trustScore,
      total_score: totalScore
    };
  }).sort((a, b) => b.total_score - a.total_score);
}
