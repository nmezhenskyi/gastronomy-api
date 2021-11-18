import NodeCache from 'node-cache'
import { WINDOW_SIZE } from './constants'

/**
 * In-memory cache for the API.
 */
export const memCache = new NodeCache({ stdTTL: WINDOW_SIZE })
