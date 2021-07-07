import express from 'express'

const router = express.Router()

router.get('/', (_, res) => {
   const rootDocument = {
      documentation: 'https://github.com/nmezhenskyi/gastronomy-api',
      links: [
         {
            rel: 'ingredient',
            href: 'http://localhost:3000/ingredients',
            action: 'GET'
         }
      ]
   }

   res.status(200).json(rootDocument)
})

export default router
