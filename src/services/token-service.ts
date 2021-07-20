import jwt from 'jsonwebtoken'
import config from 'config'
import { getRepository } from 'typeorm'
import { RefreshToken } from '../models/refresh-token'
import { ServiceResponse } from './service-response'
import { UserService } from './user-service'

export const TokenService = {
   generateTokens(payload: any) {
      const accessToken = jwt.sign(payload, config.get('secrets.jwt-access-secret'), {
         issuer: 'gastronomy-api',
         expiresIn: '15m'
      })
      const refreshToken = jwt.sign(payload, config.get('secrets.jwt-refresh-secret'), {
         issuer: 'gastronomy-api',
         expiresIn: '14d'
      })

      return {
         accessToken,
         refreshToken
      }
   },

   validateAccessToken(token: string) {
      try {
         const userData = jwt.verify(token, config.get('secrets.jwt-access-secret'))

         return userData
      }
      catch (err) {
         return null
      }
   },

   validateRefreshToken(token: string) {
      try {
         const userData = jwt.verify(token, config.get('secrets.jwt-refresh-secret'))

         return userData
      }
      catch (err) {
         return null
      }
   },

   async saveRefreshToken(userId: string, refreshToken: string): Promise<ServiceResponse<RefreshToken>> {
      try {
         const repository = getRepository(RefreshToken)

         const tokenRecord = await repository.findOne({ where: { userId }})

         if (tokenRecord) {
            tokenRecord.token = refreshToken
            const saved = await repository.save(tokenRecord)

            return {
               success: true,
               message: 'UPDATED',
               body: saved
            }
         }

         const user = await UserService.findOne({ id: userId })

         if (user.message === 'NOT_FOUND' || user.message === 'FAILED' || !user.body)
            return { success: false, message: 'FAILED'}

         const newToken = new RefreshToken()
         newToken.user = user.body
         newToken.token = refreshToken

         const saved = await repository.save(newToken)

         return {
            success: true,
            message: 'CREATED',
            body: saved
         }
      }
      catch (err) {
         return { success: false, message: 'FAILED' }
      }
   },

   async removeRefreshToken(refreshToken: string): Promise<ServiceResponse<null>> {
      try {
         const repository = getRepository(RefreshToken)

         const tokenRecord = await repository.findOne({ token: refreshToken })

         if (!tokenRecord) return { success: false, message: 'NOT_FOUND' }

         await repository.remove(tokenRecord)

         return {
            success: true,
            message: 'REMOVED',
            body: null
         }
      }
      catch (err) {
         return { success: false, message: 'FAILED' }
      }
   },

   async findRefreshToken(refreshToken: string): Promise<ServiceResponse<RefreshToken>> {
      try {
         const repository = getRepository(RefreshToken)

         const tokenRecord = await repository.findOne({ token: refreshToken })

         if (!tokenRecord) return { success: false, message: 'NOT_FOUND' }

         return {
            success: true,
            message: 'REMOVED',
            body: tokenRecord
         }
      }
      catch (err) {
         return { success: false, message: 'FAILED' }
      }
   }
}
