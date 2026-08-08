import {peerCount} from '../peers/peers.js'
import {rpcClient} from '../litecoind/rpc-client.js'
import {litecoind} from '../litecoind/litecoind.js'
import type {Stats} from '#types'

export async function summary(): Promise<Stats> {
	const [peerSum, mempool, chainInfo] = await Promise.all([
		peerCount(), // already cached 5s in peers.ts
		rpcClient.command<{usage: number}>('getmempoolinfo'),
		rpcClient.command<{size_on_disk: number}>('getblockchaininfo'),
	])

	const {startedAt, running} = litecoind.status()

	return {
		peers: peerSum.total,
		mempoolBytes: mempool.usage,
		chainBytes: chainInfo.size_on_disk,
		uptimeSec: running && startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0,
	}
}
