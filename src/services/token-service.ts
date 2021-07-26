import jwt, { JwtPayload } from 'jsonwebtoken'
import config from 'config'
import { getRepository } from 'typeorm'
import { RefreshToken } from '../models/refresh-token'
import { ServiceResponse } from './service-response'
import { UserService } from './user-service'
import { TokenPair } from '../common/types'

/**
 * Manages (generates, validates, persists) access and refresh Json Web Tokens.
 */
export const TokenService = {
   /**
    * Generates a pair of access and refresh tokens.
    * 
    * @param payload Payload object for the JWT
    * @returns Object with access and refresh tokens
    */
   generateTokens(payload: { user: { id: string } } | { member: { id: string, role: string }}): TokenPair {
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

   /**
    * Validates access token.
    * 
    * @param token JWT
    * @returns JWT's payload if token is valid, null otherwise.
    */
   validateAccessToken(token: string): JwtPayload | null {
      try {
         const userData = jwt.verify(token, config.get('secrets.jwt-access-secret'))

         if (typeof userData !== 'object') return null

         return userData
      }
      catch (err) {
         return null
      }
   },

   /**
    * Validates refresh token.
    * 
    * @param token JWT
    * @returns JWT's payload if token is valid, null otherwise.
    */
   validateRefreshToken(token: string): JwtPayload | null {
      try {
         const userData = jwt.verify(token, config.get('secrets.jwt-refresh-secret'))

         if (typeof userData !== 'object') return null

         return userData
      }
      catch (err) {
         return null
      }
   },

   /**
    * Saves user's refresh token to the database.
    * 
    * @param userId User's id
    * @param refreshToken User's refresh token
    * @returns ServiceResponse object with the saved token, if query was successful.
    */
   async saveUserToken(userId: string, refreshToken: string): Promise<ServiceResponse<RefreshToken>> {
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

   /**
    * Removes user's refresh token from the database.
    * 
    * @param refreshToken User's refresh token
    * @returns ServiceResponse object.
    */
   async removeUserToken(refreshToken: string): Promise<ServiceResponse<null>> {
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

   /**
    * Finds refresh token in the database.
    * 
    * @param refreshToken User's refresh token
    * @returns ServiceResponse object with the found token, if the query was successful.
    */
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
