import { Response, NextFunction } from 'express'
import { AuthRequest, Role } from '../common/types'
import { authenticate } from './authenticate'
import { ApiError } from '../exceptions/api-error'

/**
 * Middleware for securing routes.
 * Restricts access to a route based on the provided roles.
 * Includes `authenticate` middleware in the chain.
 */
export const authorize = (roles: Role | Role[] = []) => {
   return [
      authenticate,
      (req: AuthRequest, _: Response, next: NextFunction) => {
         if (!(roles instanceof Array))
            roles = [roles]

         if (roles.length) {
            let authorized = false

            roles.forEach(role => {
               switch (role) {
                  case Role.USER:
                     if (req.user)
                        authorized = true
                     break
                  case Role.CREATOR:
                     if (req.member?.role === Role.CREATOR)
                        authorized = true
                     break
                  case Role.SUPERVISOR:
                     if (req.member?.role === Role.SUPERVISOR)
                        authorized = true
                     break
                  default:
                     authorized = false
               }
            })

            if (!authorized) return next(ApiError.Forbidden())
         }
      
         return next()
      }
   ]
}
