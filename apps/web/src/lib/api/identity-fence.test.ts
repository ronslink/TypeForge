import { describe, expect, it } from 'vitest';
import {
  INITIAL_IDENTITY_FENCE,
  captureIdentityOperation,
  captureIdentityBoundary,
  identityBoundaryIsCurrent,
  identityIsCurrent,
  identityOperationIsCurrent,
  resolveExactProviderIdentity,
  transitionIdentity,
} from './identity-fence';

describe('authenticated identity generation fence', () => {
  it('invalidates captured work on user, session, sign-out, or unresolved-provider changes', () => {
    const signedInA = transitionIdentity(INITIAL_IDENTITY_FENCE, 'user_a', 'session_a').fence;
    const operationA = captureIdentityOperation(signedInA)!;
    expect(identityOperationIsCurrent(signedInA, 'user_a', 'session_a', operationA)).toBe(true);

    const switchedUser = transitionIdentity(signedInA, 'user_b', 'session_b').fence;
    expect(identityOperationIsCurrent(switchedUser, 'user_b', 'session_b', operationA)).toBe(false);

    const operationB = captureIdentityOperation(switchedUser)!;
    const rotatedSession = transitionIdentity(switchedUser, 'user_b', 'session_c').fence;
    expect(identityOperationIsCurrent(rotatedSession, 'user_b', 'session_c', operationB)).toBe(
      false
    );

    const unresolved = transitionIdentity(rotatedSession, null, null).fence;
    expect(identityIsCurrent(unresolved, null, null)).toBe(false);
    expect(captureIdentityOperation(unresolved)).toBeNull();
  });

  it('does not advance the generation for the same exact identity', () => {
    const signedIn = transitionIdentity(INITIAL_IDENTITY_FENCE, 'user_a', 'session_a').fence;
    const unchanged = transitionIdentity(signedIn, 'user_a', 'session_a');

    expect(unchanged).toEqual({ fence: signedIn, changed: false });
    expect(unchanged.fence).toBe(signedIn);
  });

  it('requires both non-empty identifiers before work can be captured', () => {
    expect(transitionIdentity(INITIAL_IDENTITY_FENCE, 'user_a', '').fence).toEqual(
      INITIAL_IDENTITY_FENCE
    );
    expect(transitionIdentity(INITIAL_IDENTITY_FENCE, undefined, 'session_a').fence).toEqual(
      INITIAL_IDENTITY_FENCE
    );
  });

  it('resolves only one exact loaded auth/resource user and session pair', () => {
    expect(
      resolveExactProviderIdentity({
        loaded: true,
        authUserId: 'user_a',
        authSessionId: 'session_a',
        resourceUserId: 'user_a',
        resourceSessionId: 'session_a',
      })
    ).toEqual({ userId: 'user_a', sessionId: 'session_a' });

    const rejected = [
      {
        loaded: false,
        authUserId: 'user_a',
        authSessionId: 'session_a',
        resourceUserId: 'user_a',
        resourceSessionId: 'session_a',
      },
      {
        loaded: true,
        authUserId: 'user_b',
        authSessionId: 'session_b',
        resourceUserId: 'user_a',
        resourceSessionId: 'session_b',
      },
      {
        loaded: true,
        authUserId: 'user_a',
        authSessionId: 'session_a',
        resourceUserId: 'user_a',
        resourceSessionId: 'session_b',
      },
      {
        loaded: true,
        authUserId: null,
        authSessionId: 'session_a',
        resourceUserId: 'user_a',
        resourceSessionId: 'session_a',
      },
      {
        loaded: true,
        authUserId: 'user_a',
        authSessionId: 'session_a',
        resourceUserId: null,
        resourceSessionId: 'session_a',
      },
      {
        loaded: true,
        authUserId: 'user_a',
        authSessionId: null,
        resourceUserId: 'user_a',
        resourceSessionId: 'session_a',
      },
      {
        loaded: true,
        authUserId: 'user_a',
        authSessionId: 'session_a',
        resourceUserId: 'user_a',
        resourceSessionId: null,
      },
      {
        loaded: true,
        authUserId: null,
        authSessionId: null,
        resourceUserId: null,
        resourceSessionId: null,
      },
    ] as const;

    for (const input of rejected) expect(resolveExactProviderIdentity(input)).toBeNull();
  });

  it('binds anonymous and authenticated activities to one resolved generation', () => {
    const anonymous = captureIdentityBoundary(INITIAL_IDENTITY_FENCE);
    expect(identityBoundaryIsCurrent(INITIAL_IDENTITY_FENCE, null, null, anonymous)).toBe(true);
    expect(identityBoundaryIsCurrent(INITIAL_IDENTITY_FENCE, 'user_a', null, anonymous)).toBe(
      false
    );

    const signedIn = transitionIdentity(INITIAL_IDENTITY_FENCE, 'user_a', 'session_a').fence;
    expect(identityBoundaryIsCurrent(signedIn, 'user_a', 'session_a', anonymous)).toBe(false);
    const authenticated = captureIdentityBoundary(signedIn);
    expect(identityBoundaryIsCurrent(signedIn, 'user_a', 'session_a', authenticated)).toBe(true);

    const rotated = transitionIdentity(signedIn, 'user_a', 'session_b').fence;
    expect(identityBoundaryIsCurrent(rotated, 'user_a', 'session_b', authenticated)).toBe(false);
  });
});
