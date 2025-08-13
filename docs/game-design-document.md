# Game Design Document: Mishka's Birthday Dungeon

## 1. Project Overview

**Title:** Mishka's Birthday Dungeon (Working Title)
**Concept:** A personalized 3D RPG puzzle game created as a birthday gift for Mishka.
**Genre:** First-person puzzle, exploration.
**Target Audience:** A specific individual, Mishka, with puzzles and themes tailored to her personality and shared memories with the creator.
**Theme:** A "kinky medieval dungeon" with a playful, intimate, and adventurous tone.

---

## 2. Core Gameplay Loop

The core gameplay is designed to be a repeating cycle of exploration, discovery, and problem-solving.

1.  **Enter & Explore:** The player spawns in a new, mysterious chamber and must explore the environment to understand its layout and find clues.
2.  **Discover the Objective:** The player identifies the main interactive object required for progression (e.g., a golden key).
3.  **Trigger the Puzzle:** Interacting with the objective triggers a personalized riddle or puzzle presented through a UI modal.
4.  **Solve the Puzzle:** The player must solve the riddle, which is based on inside jokes and shared memories (e.g., "Repenny").
5.  **Unlock & Progress:** A correct solution unlocks the exit (e.g., a medieval door opens), allowing the player to advance to the next chamber.

---

## 3. Character

**Model:** A custom-made 3D character of a female angel/fantasy being, created with Meshy AI from an image to match Mishka's preferred "vibe".
**File:** `/public/models/character-walking.glb`
**Control:** Third-person perspective with standard WASD for movement and mouse for camera control.

**Animation System:**

- **Stateful Animation:** The character smoothly transitions between `idle` and `walk` animations.
- **GLB-Driven:** The system reads animation clips directly from the `.glb` file. It intelligently searches for clips with names containing "walk", "run", or "idle".
- **Animation Mixer:** Utilizes Three.js's `AnimationMixer` for efficient playback and smooth fading (0.2s) between animation states.
- **Visuals:** The character model is fully integrated into the lighting system, casting and receiving dynamic shadows.

---

## 4. Level Design - Chamber 1: The Repentance Riddle

The first level introduces the core mechanics in an atmospheric setting.

**Setting:** A small, intimate (16x16) medieval dungeon chamber.
**Atmosphere:** Dark, warm, and moody. The feeling of a secret, kinky dungeon.

**Key Components:**

- **Walls & Floor:** Procedurally generated stone textures with a block/tile pattern, weathering, and hints of moss. They cast and receive shadows.
- **Ceiling:** A dark, textured ceiling with procedural wooden beams to create an enclosed, intimate feeling.
- **Lighting:**
  - **Primary Source:** Four wall-mounted, procedurally generated torches.
  - **Light Quality:** The torches cast a bright, warm, fiery orange light (`0xff4400`) and create dynamic, flickering shadows.
  - **Ambient Light:** A very warm, bright ambient light (`0x664433`) fills the space to ensure visibility while maintaining a dark, moody feel.
  - **Accent Light:** A golden glow emanates from the puzzle key to draw the player's attention.
- **Key Object:** A procedurally generated **Ornate Floating Key**. It is golden with a central red gem and animates with a gentle bobbing and rotation.
- **Puzzle Trigger:** Walking up to the key.
- **The Riddle:** A crossword-style UI appears, asking for a 7-letter word. The riddle text poetically hints at the "Repentance" event.
  - **Answer:** `REPENNY`
- **Exit:** A procedurally generated **Medieval Door**. It is highly detailed with wooden planks, iron reinforcements, studs, and a handle. It is the locked exit to the chamber.
- **Reward:** Upon solving the riddle, the key is "collected" (disappears), and the medieval door slides upward, opening the path forward.

---

## 5. Art & Style

**Overall Vibe:** Cinematic, realistic, and atmospheric.
**Color Palette:** Dominated by warm oranges, deep reds, dark browns, and stone grays, creating a fiery and intimate feeling.
**Asset Generation:** A key feature is the heavy use of **procedural generation** via Three.js to create detailed, unique assets without external files. This includes:

- Stone Floor & Wall Textures
- Ornate Floating Key
- Medieval Door
- Wall Torches
  **Rendering:**
- **Shadows:** PCF Soft Shadows are enabled. The main directional light and all four torch point lights cast shadows.
- **Tone Mapping:** `ACESFilmicToneMapping` is used for a cinematic, high-quality color grade.

---

## 6. UI / UX

**In-Game HUD:**

- **Controls:** Top-left corner, displays movement/camera instructions.
- **Game State:** Tracks `Puzzle`, `Key`, and `Door` status (e.g., "unsolved", "solved", "closed", "open").
- **Quest Log:** A simple, dynamic quest objective to guide the player (e.g., "Approach the golden key to begin your trial").

**Puzzle Interface:**

- **Style:** A pop-up modal designed to look like ancient parchment paper, with medieval-style fonts and decorative borders.
- **Functionality:**
  - Displays the riddle text.
  - Provides a 7-cell grid for the answer.
  - An input field for typing the answer.
  - A "Submit" button.
  - **Hint System:** After two incorrect attempts, a hint is revealed.
  - **Feedback:** The grid provides visual feedback for correct answers, and a success message appears upon solving.

---

## 7. Technical Specifications

- **Engine:** Three.js
- **Framework:** Next.js (React)
- **Language:** TypeScript
- **Styling:** Tailwind CSS

---

## 8. Future Development Roadmap

- **Interactive Objects:** Add kinky dungeon props and personalized easter eggs to the first chamber to enhance exploration and storytelling.
- **Progression System:** Build the framework for a multi-chamber maze, allowing for a sequence of puzzles.
- **Sound Design:**
  - **SFX:** Footsteps, torch crackling, key collection chime, door grinding open.
  - **Ambiance:** Low, ambient dungeon sounds.
- **Particle Effects:** Add magical sparkles to the key, smoke/embers from torches, and dust effects.
