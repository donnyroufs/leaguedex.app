Feature: Coaching - Smart Reminders
  As a League of Legends player
  I want to receive coaching reminders
  So that I can form better habits

  Background:
    Given the application is running

  Scenario: No reminder when no game is running
    Given I have a reminder configured:
      | text          | triggerType | interval |
      | Check minimap | interval    | 60       |
    And we are not in a League of Legends match
    When "60" seconds pass
    Then no audio should play

  Scenario: Repeating interval reminder
    Given I have a reminder configured:
      | text          | triggerType | interval |
      | Check minimap | interval    | 60       |
    And we are in a League of Legends match
    When "60" seconds pass in game time
    Then I should hear the audio "check_minimap"
    When another "60" seconds pass in game time
    Then I should hear the audio "check_minimap" again

  Scenario: One-time reminder at specific time
    Given I have a reminder configured:
      | text         | triggerType | triggerAt |
      | Ward river   | oneTime     | 150       |
    And we are in a League of Legends match
    When "150" seconds pass in game time
    Then I should hear the audio "ward_river"
    When another "60" seconds pass in game time
    Then I should not hear the audio "ward_river" again

  Scenario: Reminder on respawn event
    Given I have a reminder configured:
      | text             | triggerType | event |
      | Play safer now   | event       | respawn |
    And we are in a League of Legends match
    When the player dies with a "10" seconds death timer
    And "10" seconds have passed
    Then I should hear the audio "play_safer_now"
    When the player dies again with a "15" seconds death timer
    Then I should hear the audio "play_safer_now" again

