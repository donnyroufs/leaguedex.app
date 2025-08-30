# Removal of cue repositories

## Context

Initially, we had separate repositories for Cues and CuePacks. The CueRepository was responsible for storing individual cues that could potentially be reused across different packs.

## Decision

We decided to remove the CueRepository and only keep the CuePackRepository. This decision was made because:

1. The current domain model treats cues as integral parts of a CuePack rather than standalone entities
2. There was no immediate need for cue reusability across packs
3. It simplified the architecture by removing an unnecessary abstraction

## Consequences

### Positive
- Simpler architecture with fewer moving parts
- Clearer domain model where cues are tightly coupled to their packs
- Reduced complexity in data management

### Negative
- If we later decide that cues should be reusable building blocks across packs, we'll need to reintroduce a cue repository
- No way to share common cues between packs without duplication


## Notes

If future requirements indicate that cues should be treated as reusable building blocks, we may want to reconsider this decision and reintroduce a dedicated CueRepository.


The repositories were removed in commit `51209b48fa0133940597107f5e035c1ccefbfa3d`