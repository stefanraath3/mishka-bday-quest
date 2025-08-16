# 📸 Photo Interaction Sounds Needed

The memory palace painting system requires these 2 essential photo-specific sounds:

## 🎵 Sound Files Needed

### 1. **camera-shutter.mp3** (Primary interaction sound)

**Prompt**: _"Vintage camera shutter click, crisp mechanical snap, 35mm film camera, sharp decisive sound, duration 0.8 seconds"_

- **Usage**: Opening photo viewer, favorite button, share button
- **Volume**: 90% of SFX volume
- **Feel**: Satisfying, nostalgic camera click

### 2. **photo-flip.mp3** (Closing sound)

**Prompt**: _"Single photograph being flipped or turned over, light paper snap, gentle photo handling sound, duration 0.6 seconds"_

- **Usage**: When closing the photo viewer
- **Volume**: 70% of SFX volume
- **Feel**: Gentle, intimate photo handling

## 🔧 Technical Requirements

- **Format**: MP3 (primary) + OGG (fallback)
- **Quality**: 44.1kHz, 16-bit minimum
- **File Size**: Under 500KB each for web performance
- **No Background Noise**: Clean, isolated sounds
- **Consistent Volume**: Normalized levels across all sounds

## 📁 File Placement

Place the generated sound files in this directory:

```
/public/audio/sfx/
├── camera-shutter.mp3
├── camera-shutter.ogg
├── photo-flip.mp3
└── photo-flip.ogg
```

## 🎮 Current Integration

The sounds are already integrated into the game code:

- ✅ Asset loading system updated
- ✅ Audio manager configured
- ✅ Game interaction code updated
- ✅ PhotoViewer component updated
- ⏳ **Need 2 sound files generated**

## 📝 Quick Generation Summary

**Just generate these 2 sounds:**

1. **Camera Shutter**: _"Vintage camera shutter click, crisp mechanical snap, 35mm film camera, duration 0.8s"_
2. **Photo Flip**: _"Single photograph being flipped, light paper snap, gentle handling, duration 0.6s"_

Once you generate these 2 sounds, the photo memory palace will have perfect audio feedback!
