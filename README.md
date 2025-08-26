# Leaguedex App

Example generating a spec from a feature:
> npx @amiceli/vitest-cucumber --feature tests/features/coaching.feature --space tests/features/coaching.spec.ts --spec tests/coaching.spec.ts

## Todos

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