import { Request, Response, NextFunction } from 'express'
import { ApiError } from '../exceptions/api-error'
import { logger } from '../common/logger'

/**
 * Error handling middleware for the whole API.
 * 
 * Accepts `Error` object as a first parameter.
 */
export const errorHandler = (err: Error, _: Request, res: Response, __: NextFunction) => {
   logger.error(err)

   if (err instanceof ApiError) {
      return res.status(err.status).json({ error: err.message })
   }

   return res.status(500).json({ error: 'Internal Error' })
}
