import 'reflect-metadata'
import express from 'express'
import config from 'config'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { createConnection, ConnectionOptions } from 'typeorm'
import { PORT, PROD } from './common/constants'
import { logger } from './common/logger'
import rootRoute from './routes/root'
import ingredientsRoute from './routes/ingredients'
import cocktailsRoute from './routes/cocktails'
import userRoute from './routes/user'
import memberRoute from './routes/member'
import { handleNotFound } from './middleware/not-found'
import { cleanUpExpiredSessions } from './common/maintenance'

const app = express()

const start = async () => {
   try {
      // Database Connection:
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

      // Server Configuration:
      app.use(express.json({ extended: false } as Parameters<typeof express.json>[0]))
      app.use(cookieParser())
      app.use(cors({ credentials: true, origin: config.get('client.url') }))

      cleanUpExpiredSessions.start()
      
      // Routes:
      app.use('/', rootRoute)
      app.use('/ingredients', ingredientsRoute)
      app.use('/cocktails', cocktailsRoute)
      app.use('/user', userRoute)
      app.use('/member', memberRoute)
      app.use(handleNotFound)

      app.listen(PORT, () => logger.info(`Server started on port ${PORT}`))
   }
   catch (err) {
      logger.error(err)
   }
}

start()
