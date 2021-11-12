import { Response, NextFunction } from 'express'
import { AuthRequest } from '../common/types'
import { TokenService } from '../services/token-service'

/**
 * Middleware for securing routes.
 * Authenticates user by validating JWT in the Authorization header.
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
   const authorizationHeader = req.headers.authorization
   if (!authorizationHeader) return res.status(401).json({ message: 'Not Authorized' })

   const accessToken = authorizationHeader.replace('Bearer ', '')
   if (!accessToken) return res.status(401).json({ message: 'Not Authorized' })

   const payload = TokenService.validateAccessToken(accessToken)

   if (!payload) return res.status(401).json({ message: 'Not Authorized' })

   if (payload.user)
      req.user = { id: payload.user.id }
   else if (payload.member)
      req.member = { id: payload.member.id, role: payload.member.role  }
   
   return next()
}
