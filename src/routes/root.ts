import express from 'express'

const router = express.Router()

/**
 * Root route of the API.
 * 
 * @route   GET /
 * @access  Public
 */
router.get('/', (_, res) => {
   const rootDocument = {
      documentation: 'https://github.com/nmezhenskyi/gastronomy-api',
      links: [
         {
            rel: 'cocktail',
            href: 'http://localhost:3000/cocktails',
            action: 'GET',
            description: 'Find cocktail recipes'
         },
         {
            rel: 'meal',
            href: 'http://localhost:3000/meals',
            action: 'GET',
            description: 'Find meal recipes'
         },
         {
            rel: 'ingredient',
            href: 'http://localhost:3000/ingredients',
            action: 'GET',
            description: 'Find ingredients'
         }
      ]
   }

   res.status(200).json(rootDocument)
})

export default router
