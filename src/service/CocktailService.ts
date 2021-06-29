import { Cocktail } from '../models/Cocktail'
import { getRepository } from 'typeorm'

export default class CocktailService {
   static async create(item: Cocktail) {
      const repository = getRepository(Cocktail)

      try {
         const saved = await repository.save(item)

         return { success: true, body: saved }
      }
      catch (err) {
         return { success: false, error: err }
      }
   }

   static async findAll() {
      const repository = getRepository(Cocktail)

      try {
         const items = await repository.find()

         return { success: true, body: items }
      }
      catch (err) {
         return { success: false, error: err }
      }
   }
}
