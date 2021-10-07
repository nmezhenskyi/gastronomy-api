import 'reflect-metadata'
import config from 'config'
import { createConnection, ConnectionOptions } from 'typeorm'
import { PROD } from '../common/constants'
import { setSupervisor } from './set-supervisor'

/**
 * This file should be executed as a deployment step before the first launch.
 */

const start = async () => {
   try {
      const connection = await createConnection({
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

      await setSupervisor()

      await connection.close()

      console.log('Deployment process have been completed')
   }
   catch (err) {
      console.error(err)
   }
}

start()
