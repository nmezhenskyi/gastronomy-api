import config from 'config'
import path from 'path'
import { Command } from 'commander'

export const VERSION = config.get<string>('version')

// Command Line Arguments:
const program = new Command()
program.version(VERSION, '-v, --version', 'output the current version')
program.option('-d, --debug', 'output extra debug information')
program.option('--sql-logs', 'output sql queries')
program.parse(process.argv)

// General:
export const API_URL = `http${config.get('environment.secure') ? 's' : ''}://${config.get('environment.host')}:${config.get('environment.port')}`
export const PROD = process.env.NODE_ENV === 'production'
export const PORT = process.env.PORT || config.get('environment.port')
export const LOG_DIR = path.join(__dirname, '../../logs/')
export const OPTIONS = program.opts()

// Cookies:
export const COOKIE_MAX_AGE = 14 * 24 * 60 * 60 * 1000

// Rate-limiting:
export const WINDOW_SIZE = 59
export const WINDOW_REQUEST_LIMIT = PROD ? 50 : 15
