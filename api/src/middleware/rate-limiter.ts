import { Request, Response, NextFunction } from 'express'
import { memCache } from '../common/mem-cache'
import { WINDOW_SIZE, WINDOW_REQUEST_LIMIT } from '../common/constants'
import { ApiError } from '../exceptions/api-error'

/**
 * Middleware for rate-limiting by ip.
 */
export const rateLimiter = async (req: Request, _: Response, next: NextFunction) => {
   try {
      const key = `${req.ip}:${(new Date).getMinutes()}`
      const reqCount = memCache.get<number>(key)

      if (reqCount === undefined) {
         memCache.set(key, 1, WINDOW_SIZE)
         return next()
      }

      if (reqCount > WINDOW_REQUEST_LIMIT) {
         throw ApiError.TooManyRequests()
      }

      const ttl = memCache.getTtl(key)
      const expireIn = ttl ? (new Date(ttl - Date.now())).getSeconds() + 1 : WINDOW_SIZE
      memCache.set(key, reqCount + 1, expireIn)

      return next()
   }
   catch (err: unknown) {
      return next(err)
   }
}
