export const RECOVERY_MESSAGE_KEYS = [
  'recovery_heading',
  'recovery_reference',
  'recovery_offline',
  'recovery_timeout',
  'recovery_unauthenticated',
  'recovery_eligibility_blocked',
  'recovery_forbidden',
  'recovery_not_found',
  'recovery_conflict',
  'recovery_in_progress',
  'recovery_rate_limited',
  'recovery_server',
  'recovery_client',
  'recovery_unknown',
  'recovery_invalid_response',
  'recovery_review_access',
  'recovery_summary_unverified',
  'recovery_summary_rejected',
  'recovery_summary_retry',
  'recovery_summary_refresh',
  'recovery_summary_restart',
  'recovery_activity_changed',
  'recovery_key_expired',
  'recovery_not_sent',
  'recovery_retry_label',
  'recovery_refresh_label',
  'recovery_wait_label',
  'recovery_wait_seconds',
  'recovery_wait',
  'recovery_saving',
  'recovery_saved',
  'recovery_local_only',
  'recovery_skipped',
  'recovery_not_started',
  'recovery_discard',
  'recovery_stopped_unsent',
  'recovery_finished_unsent',
  'recovery_dialog_title',
  'recovery_stay',
  'recovery_leave',
  'recovery_preference_separate',
  'recovery_no_placement',
  'recovery_no_background',
  'recovery_sign_in_again',
  'recovery_wait_request',
  'recovery_retry_choices',
  'recovery_continue_unsaved',
  'recovery_choices_failed',
] as const;

export type RecoveryMessageKey = (typeof RECOVERY_MESSAGE_KEYS)[number];
export type RecoveryMessageParams = Readonly<Record<string, string | number>>;
export type RecoveryTranslator = (key: string, params?: Record<string, string | number>) => string;

export interface RecoveryMessage {
  readonly parts: readonly RecoveryMessageKey[];
  readonly params?: RecoveryMessageParams;
  readonly requestId?: string | null;
}

export function recoveryMessage(
  parts: RecoveryMessageKey | readonly RecoveryMessageKey[],
  options: Omit<RecoveryMessage, 'parts'> = {}
): RecoveryMessage {
  return Object.freeze({
    parts: Object.freeze(typeof parts === 'string' ? [parts] : [...parts]),
    ...(options.params ? { params: Object.freeze({ ...options.params }) } : {}),
    ...(options.requestId !== undefined ? { requestId: options.requestId } : {}),
  });
}

export function extendRecoveryMessage(
  message: RecoveryMessage,
  ...parts: readonly RecoveryMessageKey[]
): RecoveryMessage {
  return recoveryMessage([...message.parts, ...parts], {
    ...(message.params ? { params: message.params } : {}),
    ...(message.requestId !== undefined ? { requestId: message.requestId } : {}),
  });
}

export function formatRecoveryMessage(
  message: RecoveryMessage | string | null,
  translate: RecoveryTranslator
): string {
  if (message === null) return '';
  if (typeof message === 'string') return message;
  const params = message.params ? { ...message.params } : undefined;
  const text = message.parts.map((key) => translate(key, params)).join(' ');
  return message.requestId
    ? `${text} ${translate('recovery_reference', { reference: message.requestId })}`
    : text;
}
