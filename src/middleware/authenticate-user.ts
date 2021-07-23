import { Response, NextFunction } from 'express'
import { AuthRequest } from '../common/types'
import { TokenService } from '../services/token-service'

/**
 * Middleware for securing routes.
 * Authenticates user by validating JWT in the Authorization header.
 */
export const authenticateUser = (req: AuthRequest, res: Response, next: NextFunction) => {
   const authorizationHeader = req.headers.authorization
   if (!authorizationHeader) return res.status(401).json({ message: 'Error: Not Authorized' })

   const accessToken = authorizationHeader.replace('Bearer ', '')
   if (!accessToken) return res.status(401).json({ message: 'Error: Not Authorized' })

   const userData = TokenService.validateAccessToken(accessToken)

   if (!userData || typeof userData !== 'object')
      return res.status(401).json({ message: 'Error: Not Authorized' })
      
   req.user = { id: userData.id }
   
   return next()
}
