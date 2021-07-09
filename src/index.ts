import 'reflect-metadata'
import express from 'express'
import { createConnection } from 'typeorm'
import { PORT } from './common/constants'
import rootRoute from './routes/root'
import ingredientsRoute from './routes/ingredients'
import cocktailsRoute from './routes/cocktails'

const app = express()

const start = async () => {
   try {
      await createConnection()

      app.use(express.json({ extended: false } as Parameters<typeof express.json>[0]))
      
      // Routes:
      app.use('/', rootRoute)
      app.use('/ingredients', ingredientsRoute)
      app.use('/cocktails', cocktailsRoute)

      app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
   }
   catch (err) {
      console.error(err)
   }
}

start()
