import { Request, Response, NextFunction } from 'express'
import { ApiError } from '../exceptions/api-error'

/**
 * Handles requests to nonexistent end-points.
 */
export const notFoundHandler = (_: Request, __: Response, next: NextFunction) => {
   return next(ApiError.NotFound('Requested resource not found'))
}
