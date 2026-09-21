/**
 * Composition-aware committed-text controller.
 *
 * Pre-edit updates are state only. A consumer scores text solely when this
 * controller emits an `IMECommitEvent`; keyboard events are never converted to
 * authoritative text here.
 */

export const COMPOSITION_INPUT_VERSION = 'composition-input-v1' as const;

export interface IMEState {
  /** True while an IME composition is in progress. */
  isComposing: boolean;
  /** Current pre-edit text. It has not been committed and must not be scored. */
  compositionText: string;
}

export interface IMECommitEvent {
  /** Final committed text from a composition or native input event. */
  committed: string;
  /** Local observation time. This is not intended for persisted raw telemetry. */
  timestamp: number;
  /** Version of the composition-to-commit behavior. */
  inputVersion: typeof COMPOSITION_INPUT_VERSION;
  source: 'composition' | 'input';
}

export interface NativeInputCommit {
  data?: string | null;
  /** Current value of an otherwise empty capture input, used for paste/input fallbacks. */
  value?: string;
  inputType?: string;
  isComposing?: boolean;
}

/** Minimal cross-runtime keyboard state consumed by the shared package. */
export interface KeyboardCompositionState {
  isComposing?: boolean;
}

interface CompositionData {
  data?: string | null;
}

type CommitCallback = (event: IMECommitEvent) => void;

export class IMEHandler {
  private _isComposing = false;
  private _compositionText = '';
  private _onCommit: CommitCallback | null = null;
  private _pendingCompositionEcho: string | null = null;

  /** Register the single committed-text callback. */
  onCommit(callback: CommitCallback): void {
    this._onCommit = callback;
  }

  handleCompositionStart(_event?: unknown): void {
    this._isComposing = true;
    this._compositionText = '';
    this._pendingCompositionEcho = null;
  }

  handleCompositionUpdate(event: CompositionData): void {
    if (this._isComposing) {
      this._compositionText = event.data ?? '';
    }
  }

  /**
   * Commit the final composition result. An empty result is treated as cancel.
   * The return value makes the state transition usable without a callback.
   */
  handleCompositionEnd(event: CompositionData): IMECommitEvent | null {
    if (!this._isComposing) return null;

    const committed = event.data ?? this._compositionText;
    this._isComposing = false;
    this._compositionText = '';

    if (committed.length === 0) {
      this._pendingCompositionEcho = null;
      return null;
    }

    this._pendingCompositionEcho = committed;
    return this.emitCommit(committed, 'composition');
  }

  /** Explicitly cancel pre-edit without committing it. */
  handleCompositionCancel(): void {
    this._isComposing = false;
    this._compositionText = '';
    this._pendingCompositionEcho = null;
  }

  /**
   * Handle native `input` data. Inputs marked as composing and
   * `insertCompositionText` are pre-edit updates. Some browsers send a final
   * input event after `compositionend`; the matching echo is suppressed once.
   */
  handleInput(event: NativeInputCommit): IMECommitEvent | null {
    if (
      this._isComposing ||
      event.isComposing === true ||
      event.inputType === 'insertCompositionText'
    ) {
      if (this._isComposing && event.value !== undefined) {
        this._compositionText = event.value;
      }
      return null;
    }

    const committed = event.data ?? event.value ?? '';
    if (committed.length === 0) return null;

    if (this._pendingCompositionEcho !== null) {
      const isEcho =
        committed === this._pendingCompositionEcho ||
        event.value === this._pendingCompositionEcho;
      this._pendingCompositionEcho = null;
      if (isEcho) return null;
    }

    return this.emitCommit(committed, 'input');
  }

  /**
   * Retained for compatibility with existing callers. `true` only means a
   * keyboard shortcut/navigation handler should stand down during pre-edit;
   * keydown must not be treated as committed text in either state.
   */
  shouldSuppressKeystroke(event: KeyboardCompositionState): boolean {
    return this._isComposing || event.isComposing === true;
  }

  get state(): IMEState {
    return {
      isComposing: this._isComposing,
      compositionText: this._compositionText,
    };
  }

  get isComposing(): boolean {
    return this._isComposing;
  }

  attach(target: EventTarget): () => void {
    const onStart = (event: Event) => this.handleCompositionStart(event);
    const onUpdate = (event: Event) =>
      this.handleCompositionUpdate(event as unknown as CompositionData);
    const onEnd = (event: Event) =>
      this.handleCompositionEnd(event as unknown as CompositionData);

    target.addEventListener('compositionstart', onStart);
    target.addEventListener('compositionupdate', onUpdate);
    target.addEventListener('compositionend', onEnd);

    return () => {
      target.removeEventListener('compositionstart', onStart);
      target.removeEventListener('compositionupdate', onUpdate);
      target.removeEventListener('compositionend', onEnd);
    };
  }

  reset(): void {
    this.handleCompositionCancel();
  }

  private emitCommit(
    committed: string,
    source: IMECommitEvent['source'],
  ): IMECommitEvent {
    const commit: IMECommitEvent = {
      committed,
      timestamp: Date.now(),
      inputVersion: COMPOSITION_INPUT_VERSION,
      source,
    };
    this._onCommit?.(commit);
    return commit;
  }
}
