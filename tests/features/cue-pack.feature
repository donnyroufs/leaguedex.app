Feature: Cue Pack Management
  As a League of Legends player
  I want to organize and switch between cue packs
  So that I can use different pre-built plans

  Background:
    Given the application is running

  Scenario: Personal cue pack is active by default
    Given I have no cue packs configured
    Then I should have a personal cue pack
    And it should be active by default
    And it should be empty

  Scenario: Import cue pack from encoded data
    Given I have an encoded base64 string that contains a cue pack named "A shared cue pack" with the following cues:
      | text          | triggerType | interval |
      | Check minimap | interval    | 60       |
    And I have a personal cue pack
    When I import the cue pack using the encoded string
    Then I should have a new cue pack called "A shared cue pack"
    And all required audio files should be generated
    And I should now have a total of 2 cue packs
    And I can activate the imported cue pack

# Scenario: Export cue pack to encoded data
#     Given I have a cue pack called "Mid Fundamentals" with the following cues:
#       | text          | triggerType | interval |
#       | Check minimap | interval    | 60       |
#       | Check wards   | interval    | 45       |
#     When I export the cue pack to encoded data
#     Then I should have a base64 encoded string that contains the cue pack
