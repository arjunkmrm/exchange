import BitlySDK from '@kwenta/sdk'

import { StatsTimeframe } from 'hooks/useStatsData'
import { QueryStatus } from 'state/types'

type StatsQueryStatuses = Record<'leaderboard', QueryStatus>

export type AccountStat = Awaited<ReturnType<BitlySDK['stats']['getLeaderboard']>>['all'][number]

export type StatsState = {
	queryStatuses: StatsQueryStatuses
	selectedTimeframe: StatsTimeframe
	leaderboard: Awaited<ReturnType<BitlySDK['stats']['getLeaderboard']>>
	leaderboardSearchTerm: string
}
