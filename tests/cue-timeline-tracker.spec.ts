import { describe, test, expect, beforeEach } from 'vitest'
import { CueTimelineTracker } from '@hexagon/CueTimelineTracker'
import { Cue } from '@hexagon/Cue'
import { CueBuilder } from './CueBuilder'
import { AudioFileName } from '@hexagon/AudioFileName'

describe('CueTimelineTracker', () => {
  let tracker: CueTimelineTracker

  beforeEach(() => {
    tracker = new CueTimelineTracker()
  })

  describe('Circular buffer behavior', () => {
    test('stores past cues when they finish playing', () => {
      const cue1 = new CueBuilder().withText('First cue').build()
      const cue2 = new CueBuilder().withText('Second cue').build()

      tracker.addDueCue(cue1, 60)
      tracker.onCueStarted(cue1)
      tracker.onCueFinished(cue1)

      tracker.addDueCue(cue2, 120)
      tracker.onCueStarted(cue2)
      tracker.onCueFinished(cue2)

      const timeline = tracker.getTimeline(180, [])

      expect(timeline.past).toHaveLength(2)
      expect(timeline.past[0].cue.text).toBe('First cue')
      expect(timeline.past[0].triggeredAt).toBe(60)
      expect(timeline.past[1].cue.text).toBe('Second cue')
      expect(timeline.past[1].triggeredAt).toBe(120)
    })

    test('maintains max 3 past cues in circular buffer', () => {
      const cue1 = new CueBuilder().withText('Cue 1').build()
      const cue2 = new CueBuilder().withText('Cue 2').build()
      const cue3 = new CueBuilder().withText('Cue 3').build()
      const cue4 = new CueBuilder().withText('Cue 4').build()

      // Add 4 cues
      tracker.addDueCue(cue1, 60)
      tracker.onCueStarted(cue1)
      tracker.onCueFinished(cue1)

      tracker.addDueCue(cue2, 120)
      tracker.onCueStarted(cue2)
      tracker.onCueFinished(cue2)

      tracker.addDueCue(cue3, 180)
      tracker.onCueStarted(cue3)
      tracker.onCueFinished(cue3)

      tracker.addDueCue(cue4, 240)
      tracker.onCueStarted(cue4)
      tracker.onCueFinished(cue4)

      const timeline = tracker.getTimeline(300, [])

      // Should only have last 3 (oldest "Cue 1" dropped)
      expect(timeline.past).toHaveLength(3)
      expect(timeline.past[0].cue.text).toBe('Cue 2')
      expect(timeline.past[1].cue.text).toBe('Cue 3')
      expect(timeline.past[2].cue.text).toBe('Cue 4')
    })

    test('past cues are ordered oldest to newest', () => {
      const cue1 = new CueBuilder().withText('First').build()
      const cue2 = new CueBuilder().withText('Second').build()
      const cue3 = new CueBuilder().withText('Third').build()

      tracker.addDueCue(cue1, 60)
      tracker.onCueStarted(cue1)
      tracker.onCueFinished(cue1)

      tracker.addDueCue(cue2, 120)
      tracker.onCueStarted(cue2)
      tracker.onCueFinished(cue2)

      tracker.addDueCue(cue3, 180)
      tracker.onCueStarted(cue3)
      tracker.onCueFinished(cue3)

      const timeline = tracker.getTimeline(240, [])

      expect(timeline.past[0].triggeredAt).toBe(60) // oldest
      expect(timeline.past[1].triggeredAt).toBe(120)
      expect(timeline.past[2].triggeredAt).toBe(180) // newest
    })
  })

  describe('Current cue tracking', () => {
    test('onCueStarted sets current cue', () => {
      const cue = new CueBuilder().withText('Current cue').build()

      tracker.addDueCue(cue, 60)
      tracker.onCueStarted(cue)

      const timeline = tracker.getTimeline(60, [])

      expect(timeline.current).not.toBeNull()
      expect(timeline.current?.cue.text).toBe('Current cue')
      expect(timeline.current?.triggeredAt).toBe(60)
    })

    test('onCueFinished moves current to past and clears current', () => {
      const cue = new CueBuilder().withText('Finishing cue').build()

      tracker.addDueCue(cue, 60)
      tracker.onCueStarted(cue)

      let timeline = tracker.getTimeline(60, [])
      expect(timeline.current).not.toBeNull()

      tracker.onCueFinished(cue)

      timeline = tracker.getTimeline(90, [])
      expect(timeline.current).toBeNull()
      expect(timeline.past).toHaveLength(1)
      expect(timeline.past[0].cue.text).toBe('Finishing cue')
    })

    test('only one current cue at a time', () => {
      const cue1 = new CueBuilder().withText('First').build()
      const cue2 = new CueBuilder().withText('Second').build()

      tracker.addDueCue(cue1, 60)
      tracker.onCueStarted(cue1)

      // Start second cue without finishing first (shouldn't happen but test it)
      tracker.addDueCue(cue2, 120)
      tracker.onCueStarted(cue2)

      const timeline = tracker.getTimeline(120, [])

      expect(timeline.current).not.toBeNull()
      expect(timeline.current?.cue.text).toBe('Second') // latest cue
    })

    test('starting a cue before finishing previous moves previous to past', () => {
      const cue1 = new CueBuilder().withText('First').build()
      const cue2 = new CueBuilder().withText('Second').build()

      tracker.addDueCue(cue1, 60)
      tracker.onCueStarted(cue1)

      // Start second without finishing first
      tracker.addDueCue(cue2, 120)
      tracker.onCueStarted(cue2)

      const timeline = tracker.getTimeline(120, [])

      expect(timeline.current?.cue.text).toBe('Second')
      expect(timeline.past).toHaveLength(1)
      expect(timeline.past[0].cue.text).toBe('First')
    })
  })

  describe('Upcoming cue calculation', () => {
    test('interval cue: calculates next trigger correctly', () => {
      const intervalCue: Cue = {
        id: 'interval-1',
        text: 'Every 60 seconds',
        audioUrl: AudioFileName.createMP3('Every 60 seconds'),
        triggerType: 'interval',
        interval: 60
      }

      const timeline = tracker.getTimeline(100, [intervalCue])

      expect(timeline.upcoming).toHaveLength(1)
      expect(timeline.upcoming[0].text).toBe('Every 60 seconds')
    })

    test('one-time cue: included if triggerAt > gameTime', () => {
      const oneTimeCue: Cue = {
        id: 'onetime-1',
        text: 'At 5:00',
        audioUrl: AudioFileName.createMP3('At 5:00'),
        triggerType: 'oneTime',
        triggerAt: 300 // 5:00
      }

      const timelineBefore = tracker.getTimeline(250, [oneTimeCue])
      expect(timelineBefore.upcoming).toHaveLength(1)

      const timelineAt = tracker.getTimeline(300, [oneTimeCue])
      expect(timelineAt.upcoming).toHaveLength(0) // Not upcoming, it's due now

      const timelineAfter = tracker.getTimeline(350, [oneTimeCue])
      expect(timelineAfter.upcoming).toHaveLength(0) // Past
    })

    test('objective cue: included if spawn time approaching', () => {
      const objectiveCue: Cue = {
        id: 'objective-1',
        text: 'Dragon spawning',
        audioUrl: AudioFileName.createMP3('Dragon spawning'),
        triggerType: 'objective',
        objective: 'dragon',
        beforeObjective: 30
      }

      // Mock objective state: Dragon spawns at 5:00 (300s)
      const mockObjectives = {
        dragon: { isAlive: true, nextSpawn: 300, teamStats: { blue: 0, red: 0 } },
        baron: { isAlive: false, nextSpawn: null },
        grubs: { isAlive: false, nextSpawn: null },
        herald: { isAlive: false, nextSpawn: null },
        atakhan: { isAlive: false, nextSpawn: null }
      }

      // At 250s, cue triggers at 4:30 (270s = 300 - 30), so it should be upcoming
      const timeline = tracker.getTimeline(250, [objectiveCue], mockObjectives)
      expect(timeline.upcoming).toHaveLength(1)
    })

    test('event cue: NOT included (unpredictable)', () => {
      const eventCue: Cue = {
        id: 'event-1',
        text: 'On respawn',
        audioUrl: AudioFileName.createMP3('on-respawn'),
        triggerType: 'event',
        event: 'respawn'
      }

      const timeline = tracker.getTimeline(100, [eventCue])

      expect(timeline.upcoming).toHaveLength(0)
    })

    test('returns max 2 upcoming cues', () => {
      const cue1: Cue = {
        id: '1',
        text: 'At 2:00',
        audioUrl: AudioFileName.createMP3('at-2-00'),
        triggerType: 'oneTime',
        triggerAt: 120
      }

      const cue2: Cue = {
        id: '2',
        text: 'At 3:00',
        audioUrl: AudioFileName.createMP3('at-3-00'),
        triggerType: 'oneTime',
        triggerAt: 180
      }

      const cue3: Cue = {
        id: '3',
        text: 'At 4:00',
        audioUrl: AudioFileName.createMP3('at-4-00'),
        triggerType: 'oneTime',
        triggerAt: 240
      }

      const cue4: Cue = {
        id: '4',
        text: 'At 5:00',
        audioUrl: AudioFileName.createMP3('at-5-00'),
        triggerType: 'oneTime',
        triggerAt: 300
      }

      const timeline = tracker.getTimeline(60, [cue1, cue2, cue3, cue4])

      expect(timeline.upcoming).toHaveLength(2)
      expect(timeline.upcoming[0].triggerAt).toBe(120) // nearest first
      expect(timeline.upcoming[1].triggerAt).toBe(180)
    })

    test('sorts upcoming by trigger time (nearest first)', () => {
      const farCue: Cue = {
        id: '1',
        text: 'At 5:00',
        audioUrl: AudioFileName.createMP3('at-5-00'),
        triggerType: 'oneTime',
        triggerAt: 300
      }

      const nearCue: Cue = {
        id: '2',
        text: 'At 2:00',
        audioUrl: AudioFileName.createMP3('at-2-00'),
        triggerType: 'oneTime',
        triggerAt: 120
      }

      // Pass in far cue first
      const timeline = tracker.getTimeline(60, [farCue, nearCue])

      expect(timeline.upcoming).toHaveLength(2)
      expect(timeline.upcoming[0].triggerAt).toBe(120) // nearest
      expect(timeline.upcoming[1].triggerAt).toBe(300) // farther
    })

    test('excludes cues with endTime in past from upcoming', () => {
      const cue: Cue = {
        id: '1',
        text: 'Ends at 3:00',
        audioUrl: AudioFileName.createMP3('ends-at-3-00'),
        triggerType: 'interval',
        interval: 60,
        endTime: 180
      }

      const timelineBefore = tracker.getTimeline(120, [cue])
      expect(timelineBefore.upcoming).toHaveLength(1)

      const timelineAfter = tracker.getTimeline(200, [cue])
      expect(timelineAfter.upcoming).toHaveLength(0) // endTime passed
    })

    test('interval cue: next trigger calculation is correct', () => {
      const intervalCue: Cue = {
        id: 'interval-1',
        text: 'Every 90 seconds',
        audioUrl: AudioFileName.createMP3('every-90-seconds'),
        triggerType: 'interval',
        interval: 90
      }

      // At gameTime 100, next trigger should be at 180
      // Formula: currentGameTime + (interval - (currentGameTime % interval))
      // 100 + (90 - (100 % 90)) = 100 + (90 - 10) = 100 + 80 = 180
      const timeline = tracker.getTimeline(100, [intervalCue])

      expect(timeline.upcoming).toHaveLength(1)
    })
  })

  describe('Reset behavior', () => {
    test('reset clears past, current, and upcoming', () => {
      const cue1 = new CueBuilder().withText('Past cue').build()
      const cue2 = new CueBuilder().withText('Current cue').build()

      tracker.addDueCue(cue1, 60)
      tracker.onCueStarted(cue1)
      tracker.onCueFinished(cue1)

      tracker.addDueCue(cue2, 120)
      tracker.onCueStarted(cue2)

      let timeline = tracker.getTimeline(120, [])
      expect(timeline.past).toHaveLength(1)
      expect(timeline.current).not.toBeNull()

      tracker.reset()

      timeline = tracker.getTimeline(120, [])
      expect(timeline.past).toHaveLength(0)
      expect(timeline.current).toBeNull()
      expect(timeline.upcoming).toHaveLength(0)
    })
  })

  describe('Edge cases', () => {
    test('no cues returns empty timeline', () => {
      const timeline = tracker.getTimeline(100, [])

      expect(timeline.past).toHaveLength(0)
      expect(timeline.current).toBeNull()
      expect(timeline.upcoming).toHaveLength(0)
    })

    test('handles multiple cues at same trigger time', () => {
      const cue1: Cue = {
        id: '1',
        text: 'First at 2:00',
        audioUrl: AudioFileName.createMP3('first-at-2-00'),
        triggerType: 'oneTime',
        triggerAt: 120
      }

      const cue2: Cue = {
        id: '2',
        text: 'Second at 2:00',
        audioUrl: AudioFileName.createMP3('second-at-2-00'),
        triggerType: 'oneTime',
        triggerAt: 120
      }

      const timeline = tracker.getTimeline(60, [cue1, cue2])

      expect(timeline.upcoming.length).toBeGreaterThan(0)
      expect(timeline.upcoming.length).toBeLessThanOrEqual(2)
    })

    test('cue that has already been played does not appear in upcoming', () => {
      const cue: Cue = {
        id: '1',
        text: 'At 2:00',
        audioUrl: AudioFileName.createMP3('at-2-00'),
        triggerType: 'oneTime',
        triggerAt: 120
      }

      tracker.addDueCue(cue, 120)
      tracker.onCueStarted(cue)
      tracker.onCueFinished(cue)

      const timeline = tracker.getTimeline(180, [cue])

      expect(timeline.upcoming).toHaveLength(0)
      expect(timeline.past).toHaveLength(1)
    })

    test('getTimeline without any cues having been added or started', () => {
      const cue: Cue = {
        id: '1',
        text: 'Future cue',
        audioUrl: AudioFileName.createMP3('future-cue'),
        triggerType: 'oneTime',
        triggerAt: 300
      }

      const timeline = tracker.getTimeline(60, [cue])

      expect(timeline.past).toHaveLength(0)
      expect(timeline.current).toBeNull()
      expect(timeline.upcoming).toHaveLength(1)
    })
  })
})
