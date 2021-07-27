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
            href: `${API_URL}/users`,
            action: 'POST',
            description: 'Register user account'
         },
         {
            rel: 'user',
            href: `${API_URL}/users/login`,
            action: 'POST',
            description: 'Log in as user'
         },
      ]
   }

   res.status(200).json(rootDocument)
})

export default router
