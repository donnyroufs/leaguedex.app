Feature: Coaching
  As a League of Legends player
  I want to receive a simple audio reminder
  So that I can prove the system works end-to-end

  Background:
    Given the application is running
    And I have one reminder configured:
      | name          | triggerType| triggerValue| text          | audioFile|
      | Map Awareness | once         | 120          | Check minimap | reminder_map.mp3|

  Scenario: No reminder when no game is running
    And we are not in a League of Legends match
    When 120 seconds pass
    Then no audio should play

  Scenario: Game detection activates reminders
    Given we are not in a League of Legends match at 0 seconds
    When a League of Legends match is detected
    Then the reminder system should be activated
    And reminders should start processing

  Scenario: Single time-based reminder works
    And we are in a League of Legends match at 0 seconds
    When 120 seconds pass in game time
    And we have entered laning phase
    Then I should hear the audio "reminder_map.mp3"
