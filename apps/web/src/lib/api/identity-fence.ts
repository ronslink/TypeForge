export interface AuthIdentity {
  userId: string;
  sessionId: string;
}

export interface IdentityFence {
  identity: AuthIdentity | null;
  generation: number;
}

export interface IdentityOperation extends AuthIdentity {
  generation: number;
}

export interface ProviderIdentityProjectionInput {
  loaded: boolean;
  authUserId: string | null | undefined;
  authSessionId: string | null | undefined;
  resourceUserId: string | null | undefined;
  resourceSessionId: string | null | undefined;
}

/**
 * Ownership of an activity that may be performed anonymously. Unlike an
 * IdentityOperation, both identifiers may be null, but never partially set.
 */
export interface IdentityBoundarySnapshot {
  userId: string | null;
  sessionId: string | null;
  generation: number;
}

export const INITIAL_IDENTITY_FENCE: IdentityFence = Object.freeze({
  identity: null,
  generation: 0,
});

function resolvedIdentity(
  userId: string | null | undefined,
  sessionId: string | null | undefined
): AuthIdentity | null {
  return typeof userId === 'string' &&
    userId.length > 0 &&
    typeof sessionId === 'string' &&
    sessionId.length > 0
    ? { userId, sessionId }
    : null;
}

/**
 * Resolve an authenticated identity only when both provider layers describe the
 * same non-empty user/session pair. Partial provider transitions are not an
 * authenticated boundary and must not own reads, mutations, or retained UI.
 */
export function resolveExactProviderIdentity(
  input: ProviderIdentityProjectionInput
): AuthIdentity | null {
  const authIdentity = input.loaded
    ? resolvedIdentity(input.authUserId, input.authSessionId)
    : null;
  const resourceIdentity = input.loaded
    ? resolvedIdentity(input.resourceUserId, input.resourceSessionId)
    : null;
  return authIdentity &&
    resourceIdentity &&
    authIdentity.userId === resourceIdentity.userId &&
    authIdentity.sessionId === resourceIdentity.sessionId
    ? authIdentity
    : null;
}

/** Advance the generation whenever the exact authenticated user/session pair changes. */
export function transitionIdentity(
  fence: IdentityFence,
  userId: string | null | undefined,
  sessionId: string | null | undefined
): { fence: IdentityFence; changed: boolean } {
  const identity = resolvedIdentity(userId, sessionId);
  if (
    fence.identity?.userId === identity?.userId &&
    fence.identity?.sessionId === identity?.sessionId
  ) {
    return { fence, changed: false };
  }
  return {
    fence: { identity, generation: fence.generation + 1 },
    changed: true,
  };
}

/** Capture ownership before token lookup or dispatch. */
export function captureIdentityOperation(fence: IdentityFence): IdentityOperation | null {
  return fence.identity ? { ...fence.identity, generation: fence.generation } : null;
}

/** Capture the current resolved account-or-anonymous boundary for an activity. */
export function captureIdentityBoundary(fence: IdentityFence): IdentityBoundarySnapshot {
  return {
    userId: fence.identity?.userId ?? null,
    sessionId: fence.identity?.sessionId ?? null,
    generation: fence.generation,
  };
}

/**
 * Recheck ownership after every asynchronous boundary. Callers must additionally
 * require their identity provider to remain loaded/resolved.
 */
export function identityOperationIsCurrent(
  fence: IdentityFence,
  userId: string | null | undefined,
  sessionId: string | null | undefined,
  operation: IdentityOperation
): boolean {
  return (
    fence.generation === operation.generation &&
    fence.identity?.userId === operation.userId &&
    fence.identity.sessionId === operation.sessionId &&
    userId === operation.userId &&
    sessionId === operation.sessionId
  );
}

export function identityIsCurrent(
  fence: IdentityFence,
  userId: string | null | undefined,
  sessionId: string | null | undefined
): boolean {
  const operation = captureIdentityOperation(fence);
  return operation !== null && identityOperationIsCurrent(fence, userId, sessionId, operation);
}

export function identityBoundaryIsCurrent(
  fence: IdentityFence,
  userId: string | null | undefined,
  sessionId: string | null | undefined,
  snapshot: IdentityBoundarySnapshot
): boolean {
  const normalizedUserId = userId ?? null;
  const normalizedSessionId = sessionId ?? null;
  const pairIsResolved =
    (normalizedUserId === null && normalizedSessionId === null) ||
    (normalizedUserId !== null && normalizedSessionId !== null);
  return (
    pairIsResolved &&
    fence.generation === snapshot.generation &&
    normalizedUserId === snapshot.userId &&
    normalizedSessionId === snapshot.sessionId
  );
}
