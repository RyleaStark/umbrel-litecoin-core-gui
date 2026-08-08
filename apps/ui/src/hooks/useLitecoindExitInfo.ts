// Hook to get the most-recent ExitInfo *from React-Query cache*
// The useLitecoindExitSocket ws hook keeps the cache up-to-date in real time.

import {useQuery, useQueryClient} from '@tanstack/react-query'

import {api} from '@/lib/api'
import type {ExitInfo} from '#types'

export function useLitecoindExitInfo() {
	const qc = useQueryClient()

	return useQuery<ExitInfo | null>({
		queryKey: ['litecoind', 'exit'],
		initialData: () => qc.getQueryData(['litecoind', 'exit']) as ExitInfo | null,

		// Will fetch only if the cache hasn't been filled by the WebSocket yet
		enabled: qc.getQueryData(['litecoind', 'exit']) === undefined,
		queryFn: () => api<ExitInfo | null>('/litecoind/exit-info'),
		staleTime: 30_000,
	})
}
