import config from 'config'
import path from 'path'
import { Command } from 'commander'

// Command Line Arguments:
const program = new Command()
program.version('0.1.0', '-v, --version', 'output the current version')
program.option('-d, --debug', 'output extra debug information')
program.option('--sql-logs', 'output sql queries')
program.parse(process.argv)

export const API_URL = `http${config.get('environment.secure') ? 's' : ''}://${config.get('environment.host')}:${config.get('environment.port')}`
export const PROD = process.env.NODE_ENV === 'production'
export const PORT = process.env.PORT || config.get('environment.port')
export const LOG_DIR = path.join(__dirname, '../../logs/')
export const OPTIONS = program.opts()
