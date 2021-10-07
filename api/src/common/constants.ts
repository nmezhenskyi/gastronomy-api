import config from 'config'
import path from 'path'

export const API_URL = `http${config.get('environment.secure') ? 's' : ''}://${config.get('environment.host')}:${config.get('environment.port')}`
export const PROD = process.env.NODE_ENV === 'production'
export const PORT = process.env.PORT || config.get('environment.port')
export const LOG_DIR = path.join(__dirname, '../../logs/')
