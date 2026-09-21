export type ActivityEndReason = 'text-finished' | 'user-stopped';

export type ActivityOutcome =
  | Readonly<{ kind: 'running' }>
  | Readonly<{
      kind: ActivityEndReason;
      committedNfcGraphemeUnits: number;
      totalNfcGraphemeUnits: number;
    }>;

export interface ActivityEndRequest {
  readonly reason: ActivityEndReason;
  readonly started: boolean;
  readonly committedNfcGraphemeUnits: number;
  readonly totalNfcGraphemeUnits: number;
}

export interface ActivityEndTransition {
  readonly accepted: boolean;
  readonly outcome: ActivityOutcome;
}

export const RUNNING_ACTIVITY_OUTCOME: ActivityOutcome = Object.freeze({ kind: 'running' });

function isBoundedPosition(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0;
}

/**
 * Ends one browser-memory activity without creating curriculum or assessment
 * authority. Finishing text requires exact NFC-grapheme exhaustion. A user stop
 * is a distinct terminal result and is valid only after the activity started
 * and before the prompt was exhausted.
 */
export function transitionActivityOutcome(
  current: ActivityOutcome,
  request: ActivityEndRequest
): ActivityEndTransition {
  if (
    current.kind !== 'running' ||
    request.started !== true ||
    !isBoundedPosition(request.committedNfcGraphemeUnits) ||
    !isBoundedPosition(request.totalNfcGraphemeUnits) ||
    request.totalNfcGraphemeUnits === 0 ||
    request.committedNfcGraphemeUnits > request.totalNfcGraphemeUnits
  ) {
    return { accepted: false, outcome: current };
  }

  const accepted =
    request.reason === 'text-finished'
      ? request.committedNfcGraphemeUnits === request.totalNfcGraphemeUnits
      : request.committedNfcGraphemeUnits < request.totalNfcGraphemeUnits;
  if (!accepted) return { accepted: false, outcome: current };

  return {
    accepted: true,
    outcome: Object.freeze({
      kind: request.reason,
      committedNfcGraphemeUnits: request.committedNfcGraphemeUnits,
      totalNfcGraphemeUnits: request.totalNfcGraphemeUnits,
    }),
  };
}

export function activityHasEnded(outcome: ActivityOutcome): boolean {
  return outcome.kind !== 'running';
}

export function activityTextFinished(outcome: ActivityOutcome): boolean {
  return outcome.kind === 'text-finished';
}

export function activityWasUserStopped(outcome: ActivityOutcome): boolean {
  return outcome.kind === 'user-stopped';
}
