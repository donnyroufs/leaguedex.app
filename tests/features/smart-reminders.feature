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

  Scenario Outline: Reminder before spawning objective
    Given I have a reminder configured:
      | text                | triggerType | objective   | beforeObjective |
      | <objective> spawn   | objective   | <objective> | 30              |
    And we are in a League of Legends match
    When "<time>" seconds pass in game time
    Then I should hear the audio "<objective>_spawn"
    When the <objective> has died at "<death_time>" seconds
    And "<next_time>" seconds pass in game time
    Then I should hear the audio "<objective>_spawn" again

    Examples:
      | objective | time | next_time | death_time |
      | dragon    | 270  | 575       | 305        |
      | baron     | 1470 | 1835      | 1505       |

  Scenario Outline: Reminder before spawning one-time objective
    Given I have a reminder configured:
      | text                | triggerType | objective   | beforeObjective |
      | <objective> spawn   | objective   | <objective> | 30              |
    And we are in a League of Legends match
    When "<time>" seconds pass in game time
    Then I should hear the audio "<objective>_spawn"

    Examples:
      | objective | time |
      | grubs     | 450  |
      | herald    | 870  |
      | atakhan   | 1170 |

  Scenario: Elder dragon spawns after team reaches 4 dragon kills
    Given I have a reminder configured:
      | text                | triggerType | objective   | beforeObjective |
      | Elder dragon spawn | objective   | dragon    | 30              |
    And we are in a League of Legends match
    When the red team has killed 4 dragons
    And "360" seconds pass in game time
    Then I should hear the audio "elder_dragon_spawn"
