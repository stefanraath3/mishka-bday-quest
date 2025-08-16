# Audio Generation Guide for Medieval Birthday Game

## Required Audio Files

### Background Music (Loop, 30-60 seconds)

1. **medieval-ambient.mp3** - Main game background

   - Prompt: "Dark medieval ambient music, mysterious castle atmosphere, low strings, distant choir, seamless loop"
   - Mood: Mysterious, atmospheric, not too dark
   - BPM: 60-80

2. **happy-birthday.mp3** - Birthday celebration
   - Prompt: "Festive birthday celebration music, medieval tavern style, uplifting melody, celebratory"
   - Mood: Joyful, celebratory, warm
   - BPM: 100-120

### Sound Effects (Short, 1-3 seconds)

#### Game Mechanics

1. **key-pickup.mp3**

   - Prompt: "Magical key pickup sound, medieval fantasy, sparkly chime, success"
   - Description: Bright, magical "ding" with slight echo

2. **riddle-success.mp3**

   - Prompt: "Puzzle solved success sound, magical revelation, triumphant chime"
   - Description: Ascending magical notes, celebratory

3. **door-unlock.mp3**

   - Prompt: "Heavy medieval door lock mechanism turning, ancient key in lock"
   - Description: Mechanical "click-clank" sound

4. **door-creak.mp3**

   - Prompt: "Old wooden castle door slowly opening, heavy hinges creaking"
   - Description: Deep wood creak, atmospheric

5. **chest-open.mp3**
   - Prompt: "Treasure chest opening, medieval wooden chest, hinges and treasure"
   - Description: Wood creak + metallic jingle

#### Ambient Sounds

6. **torch-crackle.mp3**

   - Prompt: "Medieval torch flame crackling, fire ambience, gentle burn"
   - Description: Soft fire crackling for atmosphere

7. **footsteps.mp3**
   - Prompt: "Footsteps on medieval stone floor, dungeon walking, echo"
   - Description: Rhythmic stone footsteps, subtle

#### UI Feedback

8. **button-click.mp3**

   - Prompt: "Medieval UI button click, wooden button press, satisfying click"
   - Description: Soft wooden click

9. **parchment-unfurl.mp3**

   - Prompt: "Ancient parchment scroll unrolling, paper rustle, medieval scroll"
   - Description: Paper/fabric rustling sound

10. **error-buzz.mp3**
    - Prompt: "Wrong answer buzzer, medieval style, disappointed tone"
    - Description: Low, brief negative sound

#### Special Effects

11. **party-horn.mp3**

    - Prompt: "Birthday party horn, celebration sound, festive toot"
    - Description: Classic party horn sound

12. **magic-sparkle.mp3**
    - Prompt: "Magical sparkle sound, fairy dust, twinkling magic"
    - Description: High tinkling sounds, magical

## File Format Requirements

- **Format**: MP3 and OGG (for browser compatibility)
- **Quality**: 192kbps for music, 128kbps for SFX
- **Length**: Music 30-60s (seamless loop), SFX 1-3s
- **Volume**: Normalized to -12dB peak

## File Organization

```
public/
  audio/
    music/
      medieval-ambient.mp3
      medieval-ambient.ogg
      happy-birthday.mp3
      happy-birthday.ogg
    sfx/
      key-pickup.mp3
      key-pickup.ogg
      riddle-success.mp3
      riddle-success.ogg
      [... all other SFX files]
```

## Conversion Tips

1. Use Audacity (free) to convert formats
2. Export as MP3 and OGG for compatibility
3. Normalize audio levels
4. For loops: ensure seamless beginning/end
5. Test on different devices/browsers
