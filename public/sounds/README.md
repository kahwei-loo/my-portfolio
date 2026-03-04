# Keyboard Sound Effects

This directory should contain the sound effect files for the Skills Keyboard component.

## Required Files

Place the following audio files in this directory:

1. **press.mp3** - Keyboard key press sound effect
2. **release.mp3** - Keyboard key release sound effect

## File Format

- Format: MP3
- Recommended duration: 50-200ms for responsive feel
- Recommended volume: Pre-normalized to avoid clipping

## Usage

These sound files are loaded and played by the `KeySoundManager` class in:
`src/components/ui/SkillsKeyboard3D.tsx`

The sounds play automatically when users hover over or click keyboard keys.
