# Leaguedex App

Example generating a spec from a feature:
> npx @amiceli/vitest-cucumber --feature tests/features/coaching.feature --space tests/features/coaching.spec.ts --spec tests/coaching.spec.ts

## Todos

## **Phase 1: Foundation & Infrastructure (Start Here)**
1. **Create FileSystem Utility Class**
   - Create static `FileSystem` class in shared-kernel
   - Replace scattered fs calls in adapters with `FileSystem.ensureDirectoryExists()`

2. **Remove OS Dependencies**
   - Create dev adapters that mimic Windows/Mac behavior
   - Remove platform-specific logic from production code
   - Ensure consistent behavior across development environments

## **Phase 2: Core Renaming (Do Together)**
3. **Rename Riot API Components**
   - `IRiotClientDataSource` → `IDataSource`
   - `IRiotApi` → `IGameDataProvider`
   - `RiotApi` → `RiotApiAdapter`

4. **Rename TTS Components**
   - `ITextToSpeech` → `IAudioGenerator`
   - `TextToSpeech` → `TextToSpeechAudioGenerator`
   - `RealVoiceLikeTTS` → `RealVoiceLikeAudioGenerator`

## **Phase 3: Service Extraction (Dependencies Matter)**
5. **Create Missing Domain Service**
   - Extract reminder logic from `RemindersGameTickListener` into new `ReminderEngine` class
   - Move `ReminderEngine` to domain layer (blue in your diagram)

6. **Create Missing Application Service**
   - Create `ReminderService` class in application layer (red in your diagram)
   - Move orchestration logic from `RemindersGameTickListener` to `ReminderService`

7. **Re-add Native Audio Generator**
   - Ensure `TextToSpeechAudioGenerator` works for users without license
   - Users should be able to create reminders using system TTS even without premium

## **Phase 4: Integration & Testing**
8. **Update Composition Root**
   - Wire up the new `ReminderEngine` and `ReminderService`
   - Update dependency injection for renamed components

9. **Update Tests**
   - Fix broken imports from renames
   - Update test setup for new service structure
   - Test that adapters create directories when needed