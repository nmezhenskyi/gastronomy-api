import { Response, NextFunction } from 'express'
import { AuthRequest } from '../common/types'
import { TokenService } from '../services/token-service'
import { ApiError } from '../exceptions/api-error'

/**
 * Middleware for securing routes.
 * Authenticates user by validating JWT in the Authorization header.
 */
export const authenticate = (req: AuthRequest, _: Response, next: NextFunction) => {
   const authorizationHeader = req.headers.authorization
   if (!authorizationHeader) return next(ApiError.Unauthorized())

   const accessToken = authorizationHeader.replace('Bearer ', '')
   if (!accessToken) return next(ApiError.Unauthorized())

   const payload = TokenService.validateAccessToken(accessToken)

   if (!payload) return next(ApiError.Unauthorized())

   if (payload.user)
      req.user = { id: payload.user.id }
   else if (payload.member)
      req.member = { id: payload.member.id, role: payload.member.role  }
   
   return next()
}
