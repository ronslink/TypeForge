# Sound Assets

This directory contains audio files for typing feedback.

## Directory Structure

```
sounds/
├── keystroke/          # Key press sounds
│   ├── mechanical.mp3  # Mechanical keyboard sound
│   ├── soft.mp3        # Soft/quiet keyboard sound
│   ├── retro.mp3       # Retro typewriter sound
│   └── custom.mp3      # User-customizable sound
├── error/              # Error/incorrect key sounds
│   ├── mechanical.mp3
│   ├── soft.mp3
│   ├── retro.mp3
│   └── custom.mp3
├── success/            # Success/completion sounds
│   ├── mechanical.mp3
│   ├── soft.mp3
│   ├── retro.mp3
│   └── custom.mp3
├── notification/       # UI notification sounds
│   ├── mechanical.mp3
│   ├── soft.mp3
│   ├── retro.mp3
│   └── custom.mp3
└── ambient/            # Background ambient sounds
    ├── mechanical.mp3
    ├── soft.mp3
    ├── retro.mp3
    └── custom.mp3
```

## Sound Requirements

### Format
- **Primary**: MP3 (best browser support)
- **Secondary**: WebM/OGG (optional, for optimization)
- **Sample Rate**: 44.1kHz
- **Bit Rate**: 128kbps (keystroke), 192kbps (others)

### Duration
- **Keystroke**: 50-150ms (must be short for zero-latency feel)
- **Error**: 100-300ms
- **Success**: 300-1000ms
- **Notification**: 200-500ms
- **Ambient**: 30-60 seconds (loopable)

### Volume
- Normalize all sounds to -3dB peak
- Keystroke sounds should be subtle (not jarring)

## Adding Custom Sounds

1. Place your MP3 file in the appropriate category folder
2. Name it `custom.mp3`
3. Users can upload their own sounds via settings

## Preloading

All keystroke sounds are preloaded on app initialization for zero-latency playback using the Web Audio API.
