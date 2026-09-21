const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export type FocusTrapOptions = {
  active?: boolean;
  initialFocus?: string;
  onEscape?: () => void;
  restoreFocus?: boolean;
};

export function getTabDestinationIndex(
  currentIndex: number,
  itemCount: number,
  movingBackward: boolean
): number {
  if (itemCount <= 0) return -1;
  if (currentIndex < 0) return movingBackward ? itemCount - 1 : 0;
  if (movingBackward) return currentIndex === 0 ? itemCount - 1 : currentIndex - 1;
  return currentIndex === itemCount - 1 ? 0 : currentIndex + 1;
}

function isAvailable(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    !element.hidden &&
    !element.closest('[inert]')
  );
}

function getFocusableElements(node: HTMLElement): HTMLElement[] {
  return Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(isAvailable);
}

/**
 * Keeps keyboard focus inside a modal surface and restores focus to the control
 * that opened it. `aria-modal` alone does not provide either behavior.
 */
export function focusTrap(node: HTMLElement, initialOptions: FocusTrapOptions = {}) {
  let options = initialOptions;
  let previouslyFocused: HTMLElement | null = null;
  let animationFrame: number | null = null;
  let listening = false;

  const focusInitialElement = () => {
    const requested = options.initialFocus
      ? node.querySelector<HTMLElement>(options.initialFocus)
      : null;
    const target = requested ?? getFocusableElements(node)[0] ?? node;
    target.focus({ preventScroll: true });
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && options.onEscape) {
      event.preventDefault();
      event.stopPropagation();
      options.onEscape();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusable = getFocusableElements(node);
    if (focusable.length === 0) {
      event.preventDefault();
      node.focus({ preventScroll: true });
      return;
    }

    const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);
    const destinationIndex = getTabDestinationIndex(currentIndex, focusable.length, event.shiftKey);

    const isOutside = currentIndex === -1;
    const isAtBoundary = event.shiftKey
      ? currentIndex === 0
      : currentIndex === focusable.length - 1;

    if (isOutside || isAtBoundary) {
      event.preventDefault();
      focusable[destinationIndex]?.focus({ preventScroll: true });
    }
  };

  const activate = () => {
    if (listening) return;
    previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.addEventListener('keydown', handleKeyDown, true);
    listening = true;
    animationFrame = window.requestAnimationFrame(focusInitialElement);
  };

  const deactivate = () => {
    if (animationFrame !== null) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
    if (listening) {
      document.removeEventListener('keydown', handleKeyDown, true);
      listening = false;
    }
    if (options.restoreFocus !== false && previouslyFocused?.isConnected) {
      previouslyFocused.focus({ preventScroll: true });
    }
    previouslyFocused = null;
  };

  if (options.active !== false) activate();

  return {
    update(nextOptions: FocusTrapOptions = {}) {
      const wasActive = options.active !== false;
      options = nextOptions;
      const isActive = options.active !== false;
      if (!wasActive && isActive) activate();
      if (wasActive && !isActive) deactivate();
    },
    destroy() {
      deactivate();
    },
  };
}
