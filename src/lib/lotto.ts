export const COMBINATIONS = 8_145_060;
export const TICKETS_PER_WEEK = 100;
export const WEEKLY_COST = 100_000;
export const WEEKLY_WIN_PROBABILITY = -Math.expm1(
  TICKETS_PER_WEEK * Math.log1p(-1 / COMBINATIONS),
);
export const EXPECTED_WEEKS = 1 / WEEKLY_WIN_PROBABILITY;
export const PRIZES = [
  0, 2_000_000_000, 50_000_000, 1_500_000, 50_000, 5_000,
] as const;
export type Rank = 0 | 1 | 2 | 3 | 4 | 5;
export type Random = () => number;
export type WeekResult = {
  week: number;
  numbers: number[];
  bonus: number;
  counts: number[];
  bestRank: Rank;
  bestTicket: number[];
  prize: number;
};
export type Simulation = {
  weeks: number;
  counts: number[];
  prize: number;
  latest: WeekResult | null;
  history: WeekResult[];
  wins: WeekResult[];
  won: boolean;
};

export function initialSimulation(): Simulation {
  return {
    weeks: 0,
    counts: [0, 0, 0, 0, 0, 0],
    prize: 0,
    latest: null,
    history: [],
    wins: [],
    won: false,
  };
}

// Rejection sampling gives each distinct 6-number combination equal probability.
// Separate tickets are independent, so duplicate tickets are possible, as in real purchases.
export function pickNumbers(
  count: number,
  random: Random = Math.random,
): number[] {
  const numbers: number[] = [];
  while (numbers.length < count) {
    const number = Math.floor(random() * 45) + 1;
    if (!numbers.includes(number)) numbers.push(number);
  }
  return numbers;
}

export function rankTicket(
  ticket: number[],
  numbers: number[],
  bonus: number,
): Rank {
  const matches = ticket.filter((n) => numbers.includes(n)).length;
  if (matches === 6) return 1;
  if (matches === 5) return ticket.includes(bonus) ? 2 : 3;
  if (matches === 4) return 4;
  if (matches === 3) return 5;
  return 0;
}

export function simulateWeek(
  week: number,
  random: Random = Math.random,
): WeekResult {
  const draw = pickNumbers(7, random);
  const numbers = draw.slice(0, 6).sort((a, b) => a - b);
  const bonus = draw[6];
  const counts = [0, 0, 0, 0, 0, 0];
  let bestRank: Rank = 0;
  let bestTicket: number[] = [];
  let prize = 0;
  for (let i = 0; i < TICKETS_PER_WEEK; i++) {
    const ticket = pickNumbers(6, random);
    const rank = rankTicket(ticket, numbers, bonus);
    counts[rank]++;
    prize += PRIZES[rank];
    if (
      !bestTicket.length ||
      (rank !== 0 && (bestRank === 0 || rank < bestRank))
    ) {
      bestRank = rank;
      bestTicket = ticket.sort((a, b) => a - b);
    }
  }
  return { week, numbers, bonus, counts, bestRank, bestTicket, prize };
}

export function advanceSimulation(
  state: Simulation,
  steps: number,
  random: Random = Math.random,
): Simulation {
  if (state.won) return state;
  const next = {
    ...state,
    counts: [...state.counts],
    history: [...state.history],
    wins: [...state.wins],
  };
  for (let i = 0; i < steps; i++) {
    const result = simulateWeek(next.weeks + 1, random);
    next.weeks++;
    next.latest = result;
    next.prize += result.prize;
    result.counts.forEach((count, rank) => {
      next.counts[rank] += count;
    });
    next.history.unshift(result);
    if (result.bestRank) next.wins.unshift(result);
    if (result.counts[1] > 0) {
      next.won = true;
      break;
    }
  }
  next.history = next.history.slice(0, 60);
  next.wins = next.wins.slice(0, 60);
  return next;
}

export function cumulativeProbability(weeks: number): number {
  return -Math.expm1(weeks * TICKETS_PER_WEEK * Math.log1p(-1 / COMBINATIONS));
}
