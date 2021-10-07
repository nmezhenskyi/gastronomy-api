import express from 'express'
import config from 'config'
import { API_URL } from '../common/constants'

const router = express.Router()

/**
 * Root route of the API.
 * 
 * @route   GET /
 * @access  Public
 */
router.get('/', (_, res) => {
   const rootDocument = {
      documentation: config.get('documentation'),
      links: [
         {
            rel: 'cocktail',
            href: `${API_URL}/cocktails`,
            action: 'GET',
            description: 'Find cocktail recipes'
         },
         {
            rel: 'meal',
            href: `${API_URL}/meals`,
            action: 'GET',
            description: 'Find meal recipes'
         },
         {
            rel: 'ingredient',
            href: `${API_URL}/ingredients`,
            action: 'GET',
            description: 'Find ingredients'
         },
         {
            rel: 'user',
            href: `${API_URL}/user`,
            action: 'POST',
            description: 'Register user account'
         },
         {
            rel: 'user',
            href: `${API_URL}/user/login`,
            action: 'POST',
            description: 'Log in as a user'
         },
         {
            rel: 'user',
            href: `${API_URL}/user/refresh`,
            action: 'GET',
            description: 'Renew access and refresh tokens'
         },
         {
            rel: 'user',
            href: `${API_URL}/user/logout`,
            action: 'GET',
            description: 'Destroy current refresh token and log out'
         },
         {
            rel: 'user',
            href: `${API_URL}/user/profile`,
            action: 'GET',
            description: 'Access user account information as a user'
         },
         {
            rel: 'user',
            href: `${API_URL}/user/profile`,
            action: 'PUT',
            description: 'Update user account information as a user'
         },
         {
            rel: 'user',
            href: `${API_URL}/user/profile`,
            action: 'DELETE',
            description: 'Delete account user account as a user'
         },
      ]
   }

   res.status(200).json(rootDocument)
})

export default router
