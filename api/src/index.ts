import 'reflect-metadata'
import express from 'express'
import config from 'config'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { createConnection, ConnectionOptions } from 'typeorm'
import { PORT, PROD, OPTIONS } from './common/constants'
import { router } from './routes/router'
import { notFoundHandler } from './middleware/not-found-handler'
import { errorHandler } from './middleware/error-handler'
import { cleanUpExpiredSessions } from './common/maintenance'
import { logger } from './common/logger'

// Server Configuration:
const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(cors({ credentials: true, origin: config.get('client.url') }))
app.use(router)
app.use(notFoundHandler)
app.use(errorHandler)

const main = async () => {
   try {
      // Database Connection:
      await createConnection({
         type: config.get('database.type'),
         host: config.get('database.host'),
         port: config.get('database.port'),
         username: config.get('database.username'),
         password: config.get('database.password'),
         database: config.get('database.name'),
         entities: config.get('typeorm.entities'),
         migrations: config.get('typeorm.migrations'),
         synchronize: !PROD,
         logging: OPTIONS.debug || OPTIONS.sqlLogs
      } as ConnectionOptions)

      cleanUpExpiredSessions.start()

      app.listen(PORT, () => logger.info(`Server started on port ${PORT}`))
   }
   catch (err: unknown) {
      logger.error(err)
   }
}

main()
