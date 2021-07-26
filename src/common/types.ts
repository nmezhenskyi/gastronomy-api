import { Request } from 'express'

export enum Role {
   SUPERVISOR = 'Supervisor',
   CREATOR = 'Creator',
   USER = 'User'
}

export interface AuthRequest extends Request {
   user?: {
      id: string
   },
   member?: {
      id: string,
      role: string
   }
}

export interface TokenPair {
   accessToken: string,
   refreshToken: string
}
