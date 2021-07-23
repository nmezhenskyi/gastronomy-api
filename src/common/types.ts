import { Request } from 'express'

export interface AuthRequest extends Request {
   user?: {
      id: string
   },
   member?: {
      id: string,
      role: string
   }
}
