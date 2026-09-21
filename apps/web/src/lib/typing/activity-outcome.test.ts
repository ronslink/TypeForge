import { describe, expect, it } from 'vitest';
import {
  RUNNING_ACTIVITY_OUTCOME,
  activityHasEnded,
  activityTextFinished,
  activityWasUserStopped,
  transitionActivityOutcome,
  type ActivityEndReason,
} from './activity-outcome';

function end(
  reason: ActivityEndReason,
  committedNfcGraphemeUnits: number,
  totalNfcGraphemeUnits: number,
  started = true
) {
  return transitionActivityOutcome(RUNNING_ACTIVITY_OUTCOME, {
    reason,
    started,
    committedNfcGraphemeUnits,
    totalNfcGraphemeUnits,
  });
}

describe('activity outcome truth boundary', () => {
  it('accepts text-finished only at exact nonempty NFC-grapheme exhaustion', () => {
    const transition = end('text-finished', 12, 12);

    expect(transition).toEqual({
      accepted: true,
      outcome: {
        kind: 'text-finished',
        committedNfcGraphemeUnits: 12,
        totalNfcGraphemeUnits: 12,
      },
    });
    expect(activityHasEnded(transition.outcome)).toBe(true);
    expect(activityTextFinished(transition.outcome)).toBe(true);
    expect(activityWasUserStopped(transition.outcome)).toBe(false);
  });

  it('accepts a user stop only after start and before exact text exhaustion', () => {
    for (const committed of [0, 1, 11]) {
      const transition = end('user-stopped', committed, 12);
      expect(transition.accepted).toBe(true);
      expect(transition.outcome).toEqual({
        kind: 'user-stopped',
        committedNfcGraphemeUnits: committed,
        totalNfcGraphemeUnits: 12,
      });
      expect(activityWasUserStopped(transition.outcome)).toBe(true);
      expect(activityTextFinished(transition.outcome)).toBe(false);
    }
  });

  it.each([
    ['not started', 'user-stopped' as const, 0, 12, false],
    ['partial text-finished', 'text-finished' as const, 11, 12, true],
    ['exhausted user stop', 'user-stopped' as const, 12, 12, true],
    ['empty prompt', 'text-finished' as const, 0, 0, true],
    ['negative position', 'user-stopped' as const, -1, 12, true],
    ['position beyond total', 'text-finished' as const, 13, 12, true],
    ['fractional position', 'user-stopped' as const, 1.5, 12, true],
  ])('rejects %s', (_name, reason, committed, total, started) => {
    expect(end(reason, committed, total, started)).toEqual({
      accepted: false,
      outcome: RUNNING_ACTIVITY_OUTCOME,
    });
  });

  it('rejects a second terminal transition without changing the first outcome', () => {
    const first = end('user-stopped', 3, 12).outcome;
    const second = transitionActivityOutcome(first, {
      reason: 'text-finished',
      started: true,
      committedNfcGraphemeUnits: 12,
      totalNfcGraphemeUnits: 12,
    });

    expect(second).toEqual({ accepted: false, outcome: first });
  });
});
