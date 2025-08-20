Feature: Coaching - Smart Reminders
  As a League of Legends player
  I want to receive coaching reminders
  So that I can form better habits

  Background:
    Given the application is running

  Scenario: No reminder when no game is running
    Given I have a reminder configured:
      | interval | text          |
      | 60       | Check minimap |
    And we are not in a League of Legends match
    When "60" seconds pass
    Then no audio should play

  Scenario Outline: Repeating Reminders
    Given I have a <interval> second repeating reminder configured:
      | interval | text          |
      | <interval> | Check minimap |
    And we are in a League of Legends match at 0 seconds
    When "<interval>" seconds pass in game time
    Then I should hear the audio "check_minimap"
    And another "<interval>" seconds pass in game time
    Then I should hear the audio "check_minimap" again

    Examples:
      | interval |
      | 60       |

  Scenario Outline: One-Time Reminders
    Given I have a <interval> second one-time reminder configured:
      | interval | text          | repeat |
      | <interval> | Check minimap | false  |
    And we are in a League of Legends match at 0 seconds
    When "<interval>" seconds pass in game time
    Then I should hear the audio "check_minimap"
    And another "<interval>" seconds pass in game time
    Then I should not hear the audio "check_minimap" again

    Examples:
      | interval |
      | 60       |