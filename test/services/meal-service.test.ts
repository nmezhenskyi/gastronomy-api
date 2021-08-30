import 'reflect-metadata'
import config from 'config'
import { createConnection, ConnectionOptions, Connection } from 'typeorm'
import typeorm = require('typeorm')
import { MealService } from '../../src/services/meal-service'
import { Meal } from '../../src/models/meal'
import { newMeal } from '../common/test-data'

describe('Meal Service Test Suite', () => {
   let connection: Connection

   beforeAll(async () => {
      connection = await createConnection({
         type: config.get('database.type'),
         host: config.get('database.host'),
         port: config.get('database.port'),
         username: config.get('database.username'),
         password: config.get('database.password'),
         database: config.get('database.database-name'),
         entities: config.get('typeorm.entities'),
         migrations: config.get('typeorm.migrations'),
         synchronize: false,
         logging: false
      } as ConnectionOptions)
   })

   afterAll(async () => {
      if (connection) await connection.close()
   })

   it('MealService.create()', async () => {
      typeorm.getRepository = jest.fn().mockReturnValue(connection.getRepository(Meal))

      const response = await MealService.create(newMeal)

      expect(response.success).toEqual(true)
      expect(response.message).toEqual('CREATED')
   })
})
