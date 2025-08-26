# Leaguedex App

Example generating a spec from a feature:
> npx @amiceli/vitest-cucumber --feature tests/features/coaching.feature --space tests/features/coaching.spec.ts --spec tests/coaching.spec.ts

## Todos

- [ ] Create our new GameMonitor
  - This means we turn the game event game started into a domain event and never include it to the game events in state
  - The gamedetectionservice gets removed
  - we emit:
    - GameStartedEvent
    - GameStoppedEvent
    - GameTickEvent
      - Has current game state
      - Has a dependency on GameStateAssembler
- [ ] We make our game state assembler functional
  - This means that our GameObjectiveTracker will be used here. And also renamed to DragonTracker/DragonProcessor I think.


## **Phase 3: Service Extraction (Dependencies Matter)**
5. **Create Missing Domain Service**
   - Extract reminder logic from `RemindersGameTickListener` into new `ReminderEngine` class
   - Move `ReminderEngine` to domain layer (blue in your diagram)

6. **Create Missing Application Service**
   - Create `ReminderService` class in application layer (red in your diagram)
   - Move orchestration logic from `RemindersGameTickListener` to `ReminderService`

## **Phase 4: Integration & Testing**
8. **Update Composition Root**
   - Wire up the new `ReminderEngine` and `ReminderService`
   - Update dependency injection for renamed components

9. **Update Tests**
   - Fix broken imports from renames
   - Update test setup for new service structure
   - Test that adapters create directories when needed