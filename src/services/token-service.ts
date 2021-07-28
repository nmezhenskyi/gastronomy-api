import jwt, { JwtPayload } from 'jsonwebtoken'
import config from 'config'
import { getRepository } from 'typeorm'
import { UserRefreshToken } from '../models/user-refresh-token'
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
   async saveUserToken(userId: string, refreshToken: string): Promise<ServiceResponse<UserRefreshToken>> {
      try {
         const payload = this.validateRefreshToken(refreshToken)
         if (!payload) return { success: false, message: 'INVALID' }

         const repository = getRepository(UserRefreshToken)
         const user = await UserService.findOne({ id: userId })

         if (user.message === 'NOT_FOUND' || user.message === 'FAILED' || !user.body)
            return { success: false, message: 'FAILED'}

         // Limit user to 6 refresh tokens
         const count = await repository.count({ where: { userId: user.body.id } })
         if (count >= 6) {
            const oldestToken = await repository.findOne({ where: { userId: user.body.id }, order: { createdAt: 'ASC' } })
            if (oldestToken) await repository.remove(oldestToken)
         }

         const newToken = new UserRefreshToken()
         newToken.user = user.body
         newToken.token = refreshToken
         if (payload.exp) {
            const date = new Date(0) // Set date to the start of the Epoch
            date.setUTCSeconds(payload.exp) // payload.exp returns number of seconds since the Epoch
            newToken.expiryDate = date
         }
         else {
            const date = new Date() // Set date to the current date
            date.setDate(date.getDate() + 14)
            newToken.expiryDate = date
         }

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
         const repository = getRepository(UserRefreshToken)

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
    * Finds user refresh token in the database.
    * 
    * @param refreshToken User's refresh token
    * @returns ServiceResponse object with the found token, if the query was successful.
    */
   async findUserRefreshToken(refreshToken: string): Promise<ServiceResponse<UserRefreshToken>> {
      try {
         const repository = getRepository(UserRefreshToken)

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
