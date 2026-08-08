import {LitecoindManager} from './manager.js'
import {ensureConfig} from '../config/config.js'

import type {LitecoindVersion, LitecoindStatus, LitecoindLifecycleResponse, ExitInfo} from '#types'
import type WebSocket from 'ws'

// Single litecoind manager instance that is used throughout the backend
export const litecoind = new LitecoindManager()

// Boot up litecoind
export async function bootLitecoind(): Promise<void> {
	// Ensure that the litecoind configuration files are written and up-to-date before starting litecoind
	await ensureConfig()

	litecoind.start()
}

// Public façade for the singleton LitecoindManager.
// Gives routes a one-liner API: `app.post('/restart', litecoind.restart)`.

export const version = (): LitecoindVersion => litecoind.versionInfo

export const status = (): LitecoindStatus => litecoind.status()

export const start = (): LitecoindLifecycleResponse => {
	if (status().running) return {...status(), result: 'no_op'}
	litecoind.start()
	return {...status(), result: 'started'}
}

export const stop = async (): Promise<LitecoindLifecycleResponse> => {
	if (!status().running) return {...status(), result: 'no_op'}
	await litecoind.stop()
	return {...status(), result: 'stopped'}
}

export const restart = async (): Promise<LitecoindLifecycleResponse> => {
	await litecoind.restart()
	return {...status(), result: 'started'}
}

export const exitInfo = (): ExitInfo | null => litecoind.exitInfo

export const events = () => litecoind.events

// WebSocket stream for litecoind exit events
export function wsExitStream(socket: WebSocket) {
	const send = (payload: unknown) => socket.send(JSON.stringify(payload))

	// Sends a snapshot immediately after the client connects
	send({
		type: 'snapshot',
		running: litecoind.status().running,
		exit: litecoind.exitInfo, // null if never crashed
	})

	// Pushes "exit" events whenever litecoind stops unexpectedly
	const handler = (info: ExitInfo) => send({type: 'exit', ...info})

	litecoind.events.on('exit', handler)
	socket.on('close', () => litecoind.events.off('exit', handler))
}
