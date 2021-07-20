import jwt from 'jsonwebtoken'
import config from 'config'

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
   }
}
