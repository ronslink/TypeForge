/**
 * IMEHandler — Composition event manager for CJK and other IME input
 *
 * Handles compositionstart / compositionupdate / compositionend events
 * so the typing engine ignores intermediate IME states and only scores
 * the final committed characters.
 *
 * Rules (per Agent 4 spec):
 * - No fetch() calls — pure browser computation
 * - Uses KeyboardEvent.code (physical key), not .key
 * - All comparisons via CharComparator (NFC normalisation)
 */

export interface IMEState {
  /** True while an IME composition is in progress */
  isComposing: boolean;
  /** The current composition string (intermediate, not yet committed) */
  compositionText: string;
}

export interface IMECommitEvent {
  /** The final committed string from the IME */
  committed: string;
  /** Timestamp of the compositionend event */
  timestamp: number;
}

type CommitCallback = (event: IMECommitEvent) => void;

export class IMEHandler {
  private _isComposing = false;
  private _compositionText = '';
  private _onCommit: CommitCallback | null = null;

  /**
   * Register a callback to be invoked when an IME composition is committed
   */
  onCommit(callback: CommitCallback): void {
    this._onCommit = callback;
  }

  /**
   * Call this from the element's compositionstart event listener
   */
  handleCompositionStart(_event: CompositionEvent): void {
    this._isComposing = true;
    this._compositionText = '';
  }

  /**
   * Call this from the element's compositionupdate event listener
   */
  handleCompositionUpdate(event: CompositionEvent): void {
    if (this._isComposing) {
      this._compositionText = event.data ?? '';
    }
  }

  /**
   * Call this from the element's compositionend event listener.
   * Fires the commit callback with the final committed string.
   */
  handleCompositionEnd(event: CompositionEvent): void {
    this._isComposing = false;
    const committed = event.data ?? this._compositionText;
    this._compositionText = '';

    if (committed && this._onCommit) {
      this._onCommit({ committed, timestamp: Date.now() });
    }
  }

  /**
   * Call this from the element's keydown event listener.
   * Returns true if the keystroke should be suppressed (IME in progress).
   */
  shouldSuppressKeystroke(_event: KeyboardEvent): boolean {
    return this._isComposing;
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

  /**
   * Attach all composition event listeners to a target element.
   * Returns a cleanup function that removes them.
   */
  attach(target: EventTarget): () => void {
    const onStart = (e: Event) => this.handleCompositionStart(e as CompositionEvent);
    const onUpdate = (e: Event) => this.handleCompositionUpdate(e as CompositionEvent);
    const onEnd = (e: Event) => this.handleCompositionEnd(e as CompositionEvent);

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
    this._isComposing = false;
    this._compositionText = '';
  }
}
