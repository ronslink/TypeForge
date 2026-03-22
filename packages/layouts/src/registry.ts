/**
 * Layout Registry
 * Manages keyboard layout definitions
 */

import type { KeyboardLayout, Finger } from './types.js';

export class LayoutRegistry {
  private layouts: Map<string, KeyboardLayout> = new Map();

  constructor(initialLayouts: Record<string, KeyboardLayout> = {}) {
    for (const [_id, layout] of Object.entries(initialLayouts)) {
      this.register(layout);
    }
  }

  /**
   * Register a keyboard layout
   */
  register(layout: KeyboardLayout): void {
    this.layouts.set(layout.id, layout);
  }

  /**
   * Get a layout by ID
   */
  get(id: string): KeyboardLayout | undefined {
    return this.layouts.get(id);
  }

  /**
   * Get all registered layouts
   */
  getAll(): KeyboardLayout[] {
    return Array.from(this.layouts.values());
  }

  /**
   * Get layouts by language
   */
  getByLanguage(languageCode: string): KeyboardLayout[] {
    return this.getAll().filter((l) => l.languageCode === languageCode);
  }

  /**
   * Get finger for a character in a layout
   */
  getFinger(layoutId: string, char: string): Finger | undefined {
    const layout = this.layouts.get(layoutId);
    if (!layout) return undefined;
    return layout.fingerMap[char];
  }

  /**
   * Get all keys for a finger in a layout
   */
  getKeysForFinger(layoutId: string, finger: Finger): string[] {
    const layout = this.layouts.get(layoutId);
    if (!layout) return [];

    return layout.keys.filter((k) => k.finger === finger).map((k) => k.char);
  }

  /**
   * Check if a layout exists
   */
  has(id: string): boolean {
    return this.layouts.has(id);
  }
}
