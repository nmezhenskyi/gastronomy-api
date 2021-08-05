import 'reflect-metadata'
import express from 'express'
import config from 'config'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { createConnection, ConnectionOptions } from 'typeorm'
import { PORT, PROD } from './common/constants'
import rootRoute from './routes/root'
import ingredientsRoute from './routes/ingredients'
import cocktailsRoute from './routes/cocktails'
import userRoute from './routes/user'
import memberRoute from './routes/member'

const app = express()

const start = async () => {
   try {
      await createConnection({
         type: config.get('database.type'),
         host: config.get('database.host'),
         port: config.get('database.port'),
         username: config.get('database.username'),
         password: config.get('database.password'),
         database: config.get('database.database-name'),
         entities: config.get('typeorm.entities'),
         migrations: config.get('typeorm.migrations'),
         synchronize: !PROD,
         logging: !PROD
      } as ConnectionOptions)

      app.use(express.json({ extended: false } as Parameters<typeof express.json>[0]))
      app.use(cookieParser())
      app.use(cors({ credentials: true, origin: config.get('client.url') }))
      
      // Routes:
      app.use('/', rootRoute)
      app.use('/ingredients', ingredientsRoute)
      app.use('/cocktails', cocktailsRoute)
      app.use('/user', userRoute)
      app.use('/member', memberRoute)

      app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
   }
   catch (err) {
      console.error(err)
   }
}

start()
