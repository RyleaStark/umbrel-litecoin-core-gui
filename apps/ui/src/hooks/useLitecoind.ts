import {useQuery} from '@tanstack/react-query'
import {api} from '@/lib/api'
import type {LitecoindStatus, LitecoindVersion} from '#types'

// TODO: settle on cache times
export function useLitecoindVersion() {
	return useQuery({
		queryKey: ['litecoind', 'version'],
		queryFn: () => api<LitecoindVersion>('/litecoind/version'),
		// refetchInterval: 5_000,
		staleTime: Infinity, // never changes until user updates
	})
}

export function useLitecoindStatus() {
	return useQuery({
		queryKey: ['litecoind', 'status'],
		queryFn: () => api<LitecoindStatus>('/litecoind/status'),
		refetchInterval: 5_000,
		staleTime: 2_500,
	})
}
