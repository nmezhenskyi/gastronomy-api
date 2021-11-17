import jwt, { JwtPayload } from 'jsonwebtoken'
import config from 'config'
import { getRepository, LessThan } from 'typeorm'
import { UserService } from './user-service'
import { UserRefreshToken } from '../models/user-refresh-token'
import { TokenPair } from '../common/types'
import { ApiError } from '../exceptions/api-error'

/**
 * Manages access and refresh Json Web Tokens.
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
         expiresIn: '30m'
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
    * Generates access token.
    * 
    * @param payload Payload object for the JWT
    * @returns String with access token
    */
   generateAccessToken(payload: { user: { id: string } } | { member: { id: string, role: string }}): string {
      const accessToken = jwt.sign(payload, config.get('secrets.jwt-access-secret'), {
         issuer: 'gastronomy-api',
         expiresIn: '30m'
      })

      return accessToken
   },

   /**
    * Validates access token.
    * 
    * @param token JWT
    * @returns JWT's payload if token is valid, null otherwise
    */
   validateAccessToken(token: string): JwtPayload | null {
      try {
         const userData = jwt.verify(token, config.get('secrets.jwt-access-secret'))

         if (typeof userData !== 'object') return null

         return userData
      }
      catch (err: unknown) {
         return null
      }
   },

   /**
    * Validates refresh token.
    * 
    * @param token JWT
    * @returns JWT's payload if token is valid, null otherwise
    */
   validateRefreshToken(token: string): JwtPayload | null {
      try {
         const userData = jwt.verify(token, config.get('secrets.jwt-refresh-secret'))

         if (typeof userData !== 'object') return null

         return userData
      }
      catch (err: unknown) {
         return null
      }
   },

   /**
    * Saves user's refresh token to the database.
    * 
    * @param userId User's id
    * @param refreshToken User's refresh token
    * @returns ServiceResponse object with the saved token
    */
   async saveUserRefreshToken(userId: string, refreshToken: string): Promise<UserRefreshToken> {
      const payload = this.validateRefreshToken(refreshToken)
      if (!payload) throw ApiError.InternalError('Invalid refresh token')

      const repository = getRepository(UserRefreshToken)
      const user = await UserService.findOne({ id: userId })

      // Limit user to 6 refresh tokens
      const count = await repository.count({ where: { userId: user.id } })
      if (count >= 6) {
         const oldestToken = await repository.findOne({ where: { userId: user.id }, order: { createdAt: 'ASC' } })
         if (oldestToken) await repository.remove(oldestToken)
      }

      const newToken = new UserRefreshToken()
      newToken.user = user
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

      return saved
   },

   /**
    * Removes user's refresh token from the database.
    * 
    * @param refreshToken User's refresh token
    * @returns ServiceResponse object
    */
   async removeUserRefreshToken(refreshToken: string): Promise<void> {
      const repository = getRepository(UserRefreshToken)

      const tokenRecord = await repository.findOne({ token: refreshToken })
      if (!tokenRecord) return

      await repository.remove(tokenRecord)
   },

   /**
    * Finds user refresh token in the database.
    * 
    * @param refreshToken User's refresh token
    * @returns ServiceResponse object with the found token
    */
   async findUserRefreshToken(refreshToken: string): Promise<UserRefreshToken> {
      const repository = getRepository(UserRefreshToken)

      const tokenRecord = await repository.findOne({ token: refreshToken })

      if (!tokenRecord) throw ApiError.InternalError('Refresh token is invalid')

      return tokenRecord
   },

   /**
    * Removes expired user refresh tokens from the database.
    */
   async cleanUp(): Promise<void> {
      try {
         const repository = getRepository(UserRefreshToken)

         const expired = new Date()
         expired.setDate(expired.getDate() - 14)

         const tokens = await repository.find({
            where: { expiryDate: LessThan(expired) }
         })

         if (!tokens || !tokens.length) return

         for (const token of tokens) {
            await repository.remove(token)
         }
      }
      catch (err: unknown) {
         return
      }
   }
}
