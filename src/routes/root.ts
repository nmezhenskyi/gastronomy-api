import express from 'express'

const router = express.Router()

router.get('/', (_, res) => {
   const rootDocument = {
      documentation: 'https://github.com/nmezhenskyi/gastronomy-api',
      links: [
         {
            rel: 'ingredient',
            href: 'http://localhost:3000/ingredients',
            action: 'GET',
            description: 'Get ingredients'
         },
         {
            rel: 'cocktail',
            href: 'http://localhost:3000/cocktails',
            action: 'GET',
            description: 'Get cocktail recipes'
         },
         {
            rel: 'meal',
            href: 'http://localhost:3000/meals',
            action: 'GET',
            description: 'Get meal recipes'
         }
      ]
   }

   res.status(200).json(rootDocument)
})

export default router
