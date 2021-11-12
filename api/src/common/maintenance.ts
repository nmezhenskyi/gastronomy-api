import { CronJob } from 'cron'
import { TokenService } from '../services/token-service'

/**
 * Cron job to clean up expired user sessions.
 */
export const cleanUpExpiredSessions = new CronJob('00 00 00 * * *', async () => {
   await TokenService.cleanUp()
})
