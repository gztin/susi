---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications. Generates creative, polished code that avoids generic AI aesthetics.
inclusion: auto
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

## Design Direction

Commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision.

## Frontend Aesthetics Guidelines

### Typography
- Use a modular type scale with fluid sizing (clamp)
- Vary font weights and sizes to create clear visual hierarchy
- DON'T use overused fonts: Inter, Roboto, Arial, Open Sans, system defaults
- DON'T use monospace typography as lazy shorthand for "technical" vibes

### Color & Theme
- Use modern CSS color functions (oklch, color-mix) for perceptually uniform palettes
- Tint neutrals toward your brand hue
- DON'T use gray text on colored backgrounds
- DON'T use pure black (#000) or pure white (#fff)—always tint
- DON'T use the AI color palette: cyan-on-dark, purple-to-blue gradients, neon accents

### Layout & Space
- Create visual rhythm through varied spacing
- Use fluid spacing with clamp() that breathes on larger screens
- Use asymmetry and unexpected compositions; break the grid intentionally
- DON'T wrap everything in cards
- DON'T center everything—left-aligned text with asymmetric layouts feels more designed

### Visual Details
- DON'T use glassmorphism everywhere
- DON'T use rounded rectangles with generic drop shadows
- DON'T use modals unless truly necessary

### Motion
- Use motion to convey state changes: entrances, exits, feedback
- Use exponential easing (ease-out-quart/quint/expo) for natural deceleration
- DON'T animate layout properties—use transform and opacity only
- DON'T use bounce or elastic easing

### Interaction
- Use progressive disclosure
- Design empty states that teach the interface
- DON'T make every button primary—use hierarchy

### Responsive
- Use container queries (@container) for component-level responsiveness
- DON'T hide critical functionality on mobile—adapt the interface

## The AI Slop Test

If you showed this interface to someone and said "AI made this," would they believe you immediately? If yes, that's the problem. A distinctive interface should make someone ask "how was this made?" not "which AI made this?"

## Implementation Principles

Match implementation complexity to the aesthetic vision. Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same.
