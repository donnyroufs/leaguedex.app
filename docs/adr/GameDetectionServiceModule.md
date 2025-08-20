# Game Detection Service Module
**date**: 2025-08-20

## Context
We need to decide where to place the GameDetectionService and related game state management in our architecture.

## Decision
**Keep GameDetectionService in shared-kernel for now, but recognize it should be its own bounded context.**

## Rationale
- **Current**: GameDetectionService is mixed into shared-kernel with other infrastructure
- **Future**: Should be extracted into its own "Game Detection" bounded context.
- **Why wait**: Focus on coaching functionality first, refactor architecture later

## Consequences
- **Pros**: Faster development of coaching features, no major refactoring needed now
- **Cons**: Game detection logic mixed with shared infrastructure, technical debt

## Future Action
Extract GameDetectionService, GameState, and related events into dedicated "Game Detection" bounded context when time permits. The Game Detection module will transform current game state into a filtered version and emit this during `game-ticks`. Other modules can do whatever they want with it, either keep their own state or use it once and forget etc.