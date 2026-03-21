/**
 * Sound assets and management
 * Zero-latency audio feedback for typing
 */

export type SoundCategory = 'keystroke' | 'error' | 'success' | 'notification' | 'ambient';
export type SoundTheme = 'mechanical' | 'soft' | 'retro' | 'silent' | 'custom';

export interface SoundConfig {
  enabled: boolean;
  volume: number; // 0-100
  theme: SoundTheme;
  keystrokeSound: boolean;
  errorSound: boolean;
  successSound: boolean;
}

export interface SoundAsset {
  id: string;
  category: SoundCategory;
  src: string;
  preload: boolean;
}

// Sound file paths (served from static directory)
export const sounds: Record<SoundCategory, Record<SoundTheme, string>> = {
  keystroke: {
    mechanical: '/assets/sounds/keystroke/mechanical.mp3',
    soft: '/assets/sounds/keystroke/soft.mp3',
    retro: '/assets/sounds/keystroke/retro.mp3',
    silent: '',
    custom: '/assets/sounds/keystroke/custom.mp3',
  },
  error: {
    mechanical: '/assets/sounds/error/mechanical.mp3',
    soft: '/assets/sounds/error/soft.mp3',
    retro: '/assets/sounds/error/retro.mp3',
    silent: '',
    custom: '/assets/sounds/error/custom.mp3',
  },
  success: {
    mechanical: '/assets/sounds/success/mechanical.mp3',
    soft: '/assets/sounds/success/soft.mp3',
    retro: '/assets/sounds/success/retro.mp3',
    silent: '',
    custom: '/assets/sounds/success/custom.mp3',
  },
  notification: {
    mechanical: '/assets/sounds/notification/mechanical.mp3',
    soft: '/assets/sounds/notification/soft.mp3',
    retro: '/assets/sounds/notification/retro.mp3',
    silent: '',
    custom: '/assets/sounds/notification/custom.mp3',
  },
  ambient: {
    mechanical: '/assets/sounds/ambient/mechanical.mp3',
    soft: '/assets/sounds/ambient/soft.mp3',
    retro: '/assets/sounds/ambient/retro.mp3',
    silent: '',
    custom: '/assets/sounds/ambient/custom.mp3',
  },
};

/**
 * Sound Manager for zero-latency audio playback
 * Uses Web Audio API with preloaded buffers
 */
export class SoundManager {
  private audioContext: AudioContext | null = null;
  private buffers: Map<string, AudioBuffer> = new Map();
  private config: SoundConfig;

  constructor(config: Partial<SoundConfig> = {}) {
    this.config = {
      enabled: true,
      volume: 50,
      theme: 'mechanical',
      keystrokeSound: true,
      errorSound: true,
      successSound: true,
      ...config,
    };
  }

  /**
   * Initialize audio context and preload sounds
   */
  async initialize(): Promise<void> {
    if (typeof window === 'undefined') return;

    this.audioContext = new AudioContext();

    // Preload essential sounds
    const soundsToPreload = [
      sounds.keystroke[this.config.theme],
      sounds.error[this.config.theme],
      sounds.success[this.config.theme],
    ].filter(Boolean);

    await Promise.all(soundsToPreload.map((src) => this.preload(src)));
  }

  /**
   * Preload a sound file into buffer
   */
  private async preload(src: string): Promise<void> {
    if (!this.audioContext || this.buffers.has(src)) return;

    try {
      const response = await fetch(src);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.buffers.set(src, audioBuffer);
    } catch (error) {
      console.warn(`Failed to preload sound: ${src}`, error);
    }
  }

  /**
   * Play a sound by category
   */
  play(category: SoundCategory): void {
    if (!this.config.enabled || !this.audioContext) return;
    if (this.config.theme === 'silent') return;

    const src = sounds[category][this.config.theme];
    if (!src) return;

    this.playFromBuffer(src);
  }

  /**
   * Play keystroke sound (most frequent, must be fast)
   */
  playKeystroke(): void {
    if (!this.config.keystrokeSound) return;
    this.play('keystroke');
  }

  /**
   * Play error sound
   */
  playError(): void {
    if (!this.config.errorSound) return;
    this.play('error');
  }

  /**
   * Play success sound
   */
  playSuccess(): void {
    if (!this.config.successSound) return;
    this.play('success');
  }

  /**
   * Play from preloaded buffer (zero-latency)
   */
  private playFromBuffer(src: string): void {
    if (!this.audioContext) return;

    const buffer = this.buffers.get(src);
    if (!buffer) {
      // Fallback: try to load and play
      this.preload(src).then(() => this.playFromBuffer(src));
      return;
    }

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = buffer;
    gainNode.gain.value = this.config.volume / 100;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    source.start(0);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SoundConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Set volume (0-100)
   */
  setVolume(volume: number): void {
    this.config.volume = Math.max(0, Math.min(100, volume));
  }

  /**
   * Enable/disable sounds
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  /**
   * Change sound theme
   */
  async setTheme(theme: SoundTheme): Promise<void> {
    this.config.theme = theme;
    if (theme !== 'silent') {
      await this.initialize();
    }
  }
}
