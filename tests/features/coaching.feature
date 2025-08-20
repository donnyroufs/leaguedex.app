Feature: Coaching
  As a League of Legends player
  I want to receive a simple audio reminder
  So that I can form better habits

  Background:
    Given the application is running
    And I have one reminder configured:
      | interval | text          |
      | 60       | Check minimap |

  Scenario: No reminder when no game is running
    And we are not in a League of Legends match
    When 120 seconds pass
    Then no audio should play

  Scenario: Single time-based reminder works
    And we are in a League of Legends match at 0 seconds
    When 60 seconds pass in game time
    Then I should hear the audio "reminder_map.mp3"
