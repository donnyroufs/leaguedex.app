Feature: Cue Pack Management
  As a League of Legends player
  I want to organize and switch between cue packs
  So that I can use different pre-built plans

  Background:
    Given the application is running

  Scenario: Create a new cue pack
    Given I have no cue packs configured
    When I create a new cue pack called "My Pack"
    Then I should have a new cue pack called "My Pack"
    And it should be activated by default
    And it should not have any cues

  Scenario: Add a cue to the pack
    Given I have a cue pack called "My Pack"
    When I add a cue with the name "Check minimap" for the interval "60" seconds
    Then I should have a cue in the "My Pack" cue pack with the name "Check minimap"
    And the cue should be triggered every "60" seconds

  Scenario: Select a cue pack
    Given I have two cue packs configured:
      | name   |
      | Pack 1 |
      | Pack 2 |
    When I select the "Pack 2" cue pack
    Then I should have the "Pack 2" cue pack active
    And I should not have the "Pack 1" cue pack active

  Scenario: Removing a cue pack
    Given I have two cue packs configured:
      | name   |
      | Pack 1 |
      | Pack 2 |
    When I remove the "Pack 2" cue pack
    Then I should not have a cue pack called "Pack 2"
    And I should have the "Pack 1" cue pack active

  Scenario: Import cue pack from encoded data
    Given I have an encoded base64 string that contains a cue pack named "A shared cue pack" with the following cues:
      | text          | triggerType | interval |
      | Check minimap | interval    | 60       |
    When I import the cue pack using the encoded string
    Then I should have a new cue pack called "A shared cue pack"
    And all required audio files should be generated
    And I should now have a total of 2 cue packs
    And The pack should be activated by default

  # Scenario: Export cue pack to encoded data
  #   Given I have a cue pack called "Mid Fundamentals" with the following cues:
  #     | text          | triggerType | interval |
  #     | Check minimap | interval    | 60       |
  #     | Check wards   | interval    | 45       |
  #   When I export the cue pack to encoded data
  #   Then I should have a base64 encoded string that contains the cue pack

# Scenario: Editing a cue pack
# Scenario: Forking a cue pack
# Scenario: Adding existing cues to a pack

# Scenario: Remove a cue pack
#   Given I have a cue pack called "My Pack"
#   And I have a cue pack called "My Pack 2"
#   When I remove the "My Pack" cue pack
#   Then "My Pack" should be removed
#   And "My Pack 2" should be active

# Scenario: Export cue pack to encoded data
#     Given I have a cue pack called "Mid Fundamentals" with the following cues:
#       | text          | triggerType | interval |
#       | Check minimap | interval    | 60       |
#       | Check wards   | interval    | 45       |
#     When I export the cue pack to encoded data
#     Then I should have a base64 encoded string that contains the cue pack
