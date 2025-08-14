import { JSX, useState, useMemo, useEffect } from 'react'
import { SearchInput } from '../components/SearchInput'
import { ChampionCard } from '../components/ChampionCard'
import { PageWrapper } from '../components/PageWrapper'

type Champion = {
  id: string
  name: string
  title: string
  imageUrl: string
  matchupIds: string[]
}

type Dex = {
  champions: Champion[]
}

type SearchResult = {
  champion: Champion
  matchReason: string | null
}

export function Dex(): JSX.Element {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [dex, setDex] = useState<Dex | null>(null)

  useEffect(() => {
    window.api.dex.all().then((dex) => {
      setDex(dex)
    })
  }, [])

  const champions = useMemo((): Champion[] => {
    if (!dex) return []
    return dex.champions
  }, [dex])

  const filteredChampions = useMemo((): SearchResult[] => {
    if (!searchQuery.trim()) {
      return champions.map(
        (champion): SearchResult => ({
          champion,
          matchReason: null
        })
      )
    }

    const query = searchQuery.toLowerCase()
    const results: SearchResult[] = []

    // Search through champions
    champions.forEach((champion): void => {
      let matchReason: string | null = null
      let shouldInclude = false

      // Check champion name and title
      if (
        champion.name.toLowerCase().includes(query) ||
        champion.title.toLowerCase().includes(query)
      ) {
        shouldInclude = true
        matchReason = `Matches "${champion.name}"`
      }

      // Check if query contains "vs" for matchup search
      if (query.includes('vs')) {
        const vsParts = query.split('vs').map((part): string => part.trim())
        if (vsParts.length === 2) {
          const [champion1, champion2] = vsParts

          // Check if this champion is involved in the matchup
          if (
            champion.name.toLowerCase().includes(champion1) ||
            champion.name.toLowerCase().includes(champion2)
          ) {
            shouldInclude = true
            matchReason = `Involved in matchup: ${champion1} vs ${champion2}`
          }
        }
      }

      // Check matchup IDs for this champion
      champion.matchupIds.forEach((matchupId): void => {
        const matchupParts = matchupId.split('-vs-')
        if (matchupParts.length === 2) {
          const [yourSide, enemySide] = matchupParts
          const [yourChampion, yourRole] = yourSide.split('-')
          const [enemyChampion, enemyRole] = enemySide.split('-')

          // Check if query matches any part of the matchup
          if (
            yourChampion.includes(query) ||
            enemyChampion.includes(query) ||
            yourRole.includes(query) ||
            enemyRole.includes(query) ||
            matchupId.includes(query)
          ) {
            shouldInclude = true
            matchReason = `Has matchup: ${yourChampion} (${yourRole}) vs ${enemyChampion} (${enemyRole})`
          }
        }
      })

      // Check if query matches a role (top, jungle, middle, bottom, utility)
      const roleKeywords = [
        'top',
        'jungle',
        'middle',
        'mid',
        'bottom',
        'bot',
        'utility',
        'supp',
        'support'
      ]
      const matchingRole = roleKeywords.find((role): boolean => role.includes(query))
      if (matchingRole) {
        // Check if this champion has any matchups in this role
        const hasRoleMatchup = champion.matchupIds.some((matchupId): boolean => {
          const matchupParts = matchupId.split('-vs-')
          if (matchupParts.length === 2) {
            const [yourSide] = matchupParts
            const [, yourRole] = yourSide.split('-')
            return (
              yourRole.includes(matchingRole) ||
              (matchingRole === 'mid' && yourRole.includes('middle')) ||
              (matchingRole === 'bot' && yourRole.includes('bottom')) ||
              (matchingRole === 'supp' && yourRole.includes('utility'))
            )
          }
          return false
        })

        if (hasRoleMatchup) {
          shouldInclude = true
          matchReason = `Has matchups in ${matchingRole} role`
        }
      }

      if (shouldInclude) {
        results.push({ champion, matchReason })
      }
    })

    // Remove duplicates (same champion might match multiple criteria)
    const uniqueResults = results.filter(
      (result, index, self): boolean =>
        index === self.findIndex((r): boolean => r.champion.id === result.champion.id)
    )

    return uniqueResults
  }, [champions, searchQuery])

  const championsWithMatchupsCount = useMemo(
    (): number => champions.filter((champion): boolean => champion.matchupIds.length > 0).length,
    [champions]
  )

  const handleChampionClick = (champion: Champion): void => {
    if (champion.matchupIds.length > 0) {
      console.log(`Clicked on ${champion.name}`)
    }
  }

  const handleSearchChange = (value: string): void => {
    setSearchQuery(value)
  }

  return (
    <PageWrapper>
      {/* Header Section */}
      <div className="p-6 border-b border-border-primary bg-bg-secondary/50 flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Champion Dex</h1>
            <p className="text-text-secondary">
              Master your matchups with {championsWithMatchupsCount} champions with matchups
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-status-in-game border border-border-accent rounded-lg">
              <div className="w-2 h-2 bg-status-success rounded-full animate-pulse" />
              <span className="text-sm text-text-primary font-medium">
                {championsWithMatchupsCount} With Matchups
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-bg-tertiary border border-border-primary rounded-lg">
              <div className="text-sm text-text-secondary">{champions.length} Total</div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="max-w-2xl">
          <SearchInput
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search champions, roles, or matchups (e.g., 'Aatrox', 'middle', 'Aatrox vs Udyr')"
            className="w-full"
          />
          {searchQuery.trim() && (
            <div className="mt-2 text-sm text-text-secondary">
              Found {filteredChampions.length} champion{filteredChampions.length !== 1 ? 's' : ''}
              {filteredChampions.length > 0 &&
                filteredChampions.some((r): boolean => r.matchReason !== null) && (
                  <span className="text-text-accent ml-2">• Showing match reasons</span>
                )}
            </div>
          )}
        </div>
      </div>

      {/* Champions Grid */}
      <div className="flex-1 overflow-y-auto min-h-0 p-6">
        {filteredChampions.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center w-full">
            <div className="w-20 h-20 bg-bg-tertiary rounded-full flex items-center justify-center mb-6">
              <span className="text-3xl">🔍</span>
            </div>
            <h3 className="text-3xl font-semibold text-text-primary mb-3">No champions found</h3>
            <p className="text-text-secondary max-w-2xl text-base leading-relaxed">
              Try adjusting your search terms or browse all champions by clearing the search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
            {filteredChampions.map(
              (result): JSX.Element => (
                <ChampionCard
                  key={result.champion.id}
                  name={result.champion.name}
                  title={result.champion.title}
                  imageUrl={result.champion.imageUrl}
                  isActive={result.champion.matchupIds.length > 0}
                  onClick={(): void => handleChampionClick(result.champion)}
                />
              )
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
