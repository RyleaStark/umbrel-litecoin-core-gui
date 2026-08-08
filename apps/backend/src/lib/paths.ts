import path from 'node:path'
import {fileURLToPath} from 'node:url'
import fse from 'fs-extra'

// litecoind binary
export const LITECOIND_BIN = process.env['LITECOIND_BIN'] || 'litecoind'

// litecoin wrapper binary used for multiprocess mode
export const LITECOIN_BIN = process.env['LITECOIN_BIN'] || 'litecoin'

// Absolute path to the monorepo root
export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../')

// litecoind -datadir (data/litecoin)
export const LITECOIN_DIR = process.env['LITECOIN_DIR'] || path.join(REPO_ROOT, 'data', 'litecoin')

// app config data dir (data/app)
export const APP_STATE_DIR = process.env['APP_STATE_DIR'] || path.join(REPO_ROOT, 'data', 'app')

// settings.json file path
export const SETTINGS_JSON = path.join(APP_STATE_DIR, 'settings.json')

// litecoin.conf file paths
export const LITECOIN_CONF = path.join(LITECOIN_DIR, 'litecoin.conf')
export const UMBREL_LITECOIN_CONF = path.join(LITECOIN_DIR, 'umbrel-litecoin.conf')

// Litecoin Core installation path for litecoind versions
export const LITECOIN_CORE_VERSIONS_DIR = '/opt/litecoind'

// Symbolic link for default litecoind binary
export const LITECOIN_CORE_CURRENT_SYMLINK = `${LITECOIN_CORE_VERSIONS_DIR}/current`

// Ensure that the required data directories exist
export async function ensureDirs() {
	await Promise.all([fse.ensureDir(LITECOIN_DIR), fse.ensureDir(APP_STATE_DIR)])
}
