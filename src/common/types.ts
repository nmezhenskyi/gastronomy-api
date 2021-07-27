import { Request } from 'express'

/**
 * Role reflects different authorization level.
 * 
 * - ```SUPERVISOR``` - member role with the highest access level
 * - ```CREATOR``` - member role with the full CRUD access to *cocktails*, *meals*, and *ingredients* collections
 * - ```USER``` - user role
 */
export enum Role {
   SUPERVISOR = 'Supervisor',
   CREATOR = 'Creator',
   USER = 'User'
}

/**
 * Authenticated request for *express* middleware.
 */
export interface AuthRequest extends Request {
   user?: {
      id: string
   },
   member?: {
      id: string,
      role: string
   }
}

/**
 * Pair of access and refresh tokens.
 */
export interface TokenPair {
   accessToken: string,
   refreshToken: string
}
