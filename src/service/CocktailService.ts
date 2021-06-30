import { Cocktail } from '../models/Cocktail'
import ServiceResponse from './ServiceResponse'
import { getRepository } from 'typeorm'

export default class CocktailService {
   static async create(item: Cocktail): Promise<ServiceResponse> {
      try {
         const repository = getRepository(Cocktail)

         const saved = await repository.save(item)

         return { success: true, body: saved }
      }
      catch (err) {
         return { success: false, message: err }
      }
   }

   static async findAll(): Promise<ServiceResponse> {
      try {
         const repository = getRepository(Cocktail)

         const items = await repository.find()

         return { success: true, body: items }
      }
      catch (err) {
         return { success: false, message: err }
      }
   }
}
