import 'reflect-metadata'
import express from 'express'
import { createConnection } from 'typeorm'
import { PORT } from './constants'

const app = express()

app.get('/', (_, res) => {
   res.status(200).json({ message: 'Welcome to GastronomyAPI' })
})

const start = async () => {
   try {
      await createConnection()

      app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
   }
   catch (err) {
      console.error(err)
   }
}

start()
