import 'reflect-metadata'
import express from 'express'
import { createConnection } from 'typeorm'
import { PORT } from './constants'
import cocktailsRouter from './routes/cocktails'

const app = express()

const start = async () => {
   try {
      await createConnection()

      app.use(express.json({ extended: false } as Parameters<typeof express.json>[0]))

      app.get('/', (_, res) => {
         res.status(200).json({ message: 'Welcome to GastronomyAPI' })
      })
      
      app.use('/cocktails', cocktailsRouter)

      app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
   }
   catch (err) {
      console.error(err)
   }
}

start()
