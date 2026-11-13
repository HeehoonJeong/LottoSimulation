import assert from "node:assert/strict";
import test from "node:test";
import {
  advanceSimulation,
  cumulativeProbability,
  EXPECTED_WEEKS,
  initialSimulation,
  pickNumbers,
  rankTicket,
  simulateWeek,
} from "../src/lib/lotto";

function seededRandom(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

test("all ranks distinguish the bonus number correctly", () => {
  const draw = [1, 2, 3, 4, 5, 6];
  assert.equal(rankTicket(draw, draw, 7), 1);
  assert.equal(rankTicket([1, 2, 3, 4, 5, 7], draw, 7), 2);
  assert.equal(rankTicket([1, 2, 3, 4, 5, 8], draw, 7), 3);
  assert.equal(rankTicket([1, 2, 3, 4, 7, 8], draw, 7), 4);
  assert.equal(rankTicket([1, 2, 3, 7, 8, 9], draw, 7), 5);
  assert.equal(rankTicket([1, 2, 7, 8, 9, 10], draw, 7), 0);
});

test("each week has 100 tickets and a distinct, valid draw", () => {
  const random = seededRandom(42);
  for (let i = 0; i < 100; i++) {
    const sample = pickNumbers(6, random);
    assert.equal(new Set(sample).size, 6);
    assert.ok(sample.every((n) => n >= 1 && n <= 45));
    const week = simulateWeek(i + 1, random);
    assert.equal(
      week.counts.reduce((a, b) => a + b, 0),
      100,
    );
    assert.equal(new Set([...week.numbers, week.bonus]).size, 7);
  }
});

test("accelerated simulation preserves results and bounds history", () => {
  const randomA = seededRandom(123);
  const randomB = seededRandom(123);
  const batched = advanceSimulation(initialSimulation(), 120, randomA);
  let individual = initialSimulation();
  for (let i = 0; i < 120; i++)
    individual = advanceSimulation(individual, 1, randomB);
  assert.deepEqual(batched, individual);
  assert.equal(batched.history.length, 60);
  assert.equal(
    batched.counts.reduce((a, b) => a + b, 0),
    batched.weeks * 100,
  );
});

test("jackpot stops at the winning week even in a batch", () => {
  let index = 0;
  const random = () => {
    const position = index++;
    return ((position < 7 ? position : (position - 7) % 6) + 0.5) / 45;
  };
  const state = advanceSimulation(initialSimulation(), 100, random);
  assert.equal(state.won, true);
  assert.equal(state.weeks, 1);
  assert.equal(state.counts[1], 100);
  assert.equal(state.prize, 200_000_000_000);
  assert.equal(advanceSimulation(state, 100), state);
});

test("probability uses independent tickets, and the mean is not a guarantee", () => {
  assert.equal(cumulativeProbability(0), 0);
  assert.ok(EXPECTED_WEEKS > 81450 && EXPECTED_WEEKS < 81452);
  assert.ok(cumulativeProbability(EXPECTED_WEEKS) > 0.63);
  assert.ok(cumulativeProbability(EXPECTED_WEEKS) < 0.64);
  assert.ok(cumulativeProbability(1_000_000) < 1);
});
